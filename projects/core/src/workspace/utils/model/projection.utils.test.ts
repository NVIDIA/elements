// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { projectLayout } from './operations.utils.js';
import {
  createWorkspaceLayoutProjector,
  findDeepestProjectionCarrier,
  getProjectionSignature,
  rebaseProjectedSplit
} from './projection.utils.js';
import { parseWorkspaceValue } from './value.utils.js';

import type { WorkspaceGroup, WorkspaceLayout, WorkspaceNode, WorkspaceSplit } from './layout.utils.js';

function group(...panels: string[]): WorkspaceGroup {
  return { type: 'group', panels, active: panels[0] ?? '' };
}

function split(axis: WorkspaceSplit['axis'], weights: number[], ...children: WorkspaceNode[]): WorkspaceSplit {
  return { type: 'split', axis, weights, children };
}

function createLayout(root: WorkspaceNode): WorkspaceLayout {
  return { version: 1, root, closed: [] };
}

function projectedSplit(saved: WorkspaceLayout, available: string[]): WorkspaceSplit {
  const root = projectLayout(saved, available).root;
  if (root?.type !== 'split') throw new Error('Expected a visible split');
  return root;
}

describe('workspace projection', () => {
  it('reuses equal visibility inputs and root identities within one evaluation', () => {
    const project = createWorkspaceLayoutProjector();
    const layout: WorkspaceLayout = {
      version: 1,
      root: { type: 'group', panels: ['a', 'b'], active: 'b' },
      closed: ['b']
    };
    const projected = project(layout, ['a', 'b']);
    expect(project({ ...layout, closed: ['b'] }, ['a', 'b'])).toBe(projected);
    expect(projected).toEqual(projectLayout(layout, ['a', 'b']));
    expect(projected.root).not.toBe(layout.root);
    expect(createWorkspaceLayoutProjector()(layout, ['a', 'b'])).not.toBe(projected);
  });

  it('distinguishes closed members, available members, candidate roots, and empty projections', () => {
    const project = createWorkspaceLayoutProjector();
    const layout: WorkspaceLayout = {
      version: 1,
      root: { type: 'group', panels: ['a', 'b'], active: 'b' },
      closed: []
    };
    const projected = project(layout, ['a', 'b']);
    const closed = project({ ...layout, closed: ['b'] }, ['a', 'b']);
    const otherClosed = project({ ...layout, closed: ['a'] }, ['a', 'b']);
    const missing = project(layout, ['b']);
    const otherMissing = project(layout, ['a']);
    const candidate = project({ ...layout, root: { type: 'group', panels: ['b', 'a'], active: 'a' } }, ['a', 'b']);
    expect(closed.root).toEqual({ type: 'group', panels: ['a'], active: 'a' });
    expect(otherClosed.root).toEqual({ type: 'group', panels: ['b'], active: 'b' });
    expect(missing.root).toEqual({ type: 'group', panels: ['b'], active: 'b' });
    expect(otherMissing.root).toEqual({ type: 'group', panels: ['a'], active: 'a' });
    expect(candidate.root).toEqual({ type: 'group', panels: ['b', 'a'], active: 'a' });
    expect(closed).not.toBe(projected);
    expect(missing).not.toBe(projected);
    expect(candidate).not.toBe(projected);
    const empty: WorkspaceLayout = { version: 1, root: null, closed: [] };
    expect(project(empty, ['a'])).toBe(project({ ...empty }, ['a']));
    expect(project(empty, ['a']).root).toBeNull();
  });
});

