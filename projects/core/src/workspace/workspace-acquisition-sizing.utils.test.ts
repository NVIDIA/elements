// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { fitAcquiredPlacement, selectedPlacementPlan } from './workspace-acquisition-sizing.utils.js';
import { planWorkspacePlacement } from './workspace-planner.utils.js';
import { allocateWorkspace } from './workspace-placement.utils.js';
import type { WorkspaceDropIntent } from './workspace-drag-preview.utils.js';
import type { WorkspaceDragPreview } from './workspace-rearrange.controller.js';
import { findPane, projectLayout, type WorkspaceDestination } from './workspace-operations.utils.js';
import { minimumWorkspace, type WorkspaceRequirements } from './workspace-sizing.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from './workspace-layout.utils.js';

const pane = (...panels: string[]): WorkspaceNode => ({ type: 'pane', panels, active: panels.at(-1)! });

function setup({
  transposed = false,
  transverse = false,
  dormant
}: {
  transposed?: boolean;
  transverse?: boolean;
  dormant?: boolean;
} = {}) {
  const source = dormant ? ['closed', 'b', 'missing'] : ['b'];
  const available = ['a', 'b', 'c', 'd', 'closed'];
  const axes = transposed ? (['vertical', 'horizontal'] as const) : (['horizontal', 'vertical'] as const);
  const dimensions = transposed ? [480, 900] : [900, 480];
  const saved: WorkspaceLayout = {
    version: 1,
    closed: dormant ? ['closed'] : [],
    root: {
      type: 'split',
      axis: axes[0],
      weights: [2, 3],
      children: [
        pane('a'),
        {
          type: 'split',
          axis: axes[1],
          weights: [2, 3, 5],
          children: [pane(...source), pane('c'), pane('d')]
        }
      ]
    }
  };
  const rect = { x: 0, y: 0, width: dimensions[0]!, height: dimensions[1]! };
  const requirements: WorkspaceRequirements = {
    chrome: headerMinimum(transposed),
    panels: new Map()
  };
  const plan = (operation: 'order' | 'insert', destination: WorkspaceDestination) =>
    planWorkspacePlacement({ layout: saved, source, available, operation, destination })!;
  const previous = plan('insert', { region: 'root', target: 'a', position: rootSide(transposed, transverse) }).layout;
  const candidate = plan('order', { region: 'root.1.2', target: 'd', position: transposed ? 'left' : 'top' });
  const allocate = (layout: WorkspaceLayout) =>
    allocateWorkspace({
      root: projectLayout(layout, available).root,
      rect,
      minimum: node => minimumWorkspace(node, requirements),
      policy: 'stop'
    });
  const current = allocate(previous).regions;
  const c = current.find(region => region.node.type === 'pane' && region.node.panels.includes('c'))!.rect;
  const acquisition = transposed
    ? {
        rect: { x: c.x + c.width - 3, y: c.y, width: 12, height: c.height },
        point: { x: c.x + c.width + 3, y: c.y + 20 }
      }
    : {
        rect: { x: c.x, y: c.y + c.height - 3, width: c.width, height: 12 },
        point: { x: c.x + 20, y: c.y + c.height + 3 }
      };
  return {
    input: { plan: candidate, previous, source, available, current, rect, acquisition, requirements },
    allocate,
    saved
  };
}

function headerMinimum(transposed: boolean) {
  return transposed ? { width: 40, height: 232 } : { width: 232, height: 40 };
}

function rootSide(transposed: boolean, transverse: boolean) {
  return transposed === transverse ? ('bottom' as const) : ('right' as const);
}
const intent: WorkspaceDropIntent = {
  kind: 'order',
  destination: { target: 'd', region: 'root.1.2', position: 'top' }
};

function selection(fixture: ReturnType<typeof setup>, layout: WorkspaceLayout): WorkspaceDragPreview {
  return {
    phase: 'detached',
    allocation: 'reserved',
    layout,
    source: fixture.input.source,
    intent,
    blocked: false,
    cue: { kind: 'pane', rect: moving(fixture, layout) }
  };
}

function moving(fixture: ReturnType<typeof setup>, layout: WorkspaceLayout) {
  return fixture.allocate(layout).groups.find(group => group.pane.panels.includes('b'))!.rect;
}

