// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { type WorkspaceLayout, type WorkspaceGroup, parseLayout } from './workspace-layout.utils.js';
import {
  closePanel,
  placePanels,
  projectLayout,
  reconcilePanels,
  openPanel,
  detachedLayout
} from './workspace-operations.utils.js';

function group(...panels: string[]): WorkspaceGroup {
  return { type: 'group', panels, active: panels[0] ?? '' };
}

function layout(...panels: string[]): WorkspaceLayout {
  return { version: 1, root: panels.length ? group(...panels) : null, closed: [] };
}

function split(): WorkspaceLayout {
  return {
    version: 1,
    root: {
      type: 'split',
      axis: 'horizontal',
      weights: [0.2, 0.3, 0.5],
      children: [group('a', 'b'), group('c'), group('d')]
    },
    closed: []
  };
}

describe('workspace operations', () => {
  it('moves a tab into its own split and keeps the other tabs together', () => {
    const saved = layout('a', 'b', 'c');
    expect(placePanels({ layout: saved, source: ['b'], destination: { target: 'a', position: 'right' } })).toEqual({
      version: 1,
      root: { type: 'split', axis: 'horizontal', weights: [0.5, 0.5], children: [group('a', 'c'), group('b')] },
      closed: []
    });
    expect(saved).toEqual(layout('a', 'b', 'c'));
  });

  it('reorders against original insertion positions and retains the active tab', () => {
    const saved = layout('a', 'b', 'c', 'd');
    expect(
      placePanels({ layout: saved, source: ['a'], destination: { target: 'b', position: 'tab', index: 3 } })?.root
    ).toEqual({
      type: 'group',
      panels: ['b', 'c', 'a', 'd'],
      active: 'a'
    });
    expect(
      placePanels({ layout: saved, source: ['c'], destination: { target: 'a', position: 'tab', index: 0 } })?.root
    ).toEqual({
      type: 'group',
      panels: ['c', 'a', 'b', 'd'],
      active: 'a'
    });
  });

  it('returns the original layout for a valid unchanged tab placement', () => {
    const saved = layout('a', 'b', 'c');
    expect(placePanels({ layout: saved, source: ['b'], destination: { target: 'a', position: 'tab', index: 1 } })).toBe(
      saved
    );
    expect(placePanels({ layout: saved, source: ['b'], destination: { target: 'a', position: 'tab', index: 2 } })).toBe(
      saved
    );
  });

  it('moves a complete ordered group and preserves its active tab', () => {
    const saved = split();
    if (saved.root?.type === 'split') saved.root.children[0] = { ...group('a', 'b'), active: 'b' };
    expect(
      placePanels({ layout: saved, source: ['a', 'b'], destination: { target: 'c', position: 'tab', index: 0 } })
    ).toEqual({
      version: 1,
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [0.3 / 0.8, 0.5 / 0.8],
        children: [{ type: 'group', panels: ['a', 'b', 'c'], active: 'b' }, group('d')]
      },
      closed: []
    });
  });

  it('rejects missing anchors, repeated sources, partial groups, and invalid indices', () => {
    const saved = layout('a', 'b', 'c');
    for (const source of [[], ['missing'], ['a', 'a'], ['a', 'b'], ['c', 'b', 'a']]) {
      expect(
        placePanels({ layout: saved, source: source, destination: { target: 'c', position: 'left' } })
      ).toBeUndefined();
    }
    expect(placePanels({ layout: saved, source: ['a', 'b', 'c'], destination: { target: 'c', position: 'tab' } })).toBe(
      saved
    );
    expect(
      placePanels({ layout: saved, source: ['a'], destination: { target: 'missing', position: 'tab' } })
    ).toBeUndefined();
    expect(
      placePanels({ layout: saved, source: ['a'], destination: { target: 'b', position: 'tab', index: -1 } })
    ).toBeUndefined();
    expect(
      placePanels({ layout: saved, source: ['a'], destination: { target: 'b', position: 'tab', index: 0.5 } })
    ).toBeUndefined();
  });

  it('flattens splits on the same axis and preserves sibling proportions', () => {
    const moved = placePanels({ layout: split(), source: ['b'], destination: { target: 'c', position: 'left' } });
    expect(moved?.root).toEqual({
      type: 'split',
      axis: 'horizontal',
      weights: [0.2, 0.15, 0.15, 0.5],
      children: [group('a'), group('b'), group('c'), group('d')]
    });
  });

  it('retains alternating axes for top and bottom destinations', () => {
    for (const position of ['top', 'bottom'] as const) {
      const moved = placePanels({ layout: split(), source: ['b'], destination: { target: 'c', position } });
      expect(moved?.root?.type).toBe('split');
      if (moved?.root?.type !== 'split') throw new Error('Expected a split');
      expect(moved.root.children[1]).toEqual({
        type: 'split',
        axis: 'vertical',
        weights: [0.5, 0.5],
        children: position === 'top' ? [group('b'), group('c')] : [group('c'), group('b')]
      });
    }
  });

  it('closes the active tab without rewriting canonical placement or selection', () => {
    const saved = layout('a', 'b');
    const closed = closePanel(saved, 'a');
    expect(closed).toEqual({ ...saved, closed: ['a'] });
    expect(closed?.root).toBe(saved.root);
    expect(projectLayout(closed!, ['a', 'b']).root).toEqual(group('b'));
    expect(closePanel(saved, 'missing')).toBeUndefined();
    expect(saved).toEqual(layout('a', 'b'));
  });

  it('collapses all-closed groups only in the visible projection and restores their exact preferences', () => {
    const saved = split();
    const closed = closePanel(saved, 'c')!;
    expect(closed.root).toEqual(saved.root);
    expect(projectLayout(closed, ['a', 'b', 'c', 'd']).root).toEqual({
      type: 'split',
      axis: 'horizontal',
      weights: [0.2 / 0.7, 0.5 / 0.7],
      children: [group('a', 'b'), group('d')]
    });
    expect(openPanel(closed, 'c')).toEqual(saved);
    const only = closePanel(layout('a'), 'a')!;
    expect(only.root).toEqual(group('a'));
    expect(projectLayout(only, ['a']).root).toBeNull();
    expect(closePanel(only, 'a')).toBeUndefined();
    expect(openPanel(only, 'a')).toEqual(layout('a'));
    expect(openPanel(saved, 'a')).toBeUndefined();
  });

  it('moves closed companions with a whole group while a tab move leaves them at their canonical source', () => {
    const saved = closePanel(split(), 'b')!;
    const moved = placePanels({ layout: saved, source: ['a', 'b'], destination: { target: 'c', position: 'tab' } })!;
    expect(moved.closed).toEqual(['b']);
    expect(moved.root?.type === 'split' && moved.root.children[0]).toEqual({
      type: 'group',
      panels: ['c', 'a', 'b'],
      active: 'a'
    });
    const tab = placePanels({ layout: saved, source: ['a'], destination: { target: 'c', position: 'tab' } })!;
    expect(tab.root?.type === 'split' && tab.root.children[0]).toEqual(group('b'));
    expect(tab.closed).toEqual(['b']);
    expect(projectLayout(tab, ['a', 'b', 'c', 'd']).root?.type).toBe('split');
    expect(openPanel(tab, 'b')?.root).toEqual(tab.root);
  });

  it('preserves closed-tab ordering and preferred activity while visible tabs reorder', () => {
    const saved = closePanel(layout('a', 'b', 'c', 'd'), 'b')!;
    const moved = placePanels({
      layout: saved,
      source: ['d'],
      destination: { target: 'a', position: 'tab', index: 1 }
    })!;
    expect(moved.root).toEqual(group('a', 'd', 'b', 'c'));
    expect(openPanel(moved, 'b')?.root).toEqual(group('a', 'd', 'b', 'c'));
    expect(saved.root).toEqual(group('a', 'b', 'c', 'd'));
  });

  it('reconciles new identities while retaining missing and closed identities', () => {
    const saved = closePanel(split(), 'a')!;
    const reconciled = reconcilePanels(saved, ['b', 'new', 'new', 'a']);
    expect(reconciled.root?.type === 'split' && reconciled.root.children[0]).toEqual(group('a', 'b', 'new'));
    expect(reconciled.closed).toEqual(['a']);
    expect(reconcilePanels(saved, ['b'])).toEqual(saved);
    expect(reconcilePanels(layout(), ['x', 'x', 'y'])).toEqual(layout('x', 'y'));
  });

  it('projects available identities without losing the saved active identity', () => {
    const saved = split();
    expect(projectLayout(saved, ['b', 'd'])).toEqual({
      version: 1,
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [0.2 / 0.7, 0.5 / 0.7],
        children: [group('b'), group('d')]
      },
      closed: []
    });
    expect(saved).toEqual(split());
    expect(projectLayout(saved, [])).toEqual(layout());
    expect(projectLayout(saved, ['d']).root).toEqual(group('d'));
    expect(projectLayout(closePanel(saved, 'a')!, ['a', 'b']).root).toEqual(group('b'));
  });

  it('returns independent arrays and schema-valid snapshots', () => {
    const saved = split();
    const reconciled = reconcilePanels(saved, []);
    const projected = projectLayout(saved, ['a', 'b', 'c', 'd', 'closed']);
    for (const result of [reconciled, projected]) {
      expect(result.closed).not.toBe(saved.closed);
      expect(parseLayout(JSON.stringify(result))).toEqual(result);
      if (result.root?.type !== 'split' || saved.root?.type !== 'split') throw new Error('Expected splits');
    }
  });
});

