// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { WorkspaceNode, WorkspaceLayout } from './workspace-layout.utils.js';
import { allocateWorkspace } from './workspace-placement.utils.js';
import { detachedLayout } from './workspace-operations.utils.js';
import { computedRegionCatalog } from './workspace-targeting.utils.js';
import {
  insertionHints,
  currentInsertionSeam,
  placementOfferIntent,
  orderHintRect,
  partitionPlacementOffers
} from './workspace-offers.utils.js';
import { planWorkspacePlacement } from './workspace-planner.utils.js';
import { describePlacementSlot } from './workspace-group-insertion.utils.js';
import { boundaryPlacementOffers, boundarySide } from './workspace-boundary.utils.js';
import { decidePlacement } from './workspace-placement-decision.utils.js';

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

function setup(grouped = true, source = grouped ? ['companion'] : ['a'], gap = 6) {
  const saved: WorkspaceLayout = { version: 1, root: root(grouped), closed: [] };
  const available = grouped ? ['a', 'companion', 'b', 'c'] : ['a', 'b', 'c'];
  const allocate = (node: WorkspaceNode | null) =>
    allocateWorkspace({ gap, root: node, rect: bounds, minimum: () => ({ width: 0, height: 0 }), policy: 'stop' })
      .regions;
  const regions = computedRegionCatalog({
    saved,
    catalog: allocate(saved.root),
    allocation: allocate(detachedLayout(saved, source).root),
    source,
    available,
    bounds
  });
  return { gap, saved, source, available, regions, root: saved.root, existing: [] };
}

