// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Dimensions, Rect } from '@nvidia-elements/core/internal';

import {
  createInsertionOffers,
  findSourcePeerRegionKey,
  getCurrentInsertionSeam,
  getOrderHintRect,
  getPlacementOfferIntent,
  partitionPlacementOffers,
  placementOwnsChrome
} from './insertion-offers.utils.js';

import { getPanelIds } from '../model/layout.utils.js';
import { createDetachedLayout } from '../model/operations.utils.js';
import { WorkspaceEvaluation } from '../evaluation.utils.js';

import type { WorkspaceInsertionOffer } from './insertion-offers.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from '../model/layout.utils.js';

import '../../define.js';

const offer: WorkspaceInsertionOffer = {
  kind: 'insert',
  owner: 'root',
  scope: { key: 'between-b-c', axis: 'horizontal', index: 1, members: ['b', 'c'], previous: ['b'], next: ['c'] },
  plan: {
    kind: 'insert',
    layout: { version: 1, closed: [], root: { type: 'group', panels: ['a', 'b'], active: 'a' } }
  },
  rect: { x: 24, y: 24, width: 12, height: 12 },
  scopeRect: { x: 0, y: 0, width: 100, height: 100 },
  destination: { target: 'c', region: 'root.1', position: 'left' }
};

describe('workspace insertion offer ownership', () => {
  it('preserves the spatial operation and rejects a tab destination', () => {
    expect(getPlacementOfferIntent(offer)).toEqual({ kind: 'insert', destination: offer.destination });
    expect(getPlacementOfferIntent({ ...offer, kind: 'order' })).toEqual({
      kind: 'order',
      destination: offer.destination
    });
    expect(getPlacementOfferIntent({ ...offer, destination: { ...offer.destination, position: 'tab' } })).toEqual({
      kind: 'invalid'
    });
  });

  it('gives chrome priority to peer lanes, receiving endcaps, and interior child slots', () => {
    expect(placementOwnsChrome({ ...offer, kind: 'order' })).toBe(true);
    expect(placementOwnsChrome({ ...offer, boundary: 'start' })).toBe(true);
    expect(placementOwnsChrome(offer)).toBe(true);
    expect(placementOwnsChrome({ ...offer, destination: { ...offer.destination, region: 'root.1.1' } })).toBe(false);
    expect(placementOwnsChrome({ ...offer, scope: { ...offer.scope, previous: undefined } })).toBe(false);
  });

  it('finds the enclosing peer owner only for a complete source group', () => {
    const group: WorkspaceNode = { type: 'group', panels: ['a', 'companion'], active: 'a' };
    const root: WorkspaceNode = {
      type: 'split',
      axis: 'horizontal',
      weights: [1, 1],
      children: [
        { type: 'group', panels: ['b'], active: 'b' },
        {
          type: 'split',
          axis: 'vertical',
          weights: [1, 1],
          children: [group, { type: 'group', panels: ['c'], active: 'c' }]
        }
      ]
    };

    expect(findSourcePeerRegionKey(root, ['b'])).toBe('root');
    expect(findSourcePeerRegionKey(root, ['a', 'companion'])).toBe('root.1');
    expect(findSourcePeerRegionKey(root, ['a'])).toBeUndefined();
    expect(findSourcePeerRegionKey(group, ['a', 'companion'])).toBeUndefined();
  });
});

describe('workspace ordering hint geometry', () => {
  it.each([
    {
      axis: 'horizontal',
      owner: { x: 0, y: 0, width: 900, height: 600 },
      first: { x: 0, y: 0, width: 447, height: 600 },
      last: { x: 453, y: 0, width: 447, height: 600 },
      expected: [0, 444, 888]
    },
    {
      axis: 'horizontal',
      owner: { x: 0, y: 0, width: 900, height: 600 },
      first: { x: 0, y: 0, width: 223.5, height: 600 },
      last: { x: 229.5, y: 0, width: 670.5, height: 600 },
      expected: [0, 220.5, 888]
    },
    {
      axis: 'vertical',
      owner: { x: 0, y: 0, width: 900, height: 600 },
      first: { x: 0, y: 0, width: 900, height: 148.5 },
      last: { x: 0, y: 154.5, width: 900, height: 445.5 },
      expected: [0, 145.5, 588]
    }
  ] as const)(
    'uses the current $axis peer gaps for allocated sizes $expected',
    ({ axis, owner, first, last, expected }) => {
      const descriptors = [
        { recipient: first, after: false },
        { recipient: last, previous: first, after: false },
        { recipient: last, after: true }
      ].map(slot => getOrderHintRect({ ...slot, owner, axis })!);

      expect(descriptors.map(rect => (axis === 'horizontal' ? rect.x : rect.y))).toEqual(expected);
      expect(descriptors[1]![axis === 'horizontal' ? 'width' : 'height']).toBe(12);
    }
  );

  it('anchors a retained source slot between its current neighbors', () => {
    const owner = { x: 0, y: 0, width: 900, height: 300 };
    const first = { x: 0, y: 0, width: 200, height: 300 };
    const slot = { x: 300, y: 0, width: 200, height: 300 };
    const last = { x: 600, y: 0, width: 300, height: 300 };

    expect(
      getOrderHintRect({ owner, recipient: last, previous: first, sourceSlot: slot, axis: 'horizontal', after: false })
    ).toEqual({ x: 244, y: 0, width: 12, height: 300 });
    expect(getOrderHintRect({ owner, recipient: first, sourceSlot: slot, axis: 'horizontal', after: true })).toEqual({
      x: 244,
      y: 0,
      width: 12,
      height: 300
    });
  });
});