describe('workspace detached projection', () => {
  it('detaches a source once while preserving latent identities and saved state', () => {
    const saved: WorkspaceLayout = {
      version: 1,
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [0.2, 0.3, 0.5],
        children: [group('moving'), group('b'), group('latent')]
      },
      closed: ['latent']
    };
    const original = JSON.stringify(saved);
    expect(detachedLayout(saved, ['moving'])).toEqual({
      ...saved,
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [0.3 / 0.8, 0.5 / 0.8],
        children: [group('b'), group('latent')]
      }
    });
    expect(JSON.stringify(saved)).toBe(original);
  });

  it('collapses an entire source group including unavailable members', () => {
    const saved: WorkspaceLayout = {
      version: 1,
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [0.5, 0.5],
        children: [group('moving', 'missing'), group('b', 'latent')]
      },
      closed: []
    };
    expect(detachedLayout(saved, ['moving', 'missing']).root).toEqual(group('b', 'latent'));
    expect(detachedLayout({ ...saved, root: group('moving') }, ['moving']).root).toBeNull();
  });

  it('selects the first remaining body when an active source tab is detached', () => {
    const saved: WorkspaceLayout = { version: 1, root: group('moving', 'b', 'c'), closed: [] };
    expect(detachedLayout(saved, ['moving']).root).toEqual(group('b', 'c'));
  });
});