describe('workspace placement hints', () => {
  it.each([0, 12])('locates interior insertion seams with a %ipx group gap', gap => {
    const input = setup(true, ['companion'], gap);
    const hint = insertionHints(input).find(
      offer => offer.scope.previous?.includes('b') && offer.scope.next?.includes('c')
    );
    expect(hint).toBeDefined();
    expect(currentInsertionSeam(hint!, input)).toBeDefined();
  });

  it.each(['horizontal', 'vertical'] as const)(
    'offers the interior of a %s receiving arrangement to an incoming group',
    axis => {
      const saved: WorkspaceLayout = {
        version: 1,
        closed: [],
        root: {
          type: 'split',
          axis: axis === 'horizontal' ? 'vertical' : 'horizontal',
          weights: [2, 3],
          children: [
            group('a', 'companion'),
            { type: 'split', axis, weights: [1, 4], children: [group('b'), group('c')] }
          ]
        }
      };
      const source = ['a', 'companion'];
      const available = ['a', 'companion', 'b', 'c'];
      const allocate = (layout: WorkspaceLayout) =>
        allocateWorkspace({
          gap: 6,
          root: layout.root,
          rect: bounds,
          minimum: () => ({ width: 0, height: 0 }),
          policy: 'stop'
        });
      const regions = computedRegionCatalog({
        saved,
        catalog: allocate(saved).regions,
        allocation: allocate(detachedLayout(saved, source)).regions,
        source,
        available,
        bounds
      });
      const hints = insertionHints({ gap: 6, saved, source, available, regions, root: saved.root, existing: [] });
      const hint = hints.find(offer => offer.scope.previous?.includes('b') && offer.scope.next?.includes('c'));
      expect(hint?.kind).toBe('insert');
      expect(hint?.scope.axis).toBe(axis);
      const previous = regions.find(region => region.node.type === 'group' && region.node.panels.includes('b'))!.rect;
      const next = regions.find(region => region.node.type === 'group' && region.node.panels.includes('c'))!.rect;
      const normal = axis === 'horizontal' ? 'x' : 'y';
      const extent = axis === 'horizontal' ? 'width' : 'height';
      expect(hint!.rect[normal] + 6).toBeCloseTo((previous[normal] + previous[extent] + next[normal]) / 2);
      const point = { x: hint!.rect.x + hint!.rect.width / 2, y: hint!.rect.y + hint!.rect.height / 2 };
      const decision = decidePlacement({
        saved,
        source,
        available,
        regions,
        bounds,
        point,
        header: true,
        headers: [{ ...next, height: 40 }]
      });
      expect(decision.intent?.kind).toBe('insert');
      expect(decision.acquisition?.plan.layout).toEqual(hint!.plan.layout);
    }
  );

  it('keeps a partial-tab receiving endcap on its structural owner after a root reservation', () => {
    const input = setup();
    const initial = insertionHints(input);
    const outer = initial.find(hint => hint.owner === 'root' && hint.destination.position === 'bottom')!;
    const allocation = (layout: WorkspaceLayout) =>
      allocateWorkspace({
        gap: 6,
        root: layout.root,
        rect: bounds,
        minimum: () => ({ width: 0, height: 0 }),
        policy: 'stop'
      });
    const regions = computedRegionCatalog({
      saved: input.saved,
      catalog: allocation(input.saved).regions,
      allocation: allocation(outer.plan.layout).regions,
      source: input.source,
      available: input.available,
      bounds
    });
    const local = insertionHints({ ...input, regions, explorationRegions: input.regions }).find(
      hint => hint.owner === 'root.1' && hint.destination.position === 'bottom'
    )!;
    const original = initial.find(hint => hint.scope.key === local.scope.key)!;
    expect(local.rect).toEqual(original.rect);
    expect(local.scopeRect).toEqual(original.scopeRect);
    expect(local.scopeRect.y + local.scopeRect.height).toBe(bounds.height);
    expect(local.scope.members).toEqual(['b', 'c']);
  });

  it.each(['top', 'bottom', 'left', 'right'] as const)('exposes a real %s root INSERT for a partial tab', side => {
    const input = setup();
    const hints = insertionHints(input);
    const hint = hints.find(h => h.destination.region === 'root' && h.destination.position === side)!;
    expect(hint).toBeDefined();
    expect(placementOfferIntent(hint).kind).toBe('insert');
    expect(side === 'left' || side === 'right' ? hint.rect.width : hint.rect.height).toBe(12);
  });

  it('deduplicates BC-right/root-right while keeping distinct root-top and BC-top lanes', () => {
    const input = setup();
    const right = insertionHints(input);
    expect(right.filter(h => h.destination.position === 'right')).toHaveLength(1);
    const top = partitionPlacementOffers(insertionHints(input)).filter(
      h => h.destination.position === 'top' && h.boundary
    );
    expect(top.map(h => h.rect.y)).toEqual([0, 12]);
    expect(new Set(top.map(h => h.scope.key)).size).toBe(2);
  });

  it('normalizes a collapsed whole-source root to three peers without a phantom half-size lane', () => {
    const input = setup(false);
    const hints = insertionHints(input).filter(h => h.destination.position === 'top' && h.boundary);
    expect(hints).toHaveLength(1);
    const intent = placementOfferIntent(hints[0]!);
    if (intent.kind !== 'insert') throw new Error('Expected insertion');
    const plan = planWorkspacePlacement({
      layout: input.saved,
      source: input.source,
      destination: intent.destination,
      available: input.available,
      operation: 'insert'
    })!;
    if (plan.layout.root?.type !== 'split') throw new Error('Expected normalized owner');
    expect(plan.layout.root.weights).toEqual([1 / 3, 1 / 3, 1 / 3]);
  });

  it('keeps descriptor identity independent of weights across allocation weights', () => {
    const input = setup();
    const hint = insertionHints(input)[0]!;
    const intent = placementOfferIntent(hint);
    expect(intent.kind).toBe('insert');
    const plan = planWorkspacePlacement({
      layout: input.saved,
      source: input.source,
      destination: hint.destination,
      available: input.available,
      operation: 'insert'
    })!;
    const copy = structuredClone(plan);
    if (copy.layout.root?.type === 'split') copy.layout.root.weights = [0.2, 0.3, 0.5];
    expect(describePlacementSlot({ plan, source: input.source, available: input.available })?.key).toBe(
      describePlacementSlot({ plan: copy, source: input.source, available: input.available })?.key
    );
  });
});

