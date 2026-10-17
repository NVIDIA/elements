// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { parseLayout, type WorkspaceNode } from './workspace-layout.utils.js';
import { planWorkspacePlacement } from './workspace-planner.utils.js';
import { projectLayout } from './workspace-operations.utils.js';

const pane = (...panels: string[]): WorkspaceNode => ({ type: 'pane', panels, active: panels.at(-1)! });
const split = (axis: 'horizontal' | 'vertical', weights: number[], ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  weights,
  children
});
const saved = (root: WorkspaceNode, closed: string[] = []) => parseLayout(JSON.stringify({ version: 1, root, closed }));
const arrangement = () =>
  saved(split('horizontal', [2, 3], pane('a', 'companion'), split('vertical', [1, 1], pane('b'), pane('c'))));
const visible = (layout: ReturnType<typeof saved>) => projectLayout(layout, ['a', 'companion', 'b', 'c']).root;

function insert(
  region: string,
  { layout = arrangement(), source = ['companion'] }: { layout?: ReturnType<typeof saved>; source?: string[] } = {}
) {
  return planWorkspacePlacement({
    layout,
    source,
    destination: { target: region === 'root' ? 'a' : 'b', region, position: 'right' },
    operation: 'insert',
    available: ['a', 'companion', 'b', 'c', 'dormant']
  });
}

describe('workspace owner-slot insertion', () => {
  it.each(['horizontal', 'vertical'] as const)('inserts a whole tabbed pane between %s receiving peers', axis => {
    const layout = saved(
      split(
        axis === 'horizontal' ? 'vertical' : 'horizontal',
        [2, 3],
        pane('a', 'companion'),
        split(axis, [1, 4], pane('b'), pane('c'))
      )
    );
    const plan = planWorkspacePlacement({
      layout,
      source: ['a', 'companion'],
      operation: 'insert',
      available: ['a', 'companion', 'b', 'c'],
      destination: { target: 'c', region: 'root.1.1', position: axis === 'horizontal' ? 'left' : 'top' }
    });
    expect(plan?.kind).toBe('insert');
    const result = plan && visible(plan.layout);
    if (result?.type !== 'split') throw new Error('Expected receiving arrangement');
    expect(result.axis).toBe(axis);
    expect(result.children).toEqual([pane('b'), pane('a', 'companion'), pane('c')]);
    result.weights.forEach((weight, index) => expect(weight).toBeCloseTo([2 / 15, 1 / 3, 8 / 15][index]!, 10));
  });

  it('normalizes receiving arrangement and workspace approaches to the same insertion', () => {
    const branch = insert('root.1')!;
    const root = insert('root')!;
    expect(branch.kind).toBe('insert');
    expect(branch).toEqual(root);
    const result = visible(branch.layout);
    expect(result?.type).toBe('split');
    if (result?.type !== 'split') throw new Error('Expected owner split');
    expect(result.children.map(child => (child.type === 'pane' ? child.panels : 'group'))).toEqual([
      ['a'],
      'group',
      ['companion']
    ]);
    const expected = [4 / 15, 2 / 5, 1 / 3];
    result.weights.forEach((weight, index) => expect(weight).toBeCloseTo(expected[index]!, 10));
    expect(branch.context).toEqual({ kind: 'rail', members: ['a', 'companion', 'b', 'c'] });
  });

  it('normalizes two arrangement approaches to one interior slot', () => {
    const layout = saved(
      split(
        'horizontal',
        [2, 3],
        split('vertical', [1, 1], pane('a'), pane('companion')),
        split('vertical', [1, 1], pane('b'), pane('c'))
      )
    );
    const input = {
      layout,
      source: ['companion'],
      operation: 'insert' as const,
      available: ['a', 'companion', 'b', 'c']
    };
    const after = planWorkspacePlacement({
      ...input,
      destination: { target: 'a', region: 'root.0', position: 'right' }
    });
    const before = planWorkspacePlacement({
      ...input,
      destination: { target: 'b', region: 'root.1', position: 'left' }
    });
    expect(after?.kind).toBe('insert');
    expect(after).toEqual(before);
  });

  it('retains resulting proportions when an inserted tab rejoins its original pane', () => {
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

  it('counts residual visible direct peers while keeping dormant payloads and active tabs', () => {
    const layout = saved(
      split(
        'horizontal',
        [2, 1, 3],
        pane('a', 'companion'),
        pane('dormant'),
        split('vertical', [1, 1], pane('b'), pane('c'))
      ),
      ['dormant']
    );
    const result = insert('root.1', { layout })!;
    expect(result.layout.closed).toEqual(['dormant']);
    expect(JSON.stringify(result.layout.root)).toContain('dormant');
    const root = visible(result.layout);
    if (root?.type !== 'split') throw new Error('Expected owner split');
    root.weights.forEach((weight, index) => expect(weight).toBeCloseTo([4 / 15, 2 / 5, 1 / 3][index]!, 10));
    expect(root.children.at(-1)).toEqual(pane('companion'));
  });

  it('introduces a perpendicular outer owner as two slots without splitting an internal group', () => {
    const layout = arrangement();
    const result = planWorkspacePlacement({
      layout,
      source: ['companion'],
      destination: { target: 'a', region: 'root', position: 'top' },
      operation: 'insert',
      available: ['a', 'companion', 'b', 'c']
    })!;
    const root = visible(result.layout);
    if (root?.type !== 'split') throw new Error('Expected outer owner');
    expect(root.axis).toBe('vertical');
    expect(root.weights).toEqual([0.5, 0.5]);
    expect(root.children[1]?.type).toBe('split');
  });
});
