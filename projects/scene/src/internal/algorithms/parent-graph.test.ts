// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { findParentCycles } from './parent-graph.js';

describe(findParentCycles.name, () => {
  it('accepts empty graphs, null roots, external parents, and shared ancestors', () => {
    expect(findParentCycles(new Map())).toEqual([]);
    expect(
      findParentCycles(
        new Map([
          [0, null],
          [1, 0],
          [2, 1],
          [3, 1],
          [4, 99]
        ])
      )
    ).toEqual([]);
  });

  it('returns each cycle once without including its downstream dependents or changing edges', () => {
    const parents = new Map([
      [0, 1],
      [1, 2],
      [2, 1],
      [3, 2],
      [4, 4],
      [5, 6],
      [6, 5]
    ]);
    const before = new Map(parents);

    const cycles = findParentCycles(parents);

    expect(cycles).toEqual([[1, 2], [4], [5, 6]]);
    expect(parents).toEqual(before);
    cycles[0]?.fill(99);
    expect(parents).toEqual(before);
  });

  it('uses Map identity for objects, NaN, and falsy node identities', () => {
    const first = {};
    const second = {};
    type Node = object | number | string | boolean;
    const parents = new Map<Node, Node | null>([
      [first, second],
      [second, first],
      [NaN, NaN],
      [0, false],
      [false, ''],
      ['', 0]
    ]);

    expect(findParentCycles(parents)).toEqual([[first, second], [NaN], [0, false, '']]);
  });

  it('visits a deep chain and its shared ancestors once without recursion', () => {
    const count = 25_000;
    const parents = new Map(
      Array.from({ length: count }, (_, index) => {
        const node = count - index - 1;
        return [node, node === 0 ? null : node - 1] as const;
      })
    );
    const get = vi.spyOn(parents, 'get');

    expect(findParentCycles(parents)).toEqual([]);
    expect(get).toHaveBeenCalledTimes(count);
  });

  it('matches bounded reachability for every small single-parent graph in either insertion order', () => {
    for (let count = 1; count <= 4; count += 1) {
      const choices = count + 2;
      for (let fixture = 0; fixture < choices ** count; fixture += 1) {
        const parents = graphFixture(count, fixture);
        const expected = [...parents.keys()]
          .filter(node => returnsToNode(parents, node))
          .sort((left, right) => left - right);
        const cycles = findParentCycles(parents);

        expect(cycles.flat().sort((left, right) => left - right)).toEqual(expected);
        expectCycleEdges(parents, cycles);
      }
    }
  });
});

function expectCycleEdges(parents: ReadonlyMap<number, number | null>, cycles: readonly number[][]): void {
  for (const cycle of cycles) {
    for (let index = 0; index < cycle.length; index += 1) {
      expect(parents.get(cycle[index]!)).toBe(cycle[(index + 1) % cycle.length]);
    }
  }
}

function graphFixture(count: number, fixture: number): Map<number, number | null> {
  const entries = Array.from({ length: count }, (_, node) => {
    const choice = Math.floor(fixture / (count + 2) ** node) % (count + 2);
    return [node, choice === count + 1 ? null : choice] as const;
  });
  return new Map(fixture % 2 === 0 ? entries : entries.reverse());
}

// A cycle member returns to itself within n edges; a downstream dependent never does.
function returnsToNode(parents: ReadonlyMap<number, number | null>, node: number): boolean {
  let current = parents.get(node);
  for (let step = 0; step < parents.size; step += 1) {
    if (current === node) return true;
    if (current === null || current === undefined) return false;
    current = parents.get(current);
  }
  return false;
}
