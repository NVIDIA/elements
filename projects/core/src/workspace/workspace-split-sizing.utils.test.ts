// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { WorkspaceLayout, WorkspaceNode, WorkspacePane } from './workspace-layout.utils.js';
import { detachedLayout, projectLayout } from './workspace-operations.utils.js';
import { allocateWorkspace } from './workspace-placement.utils.js';
import { minimumWorkspace, type WorkspaceRequirements } from './workspace-sizing.utils.js';
import { planWorkspacePlacement } from './workspace-planner.utils.js';

const pane = (...panels: string[]): WorkspacePane => ({ type: 'pane', panels, active: panels[0]! });
const split = (
  axis: 'horizontal' | 'vertical',
  children: WorkspaceNode[],
  weights = children.map(() => 1)
): WorkspaceNode => ({ type: 'split', axis, children, weights });
const layout = (root: WorkspaceNode, closed: string[] = []): WorkspaceLayout => ({ version: 1, root, closed });
const requirements: WorkspaceRequirements = { chrome: { width: 20, height: 20 }, panels: new Map() };

const viewport = { width: 900, height: 600 };

function ids(node: WorkspaceNode | null): string[] {
  return !node ? [] : node.type === 'pane' ? node.panels : node.children.flatMap(ids);
}

function geometry(saved: WorkspaceLayout, rect = viewport, needs = requirements) {
  return allocateWorkspace({
    root: projectLayout(saved, ids(saved.root)).root,
    rect: { x: 0, y: 0, ...rect },
    minimum: node => minimumWorkspace(node, needs),
    policy: 'stop'
  });
}

describe('workspace recipient split sizing', () => {
  it('admits an unchanged SPLIT landing without turning equivalent weight scales into a mutation', () => {
    const saved = layout(split('vertical', [pane('a'), pane('b')], [1, 1]));
    const detached = geometry(detachedLayout(saved, ['a']));
    const plan = planWorkspacePlacement({
      layout: saved,
      source: ['a'],
      destination: { target: 'b', position: 'top' },
      operation: 'split',
      available: ['a', 'b'],
      preference: { allocation: detached.regions, requirements }
    });
    expect(plan?.kind).toBe('split');
    expect(plan?.layout).toEqual(saved);
  });

  it('leaves an unmeasured split candidate valid for admission without fabricating zero weights', () => {
    const saved = layout(split('horizontal', [pane('a'), pane('b'), pane('c')]));
    const needs: WorkspaceRequirements = { chrome: { width: 0, height: 0 }, panels: new Map() };
    const detached = geometry(detachedLayout(saved, ['a']), { width: 0, height: 0 }, needs);
    const plan = planWorkspacePlacement({
      layout: saved,
      source: ['a'],
      destination: { target: 'b', position: 'right' },
      operation: 'split',
      available: ['a', 'b', 'c'],
      preference: { allocation: detached.regions, requirements: needs }
    });
    expect(plan?.kind).toBe('split');
    expect(JSON.stringify(plan?.layout)).not.toContain('null');
    const root = plan?.layout.root;
    if (root?.type !== 'split') throw new Error('Expected split');
    expect(root.weights.every(weight => Number.isFinite(weight) && weight > 0)).toBe(true);
  });

  it('fits the new gutter and both minima inside the recipient without moving its neighbor', () => {
    const saved = layout(split('horizontal', [pane('a'), pane('b'), pane('c')]));
    const needs: WorkspaceRequirements = {
      chrome: { width: 20, height: 20 },
      panels: new Map([
        ['a', { width: 120, height: 20 }],
        ['b', { width: 250, height: 20 }],
        ['c', { width: 120, height: 20 }]
      ])
    };
    const detached = geometry(detachedLayout(saved, ['a']), viewport, needs);
    for (const [target, position] of [
      ['b', 'right'],
      ['c', 'left']
    ] as const) {
      const plan = planWorkspacePlacement({
        layout: saved,
        source: ['a'],
        destination: { target, position },
        available: ['a', 'b', 'c'],
        operation: 'split',
        preference: { allocation: detached.regions, requirements: needs }
      })!;
      const after = geometry(plan.layout, viewport, needs);
      const donor = detached.groups.find(group => group.pane.panels.includes(target))!.rect;
      const incoming = after.groups.find(group => group.pane.panels.includes('a'))!.rect;
      const other = target === 'b' ? 'c' : 'b';
      expect(incoming.x).toBeGreaterThanOrEqual(donor.x);
      expect(incoming.x + incoming.width).toBeLessThanOrEqual(donor.x + donor.width + 0.000001);
      expect(after.groups.find(group => group.pane.panels.includes(other))!.rect).toEqual(
        detached.groups.find(group => group.pane.panels.includes(other))!.rect
      );
      expect(after.groups.find(group => group.pane.panels.includes('b'))!.rect.width).toBeGreaterThanOrEqual(250);
    }
  });
});