describe('workspace projection identity', () => {
  it('distinguishes topology and panel order while ignoring weights and active selection', () => {
    const root = split('horizontal', [1, 2], group('a', 'b'), group('c'));
    const signature = getProjectionSignature(root);
    expect(getProjectionSignature(split('horizontal', [3, 1], { ...group('a', 'b'), active: 'b' }, group('c')))).toBe(
      signature
    );
    expect(getProjectionSignature(split('vertical', [1, 2], group('a', 'b'), group('c')))).not.toBe(signature);
    expect(getProjectionSignature(split('horizontal', [1, 2], group('b', 'a'), group('c')))).not.toBe(signature);
    expect(getProjectionSignature(group('a', 'b', 'c'))).not.toBe(signature);
    expect(getProjectionSignature(null)).not.toBe(signature);
  });

  it('selects the deepest saved carrier when unavailable siblings collapse enclosing scopes', () => {
    const leaf = group('a', 'b');
    const inner = split('vertical', [1, 1], group('missing'), leaf);
    const root = split('horizontal', [1, 1], inner, group('also-missing'));
    const project = (node: WorkspaceNode) => projectLayout(createLayout(node), ['a', 'b']).root;

    expect(findDeepestProjectionCarrier(root, getProjectionSignature(leaf), project)).toBe(leaf);
    expect(findDeepestProjectionCarrier(root, getProjectionSignature(group('unknown')), project)).toBeUndefined();
    expect(findDeepestProjectionCarrier(null, getProjectionSignature(leaf), project)).toBeUndefined();
  });
});

