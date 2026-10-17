// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import { allocateWorkspace } from '../geometry/allocation.utils.js';
import { parseWorkspaceValue } from '../model/value.utils.js';
import { createWorkspacePlacementPlanner, planWorkspacePlacement } from './planner.utils.js';
import { sizePreferredSplit } from './split-sizing.utils.js';
import { WorkspaceEvaluation } from '../evaluation.utils.js';

import type { WorkspaceLayout, WorkspaceNode } from '../model/layout.utils.js';

import '../../define.js';

describe('workspace structural plan consumers', () => {
  afterEach(() => vi.restoreAllMocks());

  const group = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels[0]! });
  const split = (axis: 'horizontal' | 'vertical', weights: number[], ...children: WorkspaceNode[]): WorkspaceNode => ({
    type: 'split',
    axis,
    weights,
    children
  });
  const createLayout = (root: WorkspaceNode): WorkspaceLayout => {
    const value = parseWorkspaceValue(JSON.stringify({ version: 1, root, closed: [] }));
    if (!value) throw new Error('Expected a workspace layout');
    return value;
  };

  it('preserves the unequal peer share when ordering through a collapsed catalog scope', () => {
    const currentLayout = createLayout(split('horizontal', [1, 4], group('a'), group('b')));
    const bounds = { x: 0, y: 0, width: 800, height: 600 };
    const panels = ['a', 'b'].map(id => {
      const panel = document.createElement('nve-workspace-panel');
      panel.id = id;
      return panel;
    });
    const host = document.createElement('div');
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, bounds.width, bounds.height));
    const evaluation = new WorkspaceEvaluation(host, {
      panels,
      layout: currentLayout,
      source: ['a'],
      policy: 'stop',
      strip: () => null,
      measurements: { ...bounds, gap: 6, headerHeight: 20, gripWidth: 0, actionWidth: 0, tabWidth: 20, tabMinWidth: 0 }
    });
    const allocation = evaluation.geometry(createLayout(group('b')));
    const regions = evaluation.targetCatalog(['a'], allocation).regions;
    const plan = planWorkspacePlacement({
      layout: currentLayout,
      source: ['a'],
      operation: 'order',
      destination: { target: 'b', region: regions[0]!.key, position: 'right' },
      available: ['a', 'b']
    })!;
    expect(plan.kind).toBe('reorder');
    const after = allocateWorkspace({
      root: plan.layout.root,
      rect: bounds,
      gap: 6,
      policy: 'stop',
      minimum: () => ({ width: 20, height: 20 })
    }).groups.find(item => item.group.panels.includes('a'))!;
    expect(after.rect.width).toBeCloseTo((800 - 6) / 5, 8);
  });

  it('retains a cached split while current geometry is fitted separately', () => {
    const resolve = createWorkspacePlacementPlanner();
    const saved = createLayout(split('horizontal', [1, 1], group('a'), group('b')));
    const input = {
      layout: saved,
      source: ['a'],
      available: ['a', 'b'],
      operation: 'split' as const,
      destination: { target: 'b', position: 'left' as const }
    };
    const base = resolve(input)!;
    const before = structuredClone(base);
    const root = base.layout.root;
    if (root?.type !== 'split') throw new Error('Expected split');
    Object.freeze(root.weights);
    root.children.forEach(child => {
      if (child.type === 'group') Object.freeze(child.panels);
      Object.freeze(child);
    });
    Object.freeze(root.children);
    Object.freeze(root);
    Object.freeze(base.layout.closed);
    Object.freeze(base.layout);
    if (base.context) {
      Object.freeze(base.context.members);
      Object.freeze(base.context);
    }
    Object.freeze(base);
    const requirements = {
      gap: 6,
      chrome: { width: 64, height: 48 },
      panels: new Map([
        ['a', { width: 120, height: 48 }],
        ['b', { width: 64, height: 48 }]
      ])
    };
    const preference = (width: number) => ({
      allocation: allocateWorkspace({
        root: group('b'),
        rect: { x: 0, y: 0, width, height: 300 },
        gap: 6,
        minimum: () => ({ width: 0, height: 0 }),
        policy: 'stop'
      }).regions,
      requirements
    });
    const compact = { plan: base, source: input.source, available: input.available, preference: preference(200) };
    const wide = { ...compact, preference: preference(800) };
    const compactPlan = sizePreferredSplit(compact);
    const widePlan = sizePreferredSplit(wide);
    expect(compactPlan).toEqual(sizePreferredSplit({ ...compact, plan: planWorkspacePlacement(input)! }));
    expect(widePlan).toEqual(sizePreferredSplit({ ...wide, plan: planWorkspacePlacement(input)! }));
    expect(compactPlan.layout).not.toEqual(widePlan.layout);
    expect(base).toEqual(before);
    expect(resolve(input)).toBe(base);
  });
});
