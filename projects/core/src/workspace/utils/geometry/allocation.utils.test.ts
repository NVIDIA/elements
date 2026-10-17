// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { allocateWorkspace } from './allocation.utils.js';

import type { WorkspaceGroup, WorkspaceSplit } from '../model/layout.utils.js';

const group = (id: string): WorkspaceGroup => ({ type: 'group', panels: [id], active: id });

describe('workspace geometry allocation', () => {
  it('leaves an empty arrangement without allocated regions or dividers', () => {
    expect(
      allocateWorkspace({
        root: null,
        rect: { x: 10, y: 20, width: 300, height: 300 },
        minimum: () => ({ width: 20, height: 20 }),
        policy: 'stop',
        gap: 6
      })
    ).toEqual({ groups: [], regions: [], boundaries: [] });
  });

  it.each(['horizontal', 'vertical'] as const)('retains region paths and offsets through nested %s placement', axis => {
    const root: WorkspaceSplit = {
      type: 'split',
      axis,
      weights: [1, 1],
      children: [
        group('a'),
        {
          type: 'split',
          axis: axis === 'horizontal' ? 'vertical' : 'horizontal',
          weights: [1, 1],
          children: [group('b'), group('c')]
        }
      ]
    };
    const { groups, regions, boundaries } = allocateWorkspace({
      root,
      rect: { x: 10, y: 20, width: 310, height: 310 },
      minimum: () => ({ width: 20, height: 20 }),
      policy: 'stop',
      gap: 10
    });
    expect(regions.map(region => region.key)).toEqual(['root', 'root.0', 'root.1', 'root.1.0', 'root.1.1']);
    expect(groups.map(item => ({ key: item.key, panels: item.group.panels, rect: item.rect }))).toEqual(
      axis === 'horizontal'
        ? [
            { key: 'root.0', panels: ['a'], rect: { x: 10, y: 20, width: 150, height: 310 } },
            { key: 'root.1.0', panels: ['b'], rect: { x: 170, y: 20, width: 150, height: 150 } },
            { key: 'root.1.1', panels: ['c'], rect: { x: 170, y: 180, width: 150, height: 150 } }
          ]
        : [
            { key: 'root.0', panels: ['a'], rect: { x: 10, y: 20, width: 310, height: 150 } },
            { key: 'root.1.0', panels: ['b'], rect: { x: 10, y: 180, width: 150, height: 150 } },
            { key: 'root.1.1', panels: ['c'], rect: { x: 170, y: 180, width: 150, height: 150 } }
          ]
    );
    expect(boundaries.map(item => ({ key: item.key, rect: item.rect }))).toEqual(
      axis === 'horizontal'
        ? [
            { key: 'root:0', rect: { x: 160, y: 20, width: 10, height: 310 } },
            { key: 'root.1:0', rect: { x: 170, y: 170, width: 150, height: 10 } }
          ]
        : [
            { key: 'root:0', rect: { x: 10, y: 170, width: 310, height: 10 } },
            { key: 'root.1:0', rect: { x: 160, y: 180, width: 10, height: 150 } }
          ]
    );
  });

  it('applies unequal parent shares before subdividing a nested region', () => {
    const root: WorkspaceSplit = {
      type: 'split',
      axis: 'horizontal',
      weights: [2, 8],
      children: [group('a'), { type: 'split', axis: 'vertical', weights: [1, 1], children: [group('b'), group('c')] }]
    };
    const allocation = allocateWorkspace({
      root,
      gap: 6,
      rect: { x: 0, y: 0, width: 606, height: 406 },
      minimum: () => ({ width: 0, height: 0 }),
      policy: 'stop'
    });
    expect(allocation.regions.find(region => region.key === 'root.1')!.rect).toEqual({
      x: 126,
      y: 0,
      width: 480,
      height: 406
    });
  });

  it.each([0, 12])('uses a %ipx gap for allocated regions and boundary geometry', gap => {
    const { groups, boundaries } = allocateWorkspace({
      root: { type: 'split', axis: 'vertical', weights: [1, 1], children: [group('a'), group('b')] },
      rect: { x: 0, y: 0, width: 300, height: 300 },
      minimum: () => ({ width: 20, height: 20 }),
      policy: 'stop',
      gap
    });
    const [first, second] = groups;
    expect(first!.rect.height).toBe((300 - gap) / 2);
    expect(second!.rect.y - first!.rect.y - first!.rect.height).toBe(gap);
    expect(boundaries[0]!.rect.height).toBe(gap);
  });

  it.each([
    {
      axis: 'horizontal',
      policy: 'stop',
      ranges: [
        [100, 20, 220],
        [300, 180, 480]
      ]
    },
    {
      axis: 'horizontal',
      policy: 'propagate',
      ranges: [
        [100, 20, 400],
        [300, 100, 480]
      ]
    },
    {
      axis: 'vertical',
      policy: 'stop',
      ranges: [
        [500, 380, 580],
        [300, 120, 420]
      ]
    },
    {
      axis: 'vertical',
      policy: 'propagate',
      ranges: [
        [500, 200, 580],
        [300, 120, 500]
      ]
    }
  ] as const)('publishes $axis divider limits for the $policy policy', ({ axis, policy, ranges }) => {
    const root: WorkspaceSplit = {
      type: 'split',
      axis,
      weights: [1, 2, 3],
      children: [group('a'), group('b'), group('c')]
    };
    const minima: Record<string, number> = { a: 20, b: 80, c: 120 };
    const { boundaries } = allocateWorkspace({
      root,
      rect: { x: 10, y: 20, width: 620, height: 620 },
      minimum: node => {
        const size = node.type === 'group' ? minima[node.active]! : 0;
        return { width: size, height: size };
      },
      policy,
      gap: 10
    });
    expect(boundaries.map(({ value, min, max }) => [value, min, max])).toEqual(ranges);
    for (const [index, boundary] of boundaries.entries()) {
      expect(boundary.branch).toBe(root);
      expect(boundary.index).toBe(index);
      expect(boundary.sizes).toEqual([100, 200, 300]);
      expect(boundary.minima).toEqual([20, 80, 120]);
    }
  });
});
