// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import { placePanels, projectLayout } from '../model/operations.utils.js';
import { createWorkspaceLayoutProjector } from '../model/projection.utils.js';
import { parseWorkspaceValue } from '../model/value.utils.js';
import { createWorkspacePlacementPlanner, planWorkspacePlacement } from './planner.utils.js';

import type { WorkspaceLayout, WorkspaceNode } from '../model/layout.utils.js';

const group = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels[0]! });
const split = (axis: 'horizontal' | 'vertical', weights: number[], ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  weights,
  children
});
const createLayout = (root: WorkspaceNode, closed: string[] = []) => {
  const value = parseWorkspaceValue(JSON.stringify({ version: 1, root, closed }));
  if (!value) throw new Error('Expected a workspace layout');
  return value;
};

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
    const saved = createLayout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c')));
    const original = structuredClone(saved);
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
    expect(saved).toEqual(original);
  });

  it('rejects explicit ordering for a partial tab instead of silently converting it into a split', () => {
    const saved = createLayout(split('horizontal', [2, 3], group('a', 'companion'), group('b')));
    const input = {
      layout: saved,
      source: ['companion'],
      destination: { target: 'b', position: 'left' as const },
      available: ['a', 'companion', 'b']
    };
    expect(planWorkspacePlacement({ ...input, operation: 'order' })).toBeUndefined();
    expect(planWorkspacePlacement({ ...input, operation: 'split' })?.kind).toBe('split');
  });

  it('retains the original peer slot as an unchanged reservation with its rail context', () => {
    const saved = createLayout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c')));
    const original = structuredClone(saved);
    expect(
      planWorkspacePlacement({
        layout: saved,
        source: ['b'],
        operation: 'order',
        available: ['a', 'b', 'c'],
        destination: { target: 'b', position: 'left' }
      })
    ).toEqual({
      kind: 'reorder',
      layout: original,
      context: { kind: 'rail', members: ['a', 'b', 'c'] }
    });
    expect(saved).toEqual(original);
  });

  it('moves whole peer groups with their preferred weights through repeated moves', () => {
    const saved = createLayout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c')));
    const first = plan(saved, ['c'], { target: 'b' })!;
    expect(row(first).weights).toEqual([0.2, 0.3, 0.5]);
    const second = plan(first, ['b'], { target: 'a' })!;
    expect(row(second).weights).toEqual([0.5, 0.2, 0.3]);
    const restored = plan(second, ['a'], { target: 'b' })!;
    expect(row(restored).weights).toEqual([0.2, 0.5, 0.3]);
    expect(saved.root).toEqual(createLayout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c'))).root);
  });

  it('recognizes adjacent peer no-ops without falling back to recipient splitting', () => {
    const saved = createLayout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c')));
    expect(plan(saved, ['b'], { target: 'c' })).toEqual(saved);
  });

  it('round-trips dormant saved slots and preferences through projected peer moves', () => {
    const saved = createLayout(
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
    if (restoredRoot?.type !== 'split' || savedRoot?.type !== 'split') throw new Error('Expected saved splits');
    expect({ ...restored, root: { ...restoredRoot, weights: savedRoot.weights } }).toEqual(saved);
    restoredRoot.weights.forEach((weight, index) => expect(weight).toBeCloseTo(savedRoot.weights[index]!, 14));
    expect(moved.closed).toEqual(['c']);
  });

  it('permutes mixed intervening peer regions without promoting nested targets', () => {
    const saved = createLayout(
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
    const columns = createLayout(
      split(
        'horizontal',
        [1, 1],
        split('vertical', [1, 1], group('a'), group('b')),
        split('vertical', [1, 1], group('c'), group('d'))
      )
    );
    const rows = createLayout(
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
    const saved = createLayout(split('horizontal', [2, 1], group('a'), group('b', 'companion')), ['companion']);
    const whole = plan(saved, ['b', 'companion'], { target: 'a' })!;
    expect(row(whole).weights).toEqual([1 / 3, 2 / 3]);
    expect(whole.closed).toEqual(['companion']);
    expect(whole.root).toMatchObject({ type: 'split', children: [group('b', 'companion'), group('a')] });
    const tab = plan(saved, ['b'], { target: 'a', operation: 'split' })!;
    expect(tab.closed).toEqual(['companion']);
    expect(row({ ...tab, closed: [] }).children).toEqual(expect.arrayContaining([group('companion')]));
    expect(row(tab).weights).toEqual([0.5, 0.5]);
  });

  it.each([
    { operation: 'tab' as const, position: 'left' as const },
    { operation: 'split' as const, position: 'tab' as const }
  ])('rejects $operation placement at $position before projecting', ({ operation, position }) => {
    const project = vi.fn(projectLayout);
    expect(
      planWorkspacePlacement({
        layout: createLayout(split('horizontal', [1, 1], group('a'), group('b'))),
        source: ['a'],
        available: ['a', 'b'],
        destination: { target: 'b', position },
        operation,
        projectLayout: project
      })
    ).toBeUndefined();
    expect(project).not.toHaveBeenCalled();
  });

  describe('workspace insertion routing', () => {
    const insertionGroup = (...panels: string[]): WorkspaceNode => ({
      type: 'group',
      panels,
      active: panels.at(-1)!
    });
    const arrangement = () =>
      createLayout(
        split(
          'horizontal',
          [2, 3],
          insertionGroup('a', 'companion'),
          split('vertical', [1, 1], insertionGroup('b'), insertionGroup('c'))
        )
      );
    const visible = (layout: WorkspaceLayout) => projectLayout(layout, ['a', 'companion', 'b', 'c']).root;

    function insert(
      region: string,
      { layout = arrangement(), source = ['companion'] }: { layout?: WorkspaceLayout; source?: string[] } = {}
    ) {
      return planWorkspacePlacement({
        layout,
        source,
        destination: { target: region === 'root' ? 'a' : 'b', region, position: 'right' },
        operation: 'insert',
        available: ['a', 'companion', 'b', 'c', 'dormant']
      });
    }

    it('retains resulting proportions when an inserted tab rejoins its original group', () => {
      const inserted = insert('root.1')!;
      const returned = planWorkspacePlacement({
        layout: inserted.layout,
        source: ['companion'],
        operation: 'tab',
        destination: { target: 'a', position: 'tab' },
        available: ['a', 'companion', 'b', 'c']
      })!;
      const root = visible(returned.layout);
      if (root?.type !== 'split') throw new Error('Expected owner split');
      expect(root.weights[0]).toBeCloseTo(0.4, 10);
      expect(root.weights[1]).toBeCloseTo(0.6, 10);
    });

    it('preserves traveling weights for a whole existing peer instead of assigning a new slot', () => {
      const result = insert('root.1', { source: ['a', 'companion'] })!;
      expect(result.kind).toBe('reorder');
      const root = visible(result.layout);
      expect(root?.type).toBe('split');
      if (root?.type !== 'split') throw new Error('Expected owner split');
      expect(root.weights).toEqual([0.6, 0.4]);
    });
  });

  describe('workspace region routing', () => {
    const available = ['a', 'b', 'c', 'd', 'e', 'f', 'companion'];

    function place(
      layout: WorkspaceLayout,
      source: string[],
      destination: { region: string; position: 'left' | 'right' | 'top' | 'bottom'; operation?: 'split' | 'order' }
    ) {
      const { region, position, operation = 'split' } = destination;
      return planWorkspacePlacement({
        layout,
        operation,
        source,
        available,
        destination: { target: 'b', region, position }
      });
    }

    function visible(layout: WorkspaceLayout) {
      return projectLayout(layout, available).root;
    }

    it('reorders a group beside a subtree with both preferred shares intact', () => {
      const layout = createLayout(
        split('horizontal', [2, 8], group('a'), split('vertical', [1, 1], group('b'), group('c')))
      );
      const result = place(layout, ['a'], { region: 'root.1', position: 'right', operation: 'order' })!;
      expect(result.kind).toBe('reorder');
      expect(visible(result.layout)).toEqual(
        split('horizontal', [0.8, 0.2], split('vertical', [0.5, 0.5], group('b'), group('c')), group('a'))
      );
      expect(layout.root).toEqual(
        createLayout(split('horizontal', [2, 8], group('a'), split('vertical', [1, 1], group('b'), group('c')))).root
      );
    });

    it('moves closed tab companions with a whole group, leaving separate dormant nodes coherent', () => {
      const layout = createLayout(
        split(
          'horizontal',
          [2, 8],
          group('a', 'companion'),
          split('vertical', [2, 3, 1], group('b'), group('c'), group('f'))
        ),
        ['companion', 'f']
      );
      const result = place(layout, ['a', 'companion'], { region: 'root.1', position: 'right', operation: 'order' })!;
      expect(result.kind).toBe('reorder');
      expect(result.layout.closed).toEqual(layout.closed);
      expect(visible(result.layout)).toEqual(
        split(
          'horizontal',
          [0.8, 0.2],
          split('vertical', [expect.closeTo(0.4), expect.closeTo(0.6)], group('b'), group('c')),
          group('a')
        )
      );
      expect(result.layout.root).toMatchObject({
        type: 'split',
        children: [{ type: 'split', children: [group('b'), group('c'), group('f')] }, group('a', 'companion')]
      });
    });

    it('supports parent endpoints, stable own-region no-ops, and rejects vanished scope paths', () => {
      const layout = createLayout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c')));
      const result = place(layout, ['b'], { region: 'root', position: 'right', operation: 'order' })!;
      expect(result.kind).toBe('reorder');
      expect(visible(result.layout)).toEqual(split('horizontal', [0.2, 0.3, 0.5], group('a'), group('c'), group('b')));
      expect(place(layout, ['b'], { region: 'root.1', position: 'top' })?.layout).toEqual(layout);
      expect(place(layout, ['b'], { region: 'root.9', position: 'left' })).toBeUndefined();
    });

    it('recognizes an unchanged original tab position as a silent placement while allowing explicit reordering', () => {
      const layout = createLayout(split('horizontal', [1, 1], group('a', 'companion'), group('b')));
      const input = { layout, source: ['a'], operation: 'tab' as const, available };
      expect(
        planWorkspacePlacement({ ...input, destination: { target: 'companion', position: 'tab', index: 0 } })
      ).toEqual({ kind: 'tab', layout, context: { kind: 'recipient', members: ['companion'] } });
      const reordered = planWorkspacePlacement({
        ...input,
        destination: { target: 'companion', position: 'tab', index: 2 }
      })!;
      expect(reordered.kind).toBe('tab');
      expect(visible(reordered.layout)).toEqual(
        split('horizontal', [0.5, 0.5], { type: 'group', panels: ['companion', 'a'], active: 'a' }, group('b'))
      );
    });

    it('reports rail membership for explicit peer ordering', () => {
      const layout = createLayout(
        split('horizontal', [2, 5, 3], group('a'), split('vertical', [1, 1], group('b'), group('c')), group('d'))
      );
      expect(place(layout, ['d'], { region: 'root.0', position: 'left', operation: 'order' })?.context).toEqual({
        kind: 'rail',
        members: ['a', 'b', 'c', 'd']
      });
    });
  });

  describe('shared projections', () => {
    it.each([
      ...(['order', 'split', 'insert'] as const).flatMap(operation =>
        (['left', 'right', 'top', 'bottom'] as const).map(position => ({ operation, position }))
      ),
      { operation: 'tab' as const, position: 'tab' as const }
    ])('preserves $operation at $position with closed and unavailable carrier members', ({ operation, position }) => {
      const saved = createLayout(
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
      const saved = createLayout(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c')));
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
        layout: createLayout(split('horizontal', [1, 1], group('a'), group('b'))),
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
      const saved = createLayout(split('horizontal', [1, 1, 1], group('a', 'companion'), group('b'), group('c')));
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

    it.each(['saved weights', 'closed membership', 'source order', 'supplied membership', 'supplied order'] as const)(
      'rebinds when %s changes',
      dimension => {
        const resolve = createWorkspacePlacementPlanner();
        const saved = createLayout(split('horizontal', [2, 5, 3], group('a', 'companion'), group('b'), group('c')));
        const input = {
          layout: saved,
          source: ['a', 'companion'],
          available: ['a', 'companion', 'b', 'c'],
          operation: 'tab' as const,
          destination: { target: 'b', position: 'tab' as const }
        };
        const alternatives = {
          'saved weights': {
            ...input,
            layout: createLayout(split('horizontal', [3, 2, 5], group('a', 'companion'), group('b'), group('c')))
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
      }
    );
  });
});
