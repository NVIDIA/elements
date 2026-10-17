// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { offerPresentation, offerAllocation } from './workspace-offer-presentation.utils.js';
import type { WorkspacePlacementPlan } from './workspace-planner.utils.js';
import { planWorkspacePlacement } from './workspace-planner.utils.js';
import { allocateWorkspace } from './workspace-placement.utils.js';
import { detachedLayout, projectLayout } from './workspace-operations.utils.js';
import { minimumWorkspace, type WorkspaceRequirements } from './workspace-sizing.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from './workspace-layout.utils.js';

const pane = (id: string): WorkspaceNode => ({ type: 'pane', panels: [id], active: id });
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
    { minimum: 120, members: ['b'], kind: 'recipient' },
    { minimum: 250, members: ['b', 'c'], kind: 'rail' }
  ])('shows only the affected semantic region when B minimum is $minimum', ({ minimum, members, kind }) => {
    const saved: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: { type: 'split', axis: 'horizontal', weights: [1, 1, 1], children: [pane('a'), pane('b'), pane('c')] }
    };
    const requirements: WorkspaceRequirements = {
      chrome: { width: 20, height: 20 },
      panels: new Map([
        ['a', { width: 232, height: 20 }],
        ['b', { width: minimum, height: 20 }],
        ['c', { width: 120, height: 20 }]
      ])
    };
    const allocate = (layout: WorkspaceLayout) =>
      allocateWorkspace({
        root: projectLayout(layout, ['a', 'b', 'c']).root,
        rect: { x: 0, y: 0, width: 900, height: 300 },
        minimum: node => minimumWorkspace(node, requirements),
        policy: 'stop'
      });
    const baseline = allocate(detachedLayout(saved, ['a']));
    const destination = { target: 'b', position: 'right' as const };
    const candidate = planWorkspacePlacement({
      layout: saved,
      source: ['a'],
      destination,
      available: ['a', 'b', 'c'],
      operation: 'split',
      preference: { allocation: baseline.regions, requirements }
    })!;
    const achieved = allocate(candidate.layout);
    const moving = achieved.groups.find(group => group.pane.panels.includes('a'))!;
    const before = JSON.stringify(candidate);
    const result = offerPresentation({
      ...input,
      plan: candidate,
      destination,
      regions: achieved.regions,
      sourceKey: moving.key,
      sourceRect: moving.rect,
      split: {
        source: ['a'],
        regions: baseline.regions,
        groups: baseline.groups.map(group => ({ panels: group.pane.panels.map(id => ({ id })), rect: group.rect }))
      }
    });
    expect(result.context).toEqual({ kind, members });
    expect(result.cue.width).toBe(223.5);
    expect(result.seams?.kind).toBe('split');
    expect(candidate.context).toEqual({ kind: 'recipient', members: ['b'] });
    expect(JSON.stringify(candidate)).toBe(before);
    expect(achieved.groups.find(group => group.pane.panels.includes('c'))!.rect.width).toBe(
      minimum === 250 ? 406 : 447
    );
  });

  it.each([
    { position: 'left' as const, cue: { x: 24, y: 60, width: 223.5, height: 250 }, side: 'right' },
    { position: 'right' as const, cue: { x: 247.5, y: 60, width: 223.5, height: 250 }, side: 'left' },
    { position: 'top' as const, cue: { x: 24, y: 60, width: 447, height: 125 }, side: 'bottom' },
    { position: 'bottom' as const, cue: { x: 24, y: 185, width: 447, height: 125 }, side: 'top' }
  ])('shows the exact $position half independently of constrained allocation', ({ position, cue, side }) => {
    const result = offerPresentation({ ...input, destination: { target: 'b', position } });
    expect(result.cue).toEqual(cue);
    expect(result.seams).toEqual({ kind: 'split', edges: [{ side, offset: 0, fraction: 0.5 }] });
    expect(result.context).toEqual({ kind: 'recipient', members: ['b'] });
    expect(input.sourceRect.width).toBe(191);
    expect(input.plan).toBe(plan);
  });

  it('retains blocked truth while showing the same intended half without a valid seam badge', () => {
    const result = offerPresentation({ ...input, feasible: false, destination: { target: 'b', position: 'right' } });
    expect(result.cue.width).toBe(223.5);
    expect(result.seams).toBeUndefined();
  });

  it('preserves the allocated cue for placements without a split intent overlay', () => {
    const result = offerPresentation({
      ...input,
      split: undefined,
      destination: { target: 'b', position: 'right' }
    });
    expect(result.cue).toEqual(input.sourceRect);
  });
});

describe('workspace reserved allocation', () => {
  it.each(['insert', 'reorder', 'tab'] as const)('reserves actual %s plans only when feasible', kind => {
    const candidate: WorkspacePlacementPlan = { ...plan, kind };
    expect(offerAllocation(candidate, true)).toEqual({ allocation: 'reserved', layout: candidate.layout });
    expect(offerAllocation(candidate, false)).toEqual({ allocation: 'overlay' });
  });
});
