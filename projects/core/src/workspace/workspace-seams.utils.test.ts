// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { WorkspaceLayout, WorkspaceNode } from './workspace-layout.utils.js';
import { planWorkspacePlacement } from './workspace-planner.utils.js';
import { allocateWorkspace } from './workspace-placement.utils.js';
import { clipCue } from './workspace-drag-preview.utils.js';
import { planSeamPreview } from './workspace-seams.utils.js';

const pane = (...panels: string[]): WorkspaceNode => ({ type: 'pane', panels, active: panels[0]! });
const layout = (axis: 'horizontal' | 'vertical'): WorkspaceLayout => ({
  version: 1,
  closed: [],
  root: { type: 'split', axis, children: [pane('a'), pane('b'), pane('c')], weights: [2, 5, 3] }
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
  const plan = planWorkspacePlacement({
    layout: current,
    operation,
    source,
    destination: { target, position },
    available: ['a', 'b', 'c', 'companion']
  })!;
  const { regions } = allocateWorkspace({
    root: plan.layout.root,
    rect: bounds,
    minimum: () => ({ width: 0, height: 0 }),
    policy: 'stop'
  });
  const sourceRegion = regions.find(
    region => region.node.type === 'pane' && region.node.panels.some(id => source.includes(id))
  )!;
  return {
    plan,
    regions,
    sourceKey: sourceRegion.key,
    sourceRect: sourceRegion.rect,
    cue: sourceRegion.rect,
    bounds,
    position
  };
}

describe('workspace evaluated placement seams', () => {
  it('describes both real neighbors at an interior peer insertion and one at an end', () => {
    const middle = planSeamPreview(setup(layout('horizontal'), ['c'], { target: 'b', position: 'left' }))!;
    expect(middle.kind).toBe('insert');
    expect(middle.edges).toEqual([
      { side: 'left', offset: expect.closeTo(3, 8), fraction: 0.5 },
      { side: 'right', offset: expect.closeTo(3, 8), fraction: 0.5 }
    ]);
    expect(planSeamPreview(setup(layout('horizontal'), ['c'], { target: 'a', position: 'left' }))!.edges).toEqual([
      { side: 'right', offset: expect.closeTo(3, 8), fraction: 0.5 }
    ]);
  });

  it('uses the actual vertical owner and measured gap', () => {
    const input = setup(layout('vertical'), ['c'], { target: 'b', position: 'top' });
    const neighbor = input.regions.find(region => region.key === 'root.2')!;
    neighbor.rect.y += 2;
    const result = planSeamPreview(input)!;
    expect(result.edges).toEqual([
      { side: 'top', offset: expect.closeTo(3, 8), fraction: 0.5 },
      { side: 'bottom', offset: expect.closeTo(4, 8), fraction: 0.5 }
    ]);
  });

  it('marks only the new recipient-facing cut when extracting a tab', () => {
    const current: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: { type: 'split', axis: 'horizontal', children: [pane('a', 'companion'), pane('b')], weights: [1, 1] }
    };
    const result = planSeamPreview(
      setup(current, ['companion'], { target: 'b', position: 'top', operation: 'split' })
    )!;
    expect(result.kind).toBe('split');
    expect(result.edges).toEqual([{ side: 'bottom', offset: expect.closeTo(3, 8), fraction: 0.5 }]);
  });

  it('keeps real adjacency annotations when returning to the unchanged first or interior slot', () => {
    const current = layout('horizontal');
    const first = setup(current, ['a'], { target: 'b', position: 'left' });
    const middle = setup(current, ['b'], { target: 'c', position: 'left' });
    expect(first.plan.layout).toEqual(current);
    expect(middle.plan.layout).toEqual(current);
    expect(planSeamPreview(first)?.edges.map(edge => edge.side)).toEqual(['right']);
    expect(planSeamPreview(middle)?.edges.map(edge => edge.side)).toEqual(['left', 'right']);
  });

  it('does not invent pane seams for a tab join', () => {
    expect(
      planSeamPreview(setup(layout('horizontal'), ['c'], { target: 'b', position: 'tab', operation: 'tab' }))
    ).toBeUndefined();
  });

  it('does not turn a clipped viewport boundary into an adjoining seam', () => {
    const input = setup(layout('horizontal'), ['c'], { target: 'b', position: 'left' });
    const visible = { ...bounds, width: input.sourceRect.x + input.sourceRect.width / 2 };
    const result = planSeamPreview({ ...input, cue: clipCue(input.cue, visible), bounds: visible })!;
    expect(result.edges.map(edge => edge.side)).toEqual(['left']);
  });
});