describe('workspace insertion offer lanes', () => {
  it.each([
    { side: 'left', axis: 'x', next: 36 },
    { side: 'right', axis: 'x', next: 12 },
    { side: 'top', axis: 'y', next: 36 },
    { side: 'bottom', axis: 'y', next: 12 }
  ] as const)('partitions square cues along the $side destination axis', ({ side, axis, next }) => {
    const square = { ...offer, destination: { ...offer.destination, position: side } };
    const partitioned = partitionPlacementOffers([square, { ...square, owner: 'other' }]);

    expect(partitioned.map(item => item.rect[axis])).toEqual([24, next]);
    expect(square.rect).toEqual({ x: 24, y: 24, width: 12, height: 12 });
  });
});

describe('workspace insertion offer discovery', () => {
  afterEach(() => vi.restoreAllMocks());
  const group = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels[0]! });
  const root = (grouped = true): WorkspaceNode => ({
    type: 'split',
    axis: 'horizontal',
    weights: [0.4, 0.6],
    children: [
      grouped ? group('a', 'companion') : group('a'),
      { type: 'split', axis: 'vertical', weights: [0.5, 0.5], children: [group('b'), group('c')] }
    ]
  });
  const bounds = { x: 0, y: 0, width: 600, height: 300 };

  function createCatalog(
    currentLayout: WorkspaceLayout,
    options: { source: string[]; gap?: number; bounds?: Rect; minimum?: Dimensions }
  ) {
    const { source, gap = 6, bounds: frame = bounds, minimum = { width: 0, height: 0 } } = options;
    const host = document.createElement('div');
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(new DOMRect(frame.x, frame.y, frame.width, frame.height));
    const panels = getPanelIds(currentLayout.root).map(id => {
      const panel = document.createElement('nve-workspace-panel');
      panel.id = id;
      panel.minWidth = minimum.width;
      panel.minHeight = minimum.height;
      return panel;
    });
    const evaluation = new WorkspaceEvaluation(host, {
      panels,
      layout: currentLayout,
      source,
      measurements: { ...frame, gap, headerHeight: 0, gripWidth: 0, actionWidth: 0, tabWidth: 0, tabMinWidth: 0 },
      policy: 'stop',
      strip: () => null
    });
    return (layout: WorkspaceLayout) => evaluation.targetCatalog(source, evaluation.geometry(layout)).regions;
  }

  function setup(grouped = true, source = grouped ? ['companion'] : ['a'], gap = 6) {
    const currentLayout: WorkspaceLayout = { version: 1, root: root(grouped), closed: [] };
    const available = grouped ? ['a', 'companion', 'b', 'c'] : ['a', 'b', 'c'];
    const catalog = createCatalog(currentLayout, { source, gap });
    const regions = catalog(createDetachedLayout(currentLayout, source));
    return { gap, currentLayout, source, available, regions, root: currentLayout.root, existing: [] };
  }

  it.each([0, 12])('locates interior insertion seams with a %ipx group gap', gap => {
    const input = setup(true, ['companion'], gap);
    const hint = createInsertionOffers(input).find(
      candidate => candidate.scope.previous?.includes('b') && candidate.scope.next?.includes('c')
    );
    expect(hint).toBeDefined();
    expect(getCurrentInsertionSeam(hint!, input)).toBeDefined();
  });

  it('keeps a partial-tab receiving endcap on its structural owner after a root reservation', () => {
    const input = setup();
    const initial = createInsertionOffers(input);
    const outer = initial.find(hint => hint.owner === 'root' && hint.destination.position === 'bottom')!;
    const catalog = createCatalog(input.currentLayout, { source: input.source });
    const regions = catalog(outer.plan.layout);
    const local = createInsertionOffers({ ...input, regions, explorationRegions: input.regions }).find(
      hint => hint.owner === 'root.1' && hint.destination.position === 'bottom'
    )!;
    const original = initial.find(hint => hint.scope.key === local.scope.key)!;
    expect(local.rect).toEqual(original.rect);
    expect(local.scopeRect).toEqual(original.scopeRect);
    expect(local.scopeRect.y + local.scopeRect.height).toBe(bounds.height);
    expect(local.scope.members).toEqual(['b', 'c']);
  });

  it.each(['top', 'bottom', 'left', 'right'] as const)('exposes a real %s root insertion for a partial tab', side => {
    const input = setup();
    const hints = createInsertionOffers(input);
    const hint = hints.find(h => h.destination.region === 'root' && h.destination.position === side)!;
    expect(hint).toBeDefined();
    expect(getPlacementOfferIntent(hint).kind).toBe('insert');
    expect(side === 'left' || side === 'right' ? hint.rect.width : hint.rect.height).toBe(12);
  });

  it('deduplicates BC-right/root-right while keeping distinct root-top and BC-top lanes', () => {
    const input = setup();
    const right = createInsertionOffers(input);
    expect(right.filter(h => h.destination.position === 'right')).toHaveLength(1);
    const top = partitionPlacementOffers(createInsertionOffers(input)).filter(
      h => h.destination.position === 'top' && h.boundary
    );
    expect(top.map(h => h.rect.y)).toEqual([0, 12]);
    expect(new Set(top.map(h => h.scope.key)).size).toBe(2);
  });

  it('normalizes a collapsed whole-source root to three peers without a phantom half-size lane', () => {
    const input = setup(false);
    const hints = createInsertionOffers(input).filter(h => h.destination.position === 'top' && h.boundary);
    expect(hints).toHaveLength(1);
    const intent = getPlacementOfferIntent(hints[0]!);
    if (intent.kind !== 'insert') throw new Error('Expected insertion');
    const plan = hints[0]!.plan;
    if (plan.layout.root?.type !== 'split') throw new Error('Expected normalized owner');
    expect(plan.layout.root.weights).toEqual([1 / 3, 1 / 3, 1 / 3]);
  });
});
