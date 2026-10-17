// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { parseLayout, type WorkspaceNode, type WorkspaceLayout } from './workspace-layout.utils.js';
import { placePanels, projectLayout } from './workspace-operations.utils.js';
import { planWorkspacePlacement } from './workspace-planner.utils.js';

const pane = (...panels: string[]): WorkspaceNode => ({ type: 'pane', panels, active: panels[0]! });
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
    const saved = layout(split('horizontal', [2, 5, 3], pane('a'), pane('b'), pane('c')));
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
    const saved = layout(split('horizontal', [2, 3], pane('a', 'companion'), pane('b')));
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
    const saved = layout(split('horizontal', [2, 5, 3], pane('a'), pane('b'), pane('c')));
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
    const grouped = layout(split('horizontal', [1, 1], pane('a'), pane('b', 'companion')));
    expect(
      planWorkspacePlacement({
        ...input,
        layout: grouped,
        available: ['a', 'b', 'companion'],
        destination: { target: 'b', position: 'left' }
      })
    ).toBeUndefined();
  });

  it('moves whole peer panes with their preferred weights through repeated moves', () => {
    const saved = layout(split('horizontal', [2, 5, 3], pane('a'), pane('b'), pane('c')));
    const first = plan(saved, ['c'], { target: 'b' })!;
    expect(row(first).weights).toEqual([0.2, 0.3, 0.5]);
    const second = plan(first, ['b'], { target: 'a' })!;
    expect(row(second).weights).toEqual([0.5, 0.2, 0.3]);
    const restored = plan(second, ['a'], { target: 'b' })!;
    expect(row(restored).weights).toEqual([0.2, 0.5, 0.3]);
    expect(saved.root).toEqual(layout(split('horizontal', [2, 5, 3], pane('a'), pane('b'), pane('c'))).root);
  });

  it('recognizes adjacent peer no-ops without falling back to recipient splitting', () => {
    const saved = layout(split('horizontal', [2, 5, 3], pane('a'), pane('b'), pane('c')));
    expect(plan(saved, ['b'], { target: 'c' })).toEqual(saved);
  });

  it('round-trips dormant canonical slots and preferences through projected peer moves', () => {
    const saved = layout(
      split('horizontal', [2, 1, 3], pane('a'), split('vertical', [2, 3], pane('b'), pane('c')), pane('d')),
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
      split('horizontal', [2, 3, 5], pane('a'), split('vertical', [2, 3], pane('b'), pane('c')), pane('d'))
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
        split('vertical', [1, 1], pane('a'), pane('b')),
        split('vertical', [1, 1], pane('c'), pane('d'))
      )
    );
    const rows = layout(
      split(
        'vertical',
        [1, 1],
        split('horizontal', [1, 1], pane('a'), pane('c')),
        split('horizontal', [1, 1], pane('b'), pane('d'))
      )
    );
    expect(plan(rows, ['b'], { target: 'd' })).toEqual(rows);
    expect(plan(columns, ['b'], { target: 'd' })).toBeUndefined();
    expect(plan(columns, ['b'], { target: 'd', operation: 'split' })).toBeDefined();
  });

  it('moves closed group companions with peers but retains companions when extracting one tab', () => {
    const saved = layout(split('horizontal', [2, 1], pane('a'), pane('b', 'companion')), ['companion']);
    const whole = plan(saved, ['b', 'companion'], { target: 'a' })!;
    expect(row(whole).weights).toEqual([1 / 3, 2 / 3]);
    expect(whole.closed).toEqual(['companion']);
    const tab = plan(saved, ['b'], { target: 'a', operation: 'split' })!;
    expect(tab.closed).toEqual(['companion']);
    expect(JSON.stringify(tab.root)).toContain('companion');
    expect(row(tab).weights).toEqual([0.5, 0.5]);
  });
});
