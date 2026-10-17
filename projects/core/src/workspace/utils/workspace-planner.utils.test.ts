// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { parseLayout, type WorkspaceNode, type WorkspaceLayout } from './workspace-layout.utils.js';
import { placePanels, projectLayout } from './workspace-operations.utils.js';
import { createWorkspacePlacementPlanner, planWorkspacePlacement } from './workspace-planner.utils.js';
import { allocateWorkspace } from './workspace-placement.utils.js';
import { createWorkspaceLayoutProjector } from './workspace-projection.utils.js';
import { sizePreferredSplit } from './workspace-split-sizing.utils.js';

const group = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels[0]! });
const split = (axis: 'horizontal' | 'vertical', weights: number[], ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  weights,
  children
});
const layout = (root: WorkspaceNode, closed: string[] = []) =>
  parseLayout(JSON.stringify({ version: 1, root, closed }));

function plan(
  saved: WorkspaceLayout,
  source: string[],
  options: { target: string; position?: 'left' | 'top'; operation?: 'order' | 'split' }
) {
  return planWorkspacePlacement({
    layout: saved,
    source,
    operation: options.operation ?? 'order',
    destination: { target: options.target, position: options.position ?? 'left' },
    available: ['a', 'b', 'c', 'd', 'companion']
  })?.layout;
}

function row(saved: WorkspaceLayout) {
  const root = projectLayout(saved, ['a', 'b', 'c', 'd', 'companion']).root;
  if (root?.type !== 'split') throw new Error('Expected a split');
  return root;
}

