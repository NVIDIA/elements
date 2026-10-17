// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { allocateWorkspace } from '../geometry/allocation.utils.js';
import { getMinimumWorkspaceDimensions } from '../geometry/sizing.utils.js';
import { createDetachedLayout, projectLayout } from '../model/operations.utils.js';
import { planWorkspacePlacement } from './planner.utils.js';
import { sizePreferredSplit } from './split-sizing.utils.js';

import type { WorkspaceRequirements } from '../geometry/sizing.utils.js';
import type { WorkspaceGroup, WorkspaceLayout, WorkspaceNode } from '../model/layout.utils.js';

const makeGroup = (...panels: string[]): WorkspaceGroup => ({ type: 'group', panels, active: panels[0]! });
const split = (
  axis: 'horizontal' | 'vertical',
  children: WorkspaceNode[],
  weights = children.map(() => 1)
): WorkspaceNode => ({ type: 'split', axis, children, weights });
const layout = (root: WorkspaceNode, closed: string[] = []): WorkspaceLayout => ({ version: 1, root, closed });
const requirements: WorkspaceRequirements = { gap: 6, chrome: { width: 20, height: 20 }, panels: new Map() };

const viewport = { width: 900, height: 600 };

function ids(node: WorkspaceNode | null): string[] {
  return !node ? [] : node.type === 'group' ? node.panels : node.children.flatMap(ids);
}

function geometry(saved: WorkspaceLayout, rect = viewport, needs = requirements) {
  return allocateWorkspace({
    gap: needs.gap,
    root: projectLayout(saved, ids(saved.root)).root,
    rect: { x: 0, y: 0, ...rect },
    minimum: node => getMinimumWorkspaceDimensions(node, needs),
    policy: 'stop'
  });
}

describe('workspace recipient split sizing', () => {
  it('admits an unchanged split landing without turning equivalent weight scales into a mutation', () => {
    const saved = layout(split('vertical', [makeGroup('a'), makeGroup('b')], [1, 1]));
    const detached = geometry(createDetachedLayout(saved, ['a']));
    const structural = planWorkspacePlacement({
      layout: saved,
      source: ['a'],
      destination: { target: 'b', position: 'top' },
      operation: 'split',
      available: ['a', 'b']
    })!;
    const plan = sizePreferredSplit({
      plan: structural,
      source: ['a'],
      available: ['a', 'b'],
      preference: { allocation: detached.regions, requirements }
    });
    expect(plan?.kind).toBe('split');
    expect(plan?.layout).toEqual(saved);
  });

  it('leaves an unmeasured split candidate valid for admission without fabricating zero weights', () => {
    const saved = layout(split('horizontal', [makeGroup('a'), makeGroup('b'), makeGroup('c')]));
    const needs: WorkspaceRequirements = { gap: 6, chrome: { width: 0, height: 0 }, panels: new Map() };
    const detached = geometry(createDetachedLayout(saved, ['a']), { width: 0, height: 0 }, needs);
    const structural = planWorkspacePlacement({
      layout: saved,
      source: ['a'],
      destination: { target: 'b', position: 'right' },
      operation: 'split',
      available: ['a', 'b', 'c']
    })!;
    const plan = sizePreferredSplit({
      plan: structural,
      source: ['a'],
      available: ['a', 'b', 'c'],
      preference: { allocation: detached.regions, requirements: needs }
    });
    expect(plan?.kind).toBe('split');
    const root = plan?.layout.root;
    if (root?.type !== 'split') throw new Error('Expected split');
    expect(root.weights.every(weight => Number.isFinite(weight) && weight > 0)).toBe(true);
  });

  it('fits the new gutter and both minima inside the recipient without moving its neighbor', () => {
    const saved = layout(split('horizontal', [makeGroup('a'), makeGroup('b'), makeGroup('c')]));
    const needs: WorkspaceRequirements = {
      gap: 6,
      chrome: { width: 20, height: 20 },
      panels: new Map([
        ['a', { width: 120, height: 20 }],
        ['b', { width: 250, height: 20 }],
        ['c', { width: 120, height: 20 }]
      ])
    };
    const detached = geometry(createDetachedLayout(saved, ['a']), viewport, needs);
    for (const [target, position] of [
      ['b', 'right'],
      ['c', 'left']
    ] as const) {
      const structural = planWorkspacePlacement({
        layout: saved,
        source: ['a'],
        destination: { target, position },
        available: ['a', 'b', 'c'],
        operation: 'split'
      })!;
      const plan = sizePreferredSplit({
        plan: structural,
        source: ['a'],
        available: ['a', 'b', 'c'],
        preference: { allocation: detached.regions, requirements: needs }
      });
      const after = geometry(plan.layout, viewport, needs);
      const donor = detached.groups.find(group => group.group.panels.includes(target))!.rect;
      const incoming = after.groups.find(group => group.group.panels.includes('a'))!.rect;
      const other = target === 'b' ? 'c' : 'b';
      expect(incoming.x).toBeGreaterThanOrEqual(donor.x);
      expect(incoming.x + incoming.width).toBeLessThanOrEqual(donor.x + donor.width + 0.000001);
      expect(after.groups.find(group => group.group.panels.includes(other))!.rect).toEqual(
        detached.groups.find(group => group.group.panels.includes(other))!.rect
      );
      expect(after.groups.find(group => group.group.panels.includes('b'))!.rect.width).toBeGreaterThanOrEqual(250);
    }
  });

  it.each([
    { minimum: 120, neighborWidth: 447 },
    { minimum: 250, neighborWidth: 406 }
  ])(
    'borrows neighboring space only when a recipient minimum of $minimum requires it',
    ({ minimum, neighborWidth }) => {
      const saved = layout(split('horizontal', [makeGroup('a'), makeGroup('b'), makeGroup('c')]));
      const needs: WorkspaceRequirements = {
        gap: 6,
        chrome: { width: 20, height: 20 },
        panels: new Map([
          ['a', { width: 232, height: 20 }],
          ['b', { width: minimum, height: 20 }],
          ['c', { width: 120, height: 20 }]
        ])
      };
      const detached = geometry(createDetachedLayout(saved, ['a']), viewport, needs);
      const structural = planWorkspacePlacement({
        layout: saved,
        source: ['a'],
        destination: { target: 'b', position: 'right' },
        available: ['a', 'b', 'c'],
        operation: 'split'
      })!;
      const result = sizePreferredSplit({
        plan: structural,
        source: ['a'],
        available: ['a', 'b', 'c'],
        preference: { allocation: detached.regions, requirements: needs }
      });
      const achieved = geometry(result.layout, viewport, needs);

      expect(achieved.groups.find(group => group.group.panels.includes('a'))!.rect.width).toBe(232);
      expect(achieved.groups.find(group => group.group.panels.includes('b'))!.rect.width).toBeGreaterThanOrEqual(
        minimum
      );
      expect(achieved.groups.find(group => group.group.panels.includes('c'))!.rect.width).toBe(neighborWidth);
    }
  );
});
