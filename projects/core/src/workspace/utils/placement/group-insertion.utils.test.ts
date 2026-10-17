// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { projectLayout } from '../model/operations.utils.js';
import { parseWorkspaceValue } from '../model/value.utils.js';
import { describePlacementSlot, planGroupInsertion } from './group-insertion.utils.js';

import type { WorkspaceNode } from '../model/layout.utils.js';

const group = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels.at(-1)! });
const split = (axis: 'horizontal' | 'vertical', weights: number[], ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  weights,
  children
});
const saved = (root: WorkspaceNode, closed: string[] = []) => {
  const value = parseWorkspaceValue(JSON.stringify({ version: 1, root, closed }));
  if (!value) throw new Error('Expected a workspace layout');
  return value;
};
const arrangement = () =>
  saved(split('horizontal', [2, 3], group('a', 'companion'), split('vertical', [1, 1], group('b'), group('c'))));
const visible = (layout: ReturnType<typeof saved>) => projectLayout(layout, ['a', 'companion', 'b', 'c']).root;

function insert(
  region: string,
  { layout = arrangement(), source = ['companion'] }: { layout?: ReturnType<typeof saved>; source?: string[] } = {}
) {
  return planGroupInsertion({
    layout,
    source,
    destination: { target: region === 'root' ? 'a' : 'b', region, position: 'right' },
    available: ['a', 'companion', 'b', 'c', 'dormant']
  });
}

describe('workspace owner-slot insertion', () => {
  it.each(['horizontal', 'vertical'] as const)('inserts a whole tabbed group between %s receiving peers', axis => {
    const layout = saved(
      split(
        axis === 'horizontal' ? 'vertical' : 'horizontal',
        [2, 3],
        group('a', 'companion'),
        split(axis, [1, 4], group('b'), group('c'))
      )
    );
    const plan = planGroupInsertion({
      layout,
      source: ['a', 'companion'],
      available: ['a', 'companion', 'b', 'c'],
      destination: { target: 'c', region: 'root.1.1', position: axis === 'horizontal' ? 'left' : 'top' }
    });
    expect(plan?.kind).toBe('insert');
    const result = plan && visible(plan.layout);
    if (result?.type !== 'split') throw new Error('Expected receiving arrangement');
    expect(result.axis).toBe(axis);
    expect(result.children).toEqual([group('b'), group('a', 'companion'), group('c')]);
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
    expect(result.children.map(child => (child.type === 'group' ? child.panels : 'group'))).toEqual([
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
        split('vertical', [1, 1], group('a'), group('companion')),
        split('vertical', [1, 1], group('b'), group('c'))
      )
    );
    const input = {
      layout,
      source: ['companion'],
      available: ['a', 'companion', 'b', 'c']
    };
    const after = planGroupInsertion({
      ...input,
      destination: { target: 'a', region: 'root.0', position: 'right' }
    });
    const before = planGroupInsertion({
      ...input,
      destination: { target: 'b', region: 'root.1', position: 'left' }
    });
    expect(after?.kind).toBe('insert');
    expect(after).toEqual(before);
  });

  it('counts residual visible direct peers while keeping dormant payloads and active tabs', () => {
    const layout = saved(
      split(
        'horizontal',
        [2, 1, 3],
        group('a', 'companion'),
        group('dormant'),
        split('vertical', [1, 1], group('b'), group('c'))
      ),
      ['dormant']
    );
    const result = insert('root.1', { layout })!;
    expect(result.layout.closed).toEqual(['dormant']);
    expect(result.layout.root).toMatchObject({
      type: 'split',
      children: [
        group('a'),
        group('dormant'),
        { type: 'split', children: [group('b'), group('c')] },
        group('companion')
      ]
    });
    const root = visible(result.layout);
    if (root?.type !== 'split') throw new Error('Expected owner split');
    root.weights.forEach((weight, index) => expect(weight).toBeCloseTo([4 / 15, 2 / 5, 1 / 3][index]!, 10));
    expect(root.children.at(-1)).toEqual(group('companion'));
  });

  it('introduces a perpendicular outer owner as two slots without splitting an internal group', () => {
    const layout = arrangement();
    const result = planGroupInsertion({
      layout,
      source: ['companion'],
      destination: { target: 'a', region: 'root', position: 'top' },
      available: ['a', 'companion', 'b', 'c']
    })!;
    const root = visible(result.layout);
    if (root?.type !== 'split') throw new Error('Expected outer owner');
    expect(root.axis).toBe('vertical');
    expect(root.weights).toEqual([0.5, 0.5]);
    expect(root.children[1]?.type).toBe('split');
  });

  it('keeps slot identity independent of preferred proportions', () => {
    const plan = { layout: saved(split('horizontal', [2, 3, 5], group('a'), group('companion'), group('b', 'c'))) };
    const copy = structuredClone(plan);
    if (copy.layout.root?.type !== 'split') throw new Error('Expected a split');
    copy.layout.root.weights = [5, 2, 3];
    const input = { source: ['companion'], available: ['a', 'companion', 'b', 'c'] };
    const slot = describePlacementSlot({ ...input, plan });
    expect(slot).toMatchObject({
      axis: 'horizontal',
      index: 1,
      previous: ['a'],
      next: ['b', 'c'],
      members: ['a', 'b', 'c']
    });
    expect(describePlacementSlot({ ...input, plan: copy })?.key).toBe(slot?.key);
  });
});
