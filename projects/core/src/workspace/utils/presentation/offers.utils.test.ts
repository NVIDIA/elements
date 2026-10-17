// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import type { Rect } from '@nvidia-elements/core/internal';

import { allocateWorkspace } from '../geometry/allocation.utils.js';
import { clipCue } from '../interaction/drag-preview.utils.js';
import { planWorkspacePlacement } from '../placement/planner.utils.js';
import { getOfferAllocation, getOfferPresentation } from './offers.utils.js';

import type { WorkspaceLayout, WorkspaceNode } from '../model/layout.utils.js';
import type { WorkspacePlacementPlan } from '../placement/planner.utils.js';

const makeGroup = (id: string): WorkspaceNode => ({ type: 'group', panels: [id], active: id });
const plan: WorkspacePlacementPlan = { kind: 'split', layout: { version: 1, root: null, closed: [] } };

const rect = { x: 24, y: 60, width: 447, height: 250 };

const input = {
  plan,
  regions: [],
  sourceKey: 'root.1',
  sourceRect: { x: 280, y: 60, width: 191, height: 250 },
  cue: { x: 280, y: 60, width: 191, height: 250 },
  bounds: { x: 24, y: 60, width: 900, height: 600 },
  feasible: true,
  split: { source: ['a'], regions: [], groups: [{ panels: [{ id: 'b' }], rect }] },
  client: (value: typeof rect) => value
};

describe('workspace split intent presentation', () => {
  it.each([
    { affected: 'recipient', recipientWidth: 209, neighborWidth: 447, members: ['b'], kind: 'recipient' },
    { affected: 'enclosing rail', recipientWidth: 250, neighborWidth: 406, members: ['b', 'c'], kind: 'rail' }
  ])(
    'shows the $affected when allocated group geometry changes',
    ({ recipientWidth, neighborWidth, members, kind }) => {
      const baseline = [
        {
          key: 'root',
          node: {
            type: 'split' as const,
            axis: 'horizontal' as const,
            weights: [1, 1],
            children: [makeGroup('b'), makeGroup('c')]
          },
          rect: { x: 0, y: 0, width: 900, height: 300 }
        },
        { key: 'root.0', node: makeGroup('b'), rect: { x: 0, y: 0, width: 447, height: 300 } },
        { key: 'root.1', node: makeGroup('c'), rect: { x: 453, y: 0, width: 447, height: 300 } }
      ];
      const sourceRect = { x: recipientWidth + 6, y: 0, width: 232, height: 300 };
      const regions = [
        { key: 'root.0', node: makeGroup('b'), rect: { x: 0, y: 0, width: recipientWidth, height: 300 } },
        { key: 'root.1', node: makeGroup('a'), rect: sourceRect },
        {
          key: 'root.2',
          node: makeGroup('c'),
          rect: { x: sourceRect.x + sourceRect.width + 6, y: 0, width: neighborWidth, height: 300 }
        }
      ];
      const candidate: WorkspacePlacementPlan = {
        kind: 'split',
        layout: {
          version: 1,
          closed: [],
          root: {
            type: 'split',
            axis: 'horizontal',
            weights: [recipientWidth, 232, neighborWidth],
            children: [makeGroup('b'), makeGroup('a'), makeGroup('c')]
          }
        },
        context: { kind: 'recipient', members: ['b'] }
      };
      const before = structuredClone(candidate);
      const result = getOfferPresentation({
        ...input,
        plan: candidate,
        destination: { target: 'b', position: 'right' },
        regions,
        sourceKey: 'root.1',
        sourceRect,
        bounds: { x: 0, y: 0, width: 900, height: 300 },
        split: {
          source: ['a'],
          regions: baseline,
          groups: [
            { panels: [{ id: 'b' }], rect: baseline[1]!.rect },
            { panels: [{ id: 'c' }], rect: baseline[2]!.rect }
          ]
        }
      });

      expect(result.context).toEqual({ kind, members });
      expect(result.cue.width).toBe(223.5);
      expect(result.seams?.kind).toBe('split');
      expect(candidate.context).toEqual({ kind: 'recipient', members: ['b'] });
      expect(candidate).toEqual(before);
    }
  );

  it.each([
    { position: 'left' as const, cue: { x: 24, y: 60, width: 223.5, height: 250 }, side: 'right' },
    { position: 'right' as const, cue: { x: 247.5, y: 60, width: 223.5, height: 250 }, side: 'left' },
    { position: 'top' as const, cue: { x: 24, y: 60, width: 447, height: 125 }, side: 'bottom' },
    { position: 'bottom' as const, cue: { x: 24, y: 185, width: 447, height: 125 }, side: 'top' }
  ])('shows the exact $position half independently of constrained allocation', ({ position, cue, side }) => {
    const before = structuredClone(plan);
    const result = getOfferPresentation({ ...input, destination: { target: 'b', position } });
    expect(result.cue).toEqual(cue);
    expect(result.seams).toEqual({ kind: 'split', edges: [{ side, offset: 0, fraction: 0.5 }] });
    expect(result.context).toEqual({ kind: 'recipient', members: ['b'] });
    expect(input.sourceRect.width).toBe(191);
    expect(input.plan).toBe(plan);
    expect(plan).toEqual(before);
  });

  it('retains blocked truth while showing the same intended half without a valid seam badge', () => {
    const result = getOfferPresentation({ ...input, feasible: false, destination: { target: 'b', position: 'right' } });
    expect(result.cue.width).toBe(223.5);
    expect(result.seams).toBeUndefined();
  });

  it('preserves the allocated cue for placements without a split intent overlay', () => {
    const result = getOfferPresentation({
      ...input,
      split: undefined,
      destination: { target: 'b', position: 'right' }
    });
    expect(result.cue).toEqual(input.sourceRect);
  });
});