describe('workspace placement planning', () => {
  it('distinguishes an explicit split from a weight-preserving peer order at the same destination', () => {
    const saved = layout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c')));
    const input = {
      layout: saved,
      source: ['b'],
      destination: { target: 'a', position: 'left' as const },

      available: ['a', 'b', 'c']
    };
    const ordered = planWorkspacePlacement({ ...input, operation: 'order' });
    const divided = planWorkspacePlacement({ ...input, operation: 'split' });
    expect(ordered?.kind).toBe('reorder');
    expect(divided?.kind).toBe('split');
    expect(row(ordered!.layout).weights).toEqual([0.5, 0.2, 0.3]);
    expect(row(divided!.layout).weights).not.toEqual(row(ordered!.layout).weights);
    expect(saved).toEqual(input.layout);
  });

  it('rejects explicit ordering for a partial tab instead of silently converting it into a split', () => {
    const saved = layout(split('horizontal', [2, 3], group('a', 'companion'), group('b')));
    const input = {
      layout: saved,
      source: ['companion'],
      destination: { target: 'b', position: 'left' as const },

      available: ['a', 'companion', 'b']
    };
    expect(planWorkspacePlacement({ ...input, operation: 'order' })).toBeUndefined();
    expect(planWorkspacePlacement({ ...input, operation: 'split' })?.kind).toBe('split');
  });

  it('classifies peer reservations and valid original-slot no-ops explicitly', () => {
    const saved = layout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c')));
    const input = { layout: saved, source: ['b'], operation: 'order' as const, available: ['a', 'b', 'c'] };
    expect(planWorkspacePlacement({ ...input, destination: { target: 'a', position: 'left' } })?.kind).toBe('reorder');
    expect(planWorkspacePlacement({ ...input, destination: { target: 'b', position: 'left' } })).toEqual({
      kind: 'reorder',
      layout: saved,
      context: { kind: 'rail', members: ['a', 'b', 'c'] }
    });
    expect(
      planWorkspacePlacement({ ...input, operation: 'split', destination: { target: 'a', position: 'top' } })?.kind
    ).toBe('split');
    expect(
      planWorkspacePlacement({ ...input, operation: 'tab', destination: { target: 'a', position: 'tab' } })?.kind
    ).toBe('tab');
    const grouped = layout(split('horizontal', [1, 1], group('a'), group('b', 'companion')));
    expect(
      planWorkspacePlacement({
        ...input,
        layout: grouped,
        available: ['a', 'b', 'companion'],
        destination: { target: 'b', position: 'left' }
      })
    ).toBeUndefined();
  });

  it('moves whole peer groups with their preferred weights through repeated moves', () => {
    const saved = layout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c')));
    const first = plan(saved, ['c'], { target: 'b' })!;
    expect(row(first).weights).toEqual([0.2, 0.3, 0.5]);
    const second = plan(first, ['b'], { target: 'a' })!;
    expect(row(second).weights).toEqual([0.5, 0.2, 0.3]);
    const restored = plan(second, ['a'], { target: 'b' })!;
    expect(row(restored).weights).toEqual([0.2, 0.5, 0.3]);
    expect(saved.root).toEqual(layout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c'))).root);
  });

  it('recognizes adjacent peer no-ops without falling back to recipient splitting', () => {
    const saved = layout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c')));
    expect(plan(saved, ['b'], { target: 'c' })).toEqual(saved);
  });

  it('round-trips dormant canonical slots and preferences through projected peer moves', () => {
    const saved = layout(
      split('horizontal', [2, 1, 3], group('a'), split('vertical', [2, 3], group('b'), group('c')), group('d')),
      ['c']
    );
    const moved = plan(saved, ['d'], { target: 'a' })!;
    const restored = planWorkspacePlacement({
      layout: moved,
      source: ['d'],
      operation: 'order',
      destination: { target: 'b', position: 'right' },

      available: ['a', 'b', 'c', 'd']
    })!.layout;
    const restoredRoot = restored.root;
    const savedRoot = saved.root;
    if (restoredRoot?.type !== 'split' || savedRoot?.type !== 'split') throw new Error('Expected canonical splits');
    expect({ ...restored, root: { ...restoredRoot, weights: savedRoot.weights } }).toEqual(saved);
    restoredRoot.weights.forEach((weight, index) => expect(weight).toBeCloseTo(savedRoot.weights[index]!, 14));
    expect(moved.closed).toEqual(['c']);
  });

  it('permutes mixed intervening peer regions without promoting nested targets', () => {
    const saved = layout(
      split('horizontal', [2, 3, 5], group('a'), split('vertical', [2, 3], group('b'), group('c')), group('d'))
    );
    const moved = plan(saved, ['d'], { target: 'a' })!;
    expect(row(moved).weights).toEqual([0.5, 0.2, 0.3]);
    expect(row(moved).children[2]).toEqual(row(saved).children[1]);
    expect(plan(saved, ['d'], { target: 'b' })).toBeUndefined();
    expect(plan(saved, ['d'], { target: 'b', operation: 'split' })).toEqual(
      placePanels({ layout: saved, source: ['d'], destination: { target: 'b', position: 'left' } })
    );
  });

  it('distinguishes visible alignment across different structural branches', () => {
    const columns = layout(
      split(
        'horizontal',
        [1, 1],
        split('vertical', [1, 1], group('a'), group('b')),
        split('vertical', [1, 1], group('c'), group('d'))
      )
    );
    const rows = layout(
      split(
        'vertical',
        [1, 1],
        split('horizontal', [1, 1], group('a'), group('c')),
        split('horizontal', [1, 1], group('b'), group('d'))
      )
    );
    expect(plan(rows, ['b'], { target: 'd' })).toEqual(rows);
    expect(plan(columns, ['b'], { target: 'd' })).toBeUndefined();
    expect(plan(columns, ['b'], { target: 'd', operation: 'split' })).toBeDefined();
  });

  it('moves closed group companions with peers but retains companions when extracting one tab', () => {
    const saved = layout(split('horizontal', [2, 1], group('a'), group('b', 'companion')), ['companion']);
    const whole = plan(saved, ['b', 'companion'], { target: 'a' })!;
    expect(row(whole).weights).toEqual([1 / 3, 2 / 3]);
    expect(whole.closed).toEqual(['companion']);
    const tab = plan(saved, ['b'], { target: 'a', operation: 'split' })!;
    expect(tab.closed).toEqual(['companion']);
    expect(JSON.stringify(tab.root)).toContain('companion');
    expect(row(tab).weights).toEqual([0.5, 0.5]);
  });

  describe('shared projections', () => {
    it.each(
      (['order', 'split', 'insert', 'tab'] as const).flatMap(operation =>
        (['left', 'right', 'top', 'bottom', 'tab'] as const).map(position => ({ operation, position }))
      )
    )('preserves $operation at $position with closed and unavailable carrier members', ({ operation, position }) => {
      const saved = layout(
        split('horizontal', [2, 3], group('a', 'companion'), split('vertical', [1, 4], group('b'), group('c', 'd'))),
        ['companion']
      );
      const project = createWorkspaceLayoutProjector();
      const input = {
        layout: saved,
        source: ['b'],
        destination: { target: 'c', region: position === 'tab' ? undefined : 'root.1', position },
        available: ['a', 'b', 'c', 'companion'],
        operation
      };
      const expected = planWorkspacePlacement(input);
      expect(planWorkspacePlacement({ ...input, projectLayout: project })).toEqual(expected);
      expect(planWorkspacePlacement({ ...input, projectLayout: project })).toEqual(expected);
    });
  });

  describe('reusable structural plans', () => {
    it('reuses a structural result across equivalent source and available arrays', () => {
      const saved = layout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c')));
      const project = vi.fn(projectLayout);
      const resolve = createWorkspacePlacementPlanner();
      const input = {
        layout: saved,
        source: ['b'],
        available: ['a', 'b', 'c'],
        destination: { target: 'a', position: 'left' as const },
        operation: 'order' as const,
        projectLayout: project
      };
      const first = resolve(input);
      expect(first).toBeDefined();
      const calls = project.mock.calls.length;
      expect(resolve({ ...input, source: [...input.source], available: [...input.available] })).toBe(first);
      expect(project).toHaveBeenCalledTimes(calls);
    });

    it('reuses a missing result rather than repeating the unavailable plan', () => {
      const project = vi.fn(projectLayout);
      const resolve = createWorkspacePlacementPlanner();
      const input = {
        layout: layout(split('horizontal', [1, 1], group('a'), group('b'))),
        source: ['b'],
        available: ['a', 'b'],
        destination: { target: 'missing', position: 'left' as const },
        operation: 'order' as const,
        projectLayout: project
      };
      expect(resolve(input)).toBeUndefined();
      expect(project).toHaveBeenCalledTimes(1);
      expect(resolve(input)).toBeUndefined();
      expect(project).toHaveBeenCalledTimes(1);
    });

    it('distinguishes operation, region, side, target, and explicit tab indexes', () => {
      const resolve = createWorkspacePlacementPlanner();
      const saved = layout(split('horizontal', [1, 1, 1], group('a', 'companion'), group('b'), group('c')));
      const context = { layout: saved, source: ['b'], available: ['a', 'companion', 'b', 'c'] };
      const requests = [
        { operation: 'order', destination: { target: 'a', position: 'left' } },
        { operation: 'split', destination: { target: 'a', position: 'left' } },
        { operation: 'insert', destination: { target: 'a', region: 'root', position: 'left' } },
        { operation: 'split', destination: { target: 'a', region: 'root.0', position: 'left' } },
        { operation: 'split', destination: { target: 'a', position: 'right' } },
        { operation: 'split', destination: { target: 'c', position: 'left' } },
        { operation: 'tab', destination: { target: 'a', position: 'tab' } },
        { operation: 'tab', destination: { target: 'a', position: 'tab', index: 0 } },
        { operation: 'tab', destination: { target: 'a', position: 'tab', index: 1 } }
      ] as const;
      const plans = requests.map(request => resolve({ ...context, ...request }));
      requests.forEach((request, index) => {
        expect(plans[index]).toEqual(planWorkspacePlacement({ ...context, ...request }));
        expect(resolve({ ...context, ...request })).toBe(plans[index]);
      });
      expect(plans[6]!.layout).not.toEqual(plans[7]!.layout);
      expect(plans[7]!.layout).not.toEqual(plans[8]!.layout);
    });

    it.each([
      'canonical weights',
      'closed membership',
      'source order',
      'supplied membership',
      'supplied order'
    ] as const)('rebinds when %s changes', dimension => {
      const resolve = createWorkspacePlacementPlanner();
      const saved = layout(split('horizontal', [2, 5, 3], group('a', 'companion'), group('b'), group('c')));
      const input = {
        layout: saved,
        source: ['a', 'companion'],
        available: ['a', 'companion', 'b', 'c'],
        operation: 'tab' as const,
        destination: { target: 'b', position: 'tab' as const }
      };
      const alternatives = {
        'canonical weights': {
          ...input,
          layout: layout(split('horizontal', [3, 2, 5], group('a', 'companion'), group('b'), group('c')))
        },
        'closed membership': { ...input, layout: { ...saved, closed: ['c'] } },
        'source order': { ...input, source: ['companion', 'a'] },
        'supplied membership': { ...input, available: ['a', 'companion', 'b'] },
        'supplied order': { ...input, available: ['c', 'b', 'companion', 'a'] }
      };
      const first = resolve(input);
      expect(first).toBeDefined();
      expect(resolve(input)).toBe(first);
      const candidate = alternatives[dimension];
      const candidatePlan = resolve(candidate);
      expect(candidatePlan).toEqual(planWorkspacePlacement(candidate));
      expect(candidatePlan).not.toBe(first);
      expect(resolve(candidate)).toBe(candidatePlan);
    });

    it('retains a cached split while current geometry is fitted separately', () => {
      const resolve = createWorkspacePlacementPlanner();
      const saved = layout(split('horizontal', [1, 1], group('a'), group('b')));
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
});
