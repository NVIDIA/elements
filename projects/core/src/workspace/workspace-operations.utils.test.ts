// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { type WorkspaceLayout, type WorkspacePane, parseLayout } from './workspace-layout.utils.js';
import {
  closePanel,
  placePanels,
  projectLayout,
  reconcilePanels,
  openPanel,
  detachedLayout
} from './workspace-operations.utils.js';

function pane(...panels: string[]): WorkspacePane {
  return { type: 'pane', panels, active: panels[0] ?? '' };
}

function layout(...panels: string[]): WorkspaceLayout {
  return { version: 1, root: panels.length ? pane(...panels) : null, closed: [] };
}

function split(): WorkspaceLayout {
  return {
    version: 1,
    root: {
      type: 'split',
      axis: 'horizontal',
      weights: [0.2, 0.3, 0.5],
      children: [pane('a', 'b'), pane('c'), pane('d')]
    },
    closed: []
  };
}

describe('workspace operations', () => {
  it('moves a tab into its own split and keeps the other tabs together', () => {
    const saved = layout('a', 'b', 'c');
    expect(placePanels({ layout: saved, source: ['b'], destination: { target: 'a', position: 'right' } })).toEqual({
      version: 1,
      root: { type: 'split', axis: 'horizontal', weights: [0.5, 0.5], children: [pane('a', 'c'), pane('b')] },
      closed: []
    });
    expect(saved).toEqual(layout('a', 'b', 'c'));
  });

  it('reorders against original insertion positions and retains the active tab', () => {
    const saved = layout('a', 'b', 'c', 'd');
    expect(
      placePanels({ layout: saved, source: ['a'], destination: { target: 'b', position: 'tab', index: 3 } })?.root
    ).toEqual({
      type: 'pane',
      panels: ['b', 'c', 'a', 'd'],
      active: 'a'
    });
    expect(
      placePanels({ layout: saved, source: ['c'], destination: { target: 'a', position: 'tab', index: 0 } })?.root
    ).toEqual({
      type: 'pane',
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
    if (saved.root?.type === 'split') saved.root.children[0] = { ...pane('a', 'b'), active: 'b' };
    expect(
      placePanels({ layout: saved, source: ['a', 'b'], destination: { target: 'c', position: 'tab', index: 0 } })
    ).toEqual({
      version: 1,
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [0.3 / 0.8, 0.5 / 0.8],
        children: [{ type: 'pane', panels: ['a', 'b', 'c'], active: 'b' }, pane('d')]
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
      children: [pane('a'), pane('b'), pane('c'), pane('d')]
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
        children: position === 'top' ? [pane('b'), pane('c')] : [pane('c'), pane('b')]
      });
    }
  });

  it('hides the active tab without rewriting canonical placement or selection', () => {
    const saved = layout('a', 'b');
    const hidden = closePanel(saved, 'a');
    expect(hidden).toEqual({ ...saved, closed: ['a'] });
    expect(hidden?.root).toBe(saved.root);
    expect(projectLayout(hidden!, ['a', 'b']).root).toEqual(pane('b'));
    expect(closePanel(saved, 'missing')).toBeUndefined();
    expect(saved).toEqual(layout('a', 'b'));
  });

  it('collapses all-hidden groups only in the visible projection and restores their exact preferences', () => {
    const saved = split();
    const hidden = closePanel(saved, 'c')!;
    expect(hidden.root).toEqual(saved.root);
    expect(projectLayout(hidden, ['a', 'b', 'c', 'd']).root).toEqual({
      type: 'split',
      axis: 'horizontal',
      weights: [0.2 / 0.7, 0.5 / 0.7],
      children: [pane('a', 'b'), pane('d')]
    });
    expect(openPanel(hidden, 'c')).toEqual(saved);
    const only = closePanel(layout('a'), 'a')!;
    expect(only.root).toEqual(pane('a'));
    expect(projectLayout(only, ['a']).root).toBeNull();
    expect(closePanel(only, 'a')).toBeUndefined();
    expect(openPanel(only, 'a')).toEqual(layout('a'));
    expect(openPanel(saved, 'a')).toBeUndefined();
  });

  it('moves closed companions with a whole group while a tab move leaves them at their canonical source', () => {
    const saved = closePanel(split(), 'b')!;
    const group = placePanels({ layout: saved, source: ['a', 'b'], destination: { target: 'c', position: 'tab' } })!;
    expect(group.closed).toEqual(['b']);
    expect(group.root?.type === 'split' && group.root.children[0]).toEqual({
      type: 'pane',
      panels: ['c', 'a', 'b'],
      active: 'a'
    });
    const tab = placePanels({ layout: saved, source: ['a'], destination: { target: 'c', position: 'tab' } })!;
    expect(tab.root?.type === 'split' && tab.root.children[0]).toEqual(pane('b'));
    expect(tab.closed).toEqual(['b']);
    expect(projectLayout(tab, ['a', 'b', 'c', 'd']).root?.type).toBe('split');
    expect(openPanel(tab, 'b')?.root).toEqual(tab.root);
  });

  it('preserves hidden ordering and preferred activity while visible tabs reorder', () => {
    const saved = closePanel(layout('a', 'b', 'c', 'd'), 'b')!;
    const moved = placePanels({
      layout: saved,
      source: ['d'],
      destination: { target: 'a', position: 'tab', index: 1 }
    })!;
    expect(moved.root).toEqual(pane('a', 'd', 'b', 'c'));
    expect(openPanel(moved, 'b')?.root).toEqual(pane('a', 'd', 'b', 'c'));
    expect(saved.root).toEqual(pane('a', 'b', 'c', 'd'));
  });

  it('reconciles new identities while retaining missing and closed identities', () => {
    const saved = closePanel(split(), 'a')!;
    const reconciled = reconcilePanels(saved, ['b', 'new', 'new', 'a']);
    expect(reconciled.root?.type === 'split' && reconciled.root.children[0]).toEqual(pane('a', 'b', 'new'));
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
        children: [pane('b'), pane('d')]
      },
      closed: []
    });
    expect(saved).toEqual(split());
    expect(projectLayout(saved, [])).toEqual(layout());
    expect(projectLayout(saved, ['d']).root).toEqual(pane('d'));
    expect(projectLayout(closePanel(saved, 'a')!, ['a', 'b']).root).toEqual(pane('b'));
  });

  it('returns independent arrays and schema-valid snapshots', () => {
    const saved = split();
    const reconciled = reconcilePanels(saved, []);
    const projected = projectLayout(saved, ['a', 'b', 'c', 'd', 'hidden']);
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
        children: [pane('moving'), pane('b'), pane('latent')]
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
        children: [pane('b'), pane('latent')]
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
        children: [pane('moving', 'missing'), pane('b', 'latent')]
      },
      closed: []
    };
    expect(detachedLayout(saved, ['moving', 'missing']).root).toEqual(pane('b', 'latent'));
    expect(detachedLayout({ ...saved, root: pane('moving') }, ['moving']).root).toBeNull();
  });

  it('selects the first remaining body when an active source tab is detached', () => {
    const saved: WorkspaceLayout = { version: 1, root: pane('moving', 'b', 'c'), closed: [] };
    expect(detachedLayout(saved, ['moving']).root).toEqual(pane('b', 'c'));
  });
});