describe('workspace evaluated placement seams', () => {
  const group = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels[0]! });
  const layout = (axis: 'horizontal' | 'vertical'): WorkspaceLayout => ({
    version: 1,
    closed: [],
    root: { type: 'split', axis, children: [group('a'), group('b'), group('c')], weights: [2, 5, 3] }
  });
  const bounds = { x: 0, y: 0, width: 600, height: 300 };

  function setup(
    current: WorkspaceLayout,
    source: string[],
    destination: {
      target: string;
      position: 'left' | 'right' | 'top' | 'bottom' | 'tab';
      operation?: 'order' | 'split' | 'tab';
    }
  ) {
    const { target, position, operation = 'order' } = destination;
    const candidate = planWorkspacePlacement({
      layout: current,
      operation,
      source,
      destination: { target, position },
      available: ['a', 'b', 'c', 'companion']
    })!;
    const { regions } = allocateWorkspace({
      gap: 6,
      root: candidate.layout.root,
      rect: bounds,
      minimum: () => ({ width: 0, height: 0 }),
      policy: 'stop'
    });
    const sourceRegion = regions.find(
      region => region.node.type === 'group' && region.node.panels.some(id => source.includes(id))
    )!;
    return {
      plan: candidate,
      regions,
      sourceKey: sourceRegion.key,
      sourceRect: sourceRegion.rect,
      cue: sourceRegion.rect,
      bounds,
      destination: { target, position },
      feasible: true,
      client: (value: Rect) => value
    };
  }

  it('describes both real neighbors at an interior peer insertion and one at an end', () => {
    const middle = getOfferPresentation(setup(layout('horizontal'), ['c'], { target: 'b', position: 'left' })).seams!;
    expect(middle.kind).toBe('insert');
    expect(middle.edges).toEqual([
      { side: 'left', offset: expect.closeTo(3, 8), fraction: 0.5 },
      { side: 'right', offset: expect.closeTo(3, 8), fraction: 0.5 }
    ]);
    expect(
      getOfferPresentation(setup(layout('horizontal'), ['c'], { target: 'a', position: 'left' })).seams!.edges
    ).toEqual([{ side: 'right', offset: expect.closeTo(3, 8), fraction: 0.5 }]);
  });

  it('uses the actual vertical owner and measured gap', () => {
    const placement = setup(layout('vertical'), ['c'], { target: 'b', position: 'top' });
    const neighbor = placement.regions.find(region => region.key === 'root.2')!;
    neighbor.rect.y += 2;
    const result = getOfferPresentation(placement).seams!;
    expect(result.edges).toEqual([
      { side: 'top', offset: expect.closeTo(3, 8), fraction: 0.5 },
      { side: 'bottom', offset: expect.closeTo(4, 8), fraction: 0.5 }
    ]);
  });

  it('marks only the new recipient-facing cut when extracting a tab', () => {
    const current: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: { type: 'split', axis: 'horizontal', children: [group('a', 'companion'), group('b')], weights: [1, 1] }
    };
    const result = getOfferPresentation(
      setup(current, ['companion'], { target: 'b', position: 'top', operation: 'split' })
    ).seams!;
    expect(result.kind).toBe('split');
    expect(result.edges).toEqual([{ side: 'bottom', offset: expect.closeTo(3, 8), fraction: 0.5 }]);
  });

  it('keeps real adjacency annotations when returning to the unchanged first or interior slot', () => {
    const current = layout('horizontal');
    const first = setup(current, ['a'], { target: 'b', position: 'left' });
    const middle = setup(current, ['b'], { target: 'c', position: 'left' });
    expect(first.plan.layout).toEqual(current);
    expect(middle.plan.layout).toEqual(current);
    expect(getOfferPresentation(first).seams?.edges.map(edge => edge.side)).toEqual(['right']);
    expect(getOfferPresentation(middle).seams?.edges.map(edge => edge.side)).toEqual(['left', 'right']);
  });

  it('does not invent group seams for a tab join', () => {
    expect(
      getOfferPresentation(setup(layout('horizontal'), ['c'], { target: 'b', position: 'tab', operation: 'tab' })).seams
    ).toBeUndefined();
  });

  it('does not turn a clipped viewport boundary into an adjoining seam', () => {
    const placement = setup(layout('horizontal'), ['c'], { target: 'b', position: 'left' });
    const visible = { ...bounds, width: placement.sourceRect.x + placement.sourceRect.width / 2 };
    const result = getOfferPresentation({ ...placement, cue: clipCue(placement.cue, visible), bounds: visible }).seams!;
    expect(result.edges.map(edge => edge.side)).toEqual(['left']);
  });
});

describe('workspace reserved allocation', () => {
  it.each(['insert', 'reorder', 'tab'] as const)('reserves actual %s plans only when feasible', kind => {
    const candidate: WorkspacePlacementPlan = { ...plan, kind };
    expect(getOfferAllocation(candidate, true)).toEqual({ allocation: 'reserved', layout: candidate.layout });
    expect(getOfferAllocation(candidate, false)).toEqual({ allocation: 'overlay' });
  });
});