describe('workspace resize projection', () => {
  it('keeps visibility domains and new sizes distinct when sharing a scoped projector', () => {
    const saved = createLayout(split('horizontal', [0.2, 0.3, 0.5], group('hidden'), group('a'), group('b')));
    const available = ['hidden', 'a', 'b'];
    const project = createWorkspaceLayoutProjector();
    for (const sample of [
      { closed: ['hidden'], sizes: [320, 480], weights: [0.2, 0.32, 0.48] },
      { closed: [], sizes: [100, 300, 600], weights: [0.1, 0.3, 0.6] },
      { closed: ['hidden'], sizes: [600, 400], weights: [0.2, 0.48, 0.32] }
    ]) {
      const current = { ...saved, closed: sample.closed };
      const result = rebaseProjectedSplit(
        current,
        projectedSplit(current, available),
        sample.sizes,
        available,
        project
      );
      if (result?.root?.type !== 'split') throw new Error('Expected a rebased split');
      expect(result.closed).toEqual(sample.closed);
      result.root.weights.forEach((weight, index) => expect(weight).toBeCloseTo(sample.weights[index]!, 10));
    }
    expect(saved.root?.type === 'split' && saved.root.weights).toEqual([0.2, 0.3, 0.5]);
  });

  it('preserves closed sibling shares and saved shape while resizing the visible projection', () => {
    const saved: WorkspaceLayout = {
      version: 1,
      root: split('horizontal', [0.2, 0.3, 0.5], group('hidden'), group('a'), group('b')),
      closed: ['hidden']
    };
    const available = ['hidden', 'a', 'b'];
    const result = rebaseProjectedSplit(saved, projectedSplit(saved, available), [320, 480], available)!;
    expect(result.closed).toEqual(['hidden']);
    expect(result.root?.type === 'split' && result.root.children).toEqual(
      saved.root?.type === 'split' && saved.root.children
    );
    if (result.root?.type !== 'split') throw new Error('Expected a saved split');
    expect(result.root.weights[0]).toBe(0.2);
    expect(result.root.weights[1]).toBeCloseTo(0.32);
    expect(result.root.weights[2]).toBeCloseTo(0.48);
    expect(parseWorkspaceValue(JSON.stringify(result))).toEqual(result);
    expect(saved.root?.type === 'split' && saved.root.weights).toEqual([0.2, 0.3, 0.5]);
  });

  it('finds a split after a missing leading sibling collapses the saved root', () => {
    const vertical = split('vertical', [0.5, 0.5], group('a'), group('b'));
    const saved = createLayout(split('horizontal', [0.3, 0.7], group('missing'), vertical));
    const snapshot = JSON.stringify(saved);
    const result = rebaseProjectedSplit(saved, projectedSplit(saved, ['a', 'b']), [25, 75], ['a', 'b']);
    expect(result?.root).toEqual(
      split('horizontal', [0.3, 0.7], group('missing'), { ...vertical, weights: [0.25, 0.75] })
    );
    expect(JSON.stringify(saved)).toBe(snapshot);
    expect(projectedSplit(result ?? saved, ['a', 'b']).weights).toEqual([0.25, 0.75]);
  });

  it('rebases both same-axis levels exposed by collapsing an opposite-axis wrapper', () => {
    const inner = split('horizontal', [0.5, 0.5], group('c'), group('d'));
    const wrapper = split('vertical', [0.3, 0.7], inner, group('missing'));
    const saved = createLayout(split('horizontal', [0.2, 0.8], group('a'), wrapper));
    const available = ['a', 'c', 'd'];
    const result = rebaseProjectedSplit(saved, projectedSplit(saved, available), [50, 20, 30], available);
    expect(result?.root).toEqual(
      split('horizontal', [0.5, 0.5], group('a'), {
        ...wrapper,
        children: [{ ...inner, weights: [0.4, 0.6] }, group('missing')]
      })
    );
    expect(projectedSplit(result ?? saved, available).weights).toEqual([0.5, 0.2, 0.3]);
  });

  it('preserves the preferred share of unavailable immediate children', () => {
    const saved = createLayout(split('horizontal', [0.2, 0.3, 0.5], group('missing'), group('a'), group('b')));
    const available = ['a', 'b'];
    const result = rebaseProjectedSplit(saved, projectedSplit(saved, available), [25, 75], available);
    expect(result?.root).toEqual(
      split('horizontal', [0.2, 0.2, 0.6000000000000001], group('missing'), group('a'), group('b'))
    );
    const visible = projectedSplit(result ?? saved, available);
    expect(visible.weights[0]).toBeCloseTo(0.25);
    expect(visible.weights[1]).toBeCloseTo(0.75);
    expect(result?.closed).toEqual([]);
  });

  it('preserves a perpendicular visible child and its missing active panel', () => {
    const nested = split('vertical', [0.3, 0.7], group('missing-active', 'c'), group('d'));
    const saved = createLayout(split('horizontal', [0.5, 0.5], group('a'), nested));
    const available = ['a', 'c', 'd'];
    const result = rebaseProjectedSplit(saved, projectedSplit(saved, available), [80, 20], available);
    expect(result?.root).toEqual(split('horizontal', [0.8, 0.2], group('a'), nested));
    if (result?.root?.type !== 'split') throw new Error('Expected a saved split');
    expect(result.root.children[1]).toBe(nested);
  });

  it('matches a nested branch using panel identities instead of its rendered path', () => {
    const nested = split('vertical', [0.5, 0.5], group('c'), group('d'));
    const saved = createLayout(split('horizontal', [0.2, 0.3, 0.5], group('missing'), group('a'), nested));
    const available = ['a', 'c', 'd'];
    const rendered = projectedSplit(saved, available).children[1];
    if (rendered?.type !== 'split') throw new Error('Expected a nested rendered split');
    const result = rebaseProjectedSplit(saved, rendered, [40, 60], available);
    expect(result?.root).toEqual(
      split('horizontal', [0.2, 0.3, 0.5], group('missing'), group('a'), { ...nested, weights: [0.4, 0.6] })
    );
  });

  it('does not report an effective resize with identical visible proportions', () => {
    const saved = createLayout(split('horizontal', [0.2, 0.3, 0.5], group('missing'), group('a'), group('b')));
    const available = ['a', 'b'];
    expect(rebaseProjectedSplit(saved, projectedSplit(saved, available), [300, 500], available)).toBeUndefined();
  });

  it('rejects stale branches and invalid achieved sizes', () => {
    const saved = createLayout(split('horizontal', [0.5, 0.5], group('a'), group('b')));
    const rendered = projectedSplit(saved, ['a', 'b']);
    expect(
      rebaseProjectedSplit(saved, split('horizontal', [0.5, 0.5], group('a'), group('stale')), [20, 80], ['a', 'b'])
    ).toBeUndefined();
    for (const sizes of [[10], [0, 10], [-10, 10], [NaN, 10], [Infinity, 10], [Number.MAX_VALUE, Number.MAX_VALUE]]) {
      expect(rebaseProjectedSplit(saved, rendered, sizes, ['a', 'b'])).toBeUndefined();
    }
  });
});
