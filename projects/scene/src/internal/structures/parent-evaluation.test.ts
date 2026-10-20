// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { ParentEvaluation } from './parent-evaluation.js';

describe(ParentEvaluation.name, () => {
  it('reduces parents before children and shares cached values across branches', () => {
    const parents = new Map([
      [1, 0],
      [2, 1],
      [3, 1]
    ]);
    const getParent = vi.fn((node: number) => parents.get(node));
    const order: number[] = [];
    const evaluation = new ParentEvaluation({
      getParent,
      rootValue: { path: '' },
      invalidValue: { path: 'invalid' },
      reduce: (node, parent) => {
        order.push(node);
        return { path: `${parent.path}/${node}` };
      }
    });

    const first = evaluation.get(2);
    const shared = evaluation.get(1);
    expect(first.path).toBe('/0/1/2');
    expect(evaluation.get(3).path).toBe('/0/1/3');
    expect(evaluation.get(1)).toBe(shared);
    expect(evaluation.get(2)).toBe(first);
    expect(order).toEqual([0, 1, 2, 3]);
    expect(getParent).toHaveBeenCalledTimes(4);
  });

  it('distinguishes invalid parent paths from roots without suppressing independent branches', () => {
    const evaluation = new ParentEvaluation<number, boolean>({
      getParent: node => (node === 0 ? null : node === 1 ? 0 : undefined),
      rootValue: true,
      invalidValue: false,
      reduce: (_node, valid) => valid
    });

    expect(evaluation.get(1)).toBe(false);
    expect(evaluation.get(0)).toBe(false);
    expect(evaluation.get(2)).toBe(true);
  });

  it('caches false, null, and undefined results', () => {
    const reduce = vi.fn((node: number): boolean | null | undefined =>
      node === 0 ? false : node === 1 ? null : undefined
    );
    const evaluation = new ParentEvaluation({
      getParent: (_node: number) => undefined,
      rootValue: undefined,
      invalidValue: undefined,
      reduce
    });

    for (let repeat = 0; repeat < 2; repeat += 1) {
      expect(evaluation.get(0)).toBe(false);
      expect(evaluation.get(1)).toBeNull();
      expect(evaluation.get(2)).toBeUndefined();
    }
    expect(reduce).toHaveBeenCalledTimes(3);
  });

  it('preserves falsy and NaN node identities', () => {
    type Node = number | string | boolean;
    const parents = new Map<Node, Node>([
      [false, 0],
      ['', false],
      [NaN, '']
    ]);
    const evaluation = new ParentEvaluation<Node, number>({
      getParent: node => parents.get(node),
      rootValue: 0,
      invalidValue: -100,
      reduce: (_node, depth) => depth + 1
    });

    expect(evaluation.get(NaN)).toBe(4);
    expect(evaluation.get('')).toBe(3);
    expect(evaluation.get(false)).toBe(2);
    expect(evaluation.get(0)).toBe(1);
  });

  it('keeps cached results independent between evaluations and observes edits in a new evaluation', () => {
    const parents = new Map([[1, 0]]);
    const weights = [2, 3];
    const create = () =>
      new ParentEvaluation({
        getParent: (node: number) => parents.get(node),
        rootValue: 0,
        invalidValue: -100,
        reduce: (node, sum) => sum + weights[node]!
      });
    const first = create();
    const second = create();
    expect(first.get(1)).toBe(5);
    weights[0] = 7;
    parents.delete(1);

    expect(first.get(1)).toBe(5);
    expect(second.get(1)).toBe(3);
    parents.set(1, 0);
    expect(create().get(1)).toBe(10);
  });

  it('evaluates a deep chain once without recursion', () => {
    const count = 25_000;
    let reads = 0;
    let reductions = 0;
    const evaluation = new ParentEvaluation({
      getParent: (node: number) => {
        reads += 1;
        return node === 0 ? undefined : node - 1;
      },
      rootValue: 0,
      invalidValue: -1,
      reduce: (_node, depth) => {
        reductions += 1;
        return depth + 1;
      }
    });

    expect(evaluation.get(count - 1)).toBe(count);
    expect(evaluation.get(0)).toBe(1);
    expect(evaluation.get(count / 2)).toBe(count / 2 + 1);
    expect(reads).toBe(count);
    expect(reductions).toBe(count);
  });
});
