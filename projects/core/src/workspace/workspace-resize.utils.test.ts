// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  fitSizes,
  parseLayout,
  type WorkspaceLayout,
  type WorkspaceNode,
  type WorkspaceSplit
} from './workspace-layout.utils.js';
import { projectLayout } from './workspace-operations.utils.js';
import { rebaseProjectedSplit } from './workspace-resize.utils.js';

function group(...panels: string[]): WorkspaceNode {
  return { type: 'group', panels, active: panels[0] ?? '' };
}

function split(axis: WorkspaceSplit['axis'], weights: number[], ...children: WorkspaceNode[]): WorkspaceSplit {
  return { type: 'split', axis, weights, children };
}

function layout(root: WorkspaceNode): WorkspaceLayout {
  return { version: 1, root, closed: [] };
}

function projectedSplit(saved: WorkspaceLayout, available: string[]): WorkspaceSplit {
  const root = projectLayout(saved, available).root;
  if (root?.type !== 'split') throw new Error('Expected a visible split');
  return root;
}

describe('workspace resize projection', () => {
  it('preserves closed sibling shares and canonical shape while resizing the visible projection', () => {
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
    if (result.root?.type !== 'split') throw new Error('Expected a canonical split');
    expect(result.root.weights[0]).toBe(0.2);
    expect(result.root.weights[1]).toBeCloseTo(0.32);
    expect(result.root.weights[2]).toBeCloseTo(0.48);
    expect(parseLayout(JSON.stringify(result))).toEqual(result);
    expect(saved.root?.type === 'split' && saved.root.weights).toEqual([0.2, 0.3, 0.5]);
  });

  it('finds a split after a missing leading sibling collapses the saved root', () => {
    const vertical = split('vertical', [0.5, 0.5], group('a'), group('b'));
    const saved = layout(split('horizontal', [0.3, 0.7], group('missing'), vertical));
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
    const saved = layout(split('horizontal', [0.2, 0.8], group('a'), wrapper));
    const available = ['a', 'c', 'd'];
    const result = rebaseProjectedSplit(saved, projectedSplit(saved, available), [50, 20, 30], available);
    expect(result?.root).toEqual(
      split('horizontal', [0.5, 0.5], group('a'), {
        ...wrapper,
        children: [{ ...inner, weights: [0.4, 0.6] }, group('missing')]
      })
    );
    expect(projectedSplit(result ?? saved, available).weights).toEqual([0.5, 0.2, 0.3]);
    const renderedWidth = 112;
    const separatorWidth = 6;
    const visible = projectedSplit(result ?? saved, available);
    expect(fitSizes(visible.weights, [0, 0, 0], renderedWidth - separatorWidth * 2)).toEqual([50, 20, 30]);
    expect(parseLayout(JSON.stringify(result))).toEqual(result);
  });

  it('preserves the preferred share of unavailable immediate children', () => {
    const saved = layout(split('horizontal', [0.2, 0.3, 0.5], group('missing'), group('a'), group('b')));
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
    const saved = layout(split('horizontal', [0.5, 0.5], group('a'), nested));
    const available = ['a', 'c', 'd'];
    const result = rebaseProjectedSplit(saved, projectedSplit(saved, available), [80, 20], available);
    expect(result?.root).toEqual(split('horizontal', [0.8, 0.2], group('a'), nested));
    if (result?.root?.type !== 'split') throw new Error('Expected a saved split');
    expect(result.root.children[1]).toBe(nested);
    expect(parseLayout(JSON.stringify(result))).toEqual(result);
  });

  it('matches a nested branch using panel identities instead of its rendered path', () => {
    const nested = split('vertical', [0.5, 0.5], group('c'), group('d'));
    const saved = layout(split('horizontal', [0.2, 0.3, 0.5], group('missing'), group('a'), nested));
    const available = ['a', 'c', 'd'];
    const rendered = projectedSplit(saved, available).children[1];
    if (rendered?.type !== 'split') throw new Error('Expected a nested rendered split');
    const result = rebaseProjectedSplit(saved, rendered, [40, 60], available);
    expect(result?.root).toEqual(
      split('horizontal', [0.2, 0.3, 0.5], group('missing'), group('a'), { ...nested, weights: [0.4, 0.6] })
    );
  });

  it('does not report an effective resize with identical visible proportions', () => {
    const saved = layout(split('horizontal', [0.2, 0.3, 0.5], group('missing'), group('a'), group('b')));
    const available = ['a', 'b'];
    expect(rebaseProjectedSplit(saved, projectedSplit(saved, available), [300, 500], available)).toBeUndefined();
  });

  it('rejects stale branches and invalid achieved sizes', () => {
    const saved = layout(split('horizontal', [0.5, 0.5], group('a'), group('b')));
    const rendered = projectedSplit(saved, ['a', 'b']);
    expect(
      rebaseProjectedSplit(saved, split('horizontal', [0.5, 0.5], group('a'), group('stale')), [20, 80], ['a', 'b'])
    ).toBeUndefined();
    for (const sizes of [[10], [0, 10], [-10, 10], [NaN, 10], [Infinity, 10], [Number.MAX_VALUE, Number.MAX_VALUE]]) {
      expect(rebaseProjectedSplit(saved, rendered, sizes, ['a', 'b'])).toBeUndefined();
    }
  });
});