describe('workspace normalized insertion seam paint', () => {
  it('resolves promoted group-left to the current A/C gutter while preserving its acquisition lane', () => {
    const input = setup(true, ['b']);
    const recipient = input.regions.find(r => r.node.type === 'group' && r.node.panels.includes('c'))!.rect;
    const previous = input.regions.find(r => r.node.type === 'group' && r.node.panels.includes('a'))!.rect;
    const hint = insertionHints(input).find(o => o.destination.position === 'left' && o.owner === 'root.1')!;
    expect(hint.owner).toBe('root.1');
    expect(hint.scope.index).toBe(1);
    expect(hint.scope.previous).toEqual(['a', 'companion']);
    expect(hint.scope.next).toEqual(['c']);
    const result = boundaryPlacementOffers({
      offers: [hint],
      bounds: bounds,
      point: { x: recipient.x + 20, y: 150 },
      current: undefined,
      headers: [],
      scene: {
        gap: 6,
        regions: input.regions,
        source: input.source
      }
    });
    const painted = result.offers[0]!;
    expect(painted.rect.x + painted.rect.width / 2).toBeCloseTo((previous.x + previous.width + recipient.x) / 2);
    expect(painted.hitRect).toEqual(hint.rect);
    const distant = input.regions.map(r =>
      r.node.type === 'group' && r.node.panels.includes('c') ? { ...r, rect: { ...r.rect, x: r.rect.x + 100 } } : r
    );
    expect(currentInsertionSeam(hint, { regions: distant, source: input.source, gap: 6 })).toBeUndefined();
  });
});

describe('workspace current-scene ordering hints', () => {
  it.each([
    { axis: 'horizontal' as const, weights: [1, 1, 1], expected: [0, 444, 888] },
    { axis: 'horizontal' as const, weights: [1, 2, 3], expected: [0, 220.5, 888] },
    { axis: 'vertical' as const, weights: [1, 2, 3], expected: [0, 145.5, 588] }
  ])('uses the $axis exploration gaps after removing the middle peer', ({ axis, weights, expected }) => {
    const saved: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: { type: 'split', axis, weights, children: [group('a'), group('b'), group('c')] }
    };
    const scene = allocateWorkspace({
      gap: 6,
      root: detachedLayout(saved, ['b']).root,
      rect: { x: 0, y: 0, width: 900, height: 600 },
      minimum: () => ({ width: 0, height: 0 }),
      policy: 'stop'
    });
    const owner = scene.regions.find(region => region.key === 'root')!.rect;
    const first = scene.groups[0]!.rect;
    const last = scene.groups[1]!.rect;
    const descriptors = [
      { recipient: first, after: false },
      { recipient: last, previous: first, after: false },
      { recipient: last, after: true }
    ].map(slot => orderHintRect({ ...slot, owner, axis })!);
    expect(descriptors.map(rect => (axis === 'horizontal' ? rect.x : rect.y))).toEqual(expected);
    const middle = descriptors[1]!;
    const normal = axis === 'horizontal' ? middle.x : middle.y;
    const peerEnd = axis === 'horizontal' ? first.x + first.width : first.y + first.height;
    const peerStart = axis === 'horizontal' ? last.x : last.y;
    expect(normal + 6).toBe((peerEnd + peerStart) / 2);
  });
});