describe('workspace acquired cross-scope allocation', () => {
  it.each([false, true])('covers the acquired normal band with a real reservation, transposed=%s', transposed => {
    const fixture = setup({ transposed });
    const original = JSON.stringify(fixture.input.plan);
    const result = fitAcquiredPlacement(fixture.input)!;
    const box = moving(fixture, result.layout);
    const axis = transposed ? 'x' : 'y',
      extent = transposed ? 'width' : 'height';
    expect(box[axis]).toBeCloseTo(83.625);
    expect(box[extent]).toBeCloseTo(93.6);
    expect(box[axis]).toBeLessThanOrEqual(fixture.input.acquisition.rect[axis]);
    expect(box[axis] + box[extent]).toBeGreaterThanOrEqual(fixture.input.acquisition.rect[axis] + 12);
    expect(JSON.stringify(fixture.input.plan)).toBe(original);
    expect(JSON.stringify(result.layout)).not.toBe(JSON.stringify(fixture.saved));
  });

  it.each([false, true])(
    'repairs only an excluding ancestor and covers the tangent point, transposed=%s',
    transposed => {
      const fixture = setup({ transposed, transverse: true });
      const result = fitAcquiredPlacement(fixture.input)!;
      const box = moving(fixture, result.layout);
      const tangent = transposed ? 'y' : 'x',
        extent = transposed ? 'height' : 'width';
      expect(box[tangent]).toBeCloseTo(242.8);
      expect(box[extent]).toBeCloseTo(657.2);
      expect(fixture.input.acquisition.point[tangent]).toBeGreaterThan(box[tangent]);
      expect(fixture.input.acquisition.point[tangent]).toBeLessThan(box[tangent] + box[extent]);
      const a = fixture.allocate(result.layout).groups.find(group => group.pane.panels.includes('a'))!;
      expect(a.rect[extent]).toBeCloseTo(236.8);
    }
  );

  it('preserves closed and unavailable canonical pane members while fitting visible geometry', () => {
    const fixture = setup({ dormant: true });
    const result = fitAcquiredPlacement(fixture.input)!;
    expect(result.layout.closed).toEqual(['closed']);
    expect(findPane(result.layout.root, 'b')).toEqual({
      type: 'pane',
      panels: ['closed', 'b', 'missing'],
      active: 'missing'
    });
    expect(moving(fixture, result.layout).y).toBeCloseTo(83.625);
  });

  it('does not alter an ordinary same-owner reorder or an endcap', () => {
    const fixture = setup();
    expect(fitAcquiredPlacement({ ...fixture.input, previous: fixture.saved })).toBe(fixture.input.plan);
    const end = planWorkspacePlacement({
      ...fixture.input,
      layout: fixture.saved,
      operation: 'order',
      destination: { target: 'd', region: 'root.1.2', position: 'bottom' }
    })!;
    expect(fitAcquiredPlacement({ ...fixture.input, plan: end })).toBe(end);
  });

  it('blocks an interior whose minimum-feasible reservation cannot cover acquisition', () => {
    const fixture = setup();
    expect(
      fitAcquiredPlacement({
        ...fixture.input,
        requirements: { ...fixture.input.requirements, panels: new Map([['c', { width: 0, height: 110 }]]) }
      })
    ).toBeUndefined();
  });

  it('reuses each immutable selected layout on refresh independently of another blocked preview', () => {
    const fixture = setup();
    const adapted = fitAcquiredPlacement(fixture.input)!;
    const selected = selection(fixture, adapted.layout);
    const base = { ...fixture.input, intent, origin: { x: 0, y: 0, width: 0, height: 0 } };
    const result = selectedPlacementPlan({ ...base, previous: selected })!;
    expect(result.layout).toBe(adapted.layout);
    const blocked: WorkspaceDragPreview = {
      phase: 'detached',
      allocation: 'overlay',
      source: fixture.input.source,
      intent,
      blocked: true,
      cue: selected.cue
    };
    expect(selectedPlacementPlan({ ...base, previous: blocked, acquisition: undefined })).toBeUndefined();
    const restored = selectedPlacementPlan({ ...base, previous: selected, acquisition: undefined })!;
    expect(restored.layout).toBe(adapted.layout);
    expect(selectedPlacementPlan({ ...base, previous: selection(fixture, restored.layout) })!.layout).toBe(
      adapted.layout
    );
  });

  it('does not create a cross-scope fit merely after an overlapping split preview', () => {
    const fixture = setup();
    const previous: WorkspaceDragPreview = {
      phase: 'detached',
      allocation: 'overlay',
      source: fixture.input.source,
      intent: { kind: 'split', destination: { target: 'c', position: 'left' } },
      blocked: false,
      cue: { kind: 'pane', rect: fixture.input.rect }
    };
    expect(selectedPlacementPlan({ ...fixture.input, previous, intent, origin: fixture.input.rect })).toBe(
      fixture.input.plan
    );
  });
});