describe('workspace outer boundary targeting', () => {
  const offers = () => insertionHints(setup());

  it('selects the true root outside at any distance while painting only the inward half', () => {
    const result = boundaryPlacementOffers({
      offers: offers(),
      bounds: bounds,
      point: { x: 500, y: 3000 },
      current: undefined,
      headers: []
    });
    expect(result.hit?.owner).toBe('root');
    expect(result.hit?.destination.position).toBe('bottom');
    const cue = result.offers.find(o => o.owner === 'root')!;
    expect(cue.rect.y).toBe(294);
    expect(cue.rect.height).toBe(6);
    expect(cue.rect.x).toBe(0);
    expect(cue.rect.x + cue.rect.width).toBe(600);
  });

  it('does not mistake a collapsed nested owner filling the canvas for root', () => {
    const nested = offers().map(o => ({ ...o, owner: 'root.1' }));
    expect(
      boundaryPlacementOffers({
        offers: nested,
        bounds: bounds,
        point: { x: 500, y: 3000 },
        current: undefined,
        headers: []
      }).hit
    ).toBeUndefined();
  });

  it('gives only top6 pixels boundary priority and preserves the header interior', () => {
    const header = { x: 0, y: 0, width: 600, height: 40 };
    expect(
      boundaryPlacementOffers({
        offers: offers(),
        bounds: bounds,
        point: { x: 300, y: 5 },
        current: undefined,
        headers: [header]
      }).hit?.destination.position
    ).toBe('top');
    expect(
      boundaryPlacementOffers({
        offers: offers(),
        bounds: bounds,
        point: { x: 300, y: 7 },
        current: undefined,
        headers: [header]
      }).hit
    ).toBeUndefined();
    const local = boundaryPlacementOffers({
      offers: offers(),
      bounds: bounds,
      point: { x: 500, y: 7 },
      current: undefined,
      headers: [header]
    }).offers.filter(o => o.owner !== 'root');
    const endcap = local.find(o => o.destination.position === 'top')!;
    expect(endcap.boundary).toBe('start');
    expect(endcap.rect.y).toBe(0);
    expect(endcap.hitRect).toMatchObject({ y: 6, height: 12 });
    const input = {
      ...setup(),
      bounds,
      header: true,
      headers: [header],
      local: { kind: 'tab' as const, destination: { target: 'b', position: 'tab' as const } }
    };
    expect(decidePlacement({ ...input, point: { x: 500, y: 12 } }).intent?.kind).toBe('insert');
    expect(decidePlacement({ ...input, point: { x: 500, y: 24 } }).intent?.kind).toBe('tab');
  });

  it('keeps local ORDER paint flush while separating its narrow header-edge acquisition', () => {
    const saved = setup().saved;
    const plan = planWorkspacePlacement({
      layout: saved,
      source: ['b'],
      destination: { target: 'c', region: 'root.1.1', position: 'top' },
      available: ['a', 'companion', 'b', 'c'],
      operation: 'order'
    })!;
    const scope = describePlacementSlot({ plan, source: ['b'], available: ['a', 'companion', 'b', 'c'] })!;
    const local = {
      kind: 'order' as const,
      owner: 'root.1',
      plan,
      scope,
      destination: { target: 'c', region: 'root.1.1', position: 'top' as const },
      scopeRect: { x: 240, y: 0, width: 360, height: 300 },
      rect: { x: 240, y: 0, width: 360, height: 12 }
    };
    const result = boundaryPlacementOffers({
      offers: [...offers(), local],
      bounds: bounds,
      point: { x: 500, y: 12 },
      current: undefined,
      headers: [{ x: 240, y: 0, width: 360, height: 40 }]
    });
    const cue = result.offers.find(o => o.kind === 'order')!;
    expect(cue.rect.y).toBe(0);
    expect(cue.hitRect?.y).toBe(6);
    expect(cue.hitRect?.height).toBe(12);
  });

  it('keeps the full side INSERT cue while protecting intervening chrome from acquisition', () => {
    const offer = offers().find(o => o.scope.previous && o.scope.next)!;
    const local = { ...offer, owner: 'root.1', rect: { x: 588, y: 0, width: 12, height: 300 } };
    const result = boundaryPlacementOffers({
      offers: [local],
      bounds: bounds,
      point: { x: 590, y: 200 },
      current: undefined,
      headers: [{ x: 0, y: 100, width: 600, height: 40 }]
    });
    expect(result.offers).toHaveLength(2);
    expect(result.offers.map(o => o.rect)).toEqual([local.rect, local.rect]);
    expect(result.offers.map(o => o.hitRect)).toEqual([
      { x: 588, y: 0, width: 12, height: 100 },
      { x: 588, y: 140, width: 12, height: 160 }
    ]);
  });

  it('partitions corners by distance and uses the current edge only on exact ties', () => {
    expect(boundarySide(bounds, { x: -20, y: -10 })).toBe('left');
    expect(boundarySide(bounds, { x: -10, y: -20 })).toBe('top');
    expect(boundarySide(bounds, { x: -20, y: -20 }, 'top')).toBe('top');
    expect(boundarySide(bounds, { x: 4, y: 4 }, 'left')).toBe('left');
    expect(boundarySide(bounds, { x: 4, y: 3 }, 'left')).toBe('top');
  });
});
