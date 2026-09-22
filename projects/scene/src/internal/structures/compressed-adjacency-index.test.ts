// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { CompressedAdjacencyIndex } from './compressed-adjacency-index.js';

function targets(index: CompressedAdjacencyIndex, vertex: number): number[] {
  return Array.from({ length: index.end(vertex) - index.start(vertex) }, (_, offset) =>
    index.target(index.start(vertex) + offset)
  );
}

describe(CompressedAdjacencyIndex.name, () => {
  it('represents empty adjacency and isolated vertices', () => {
    expect(CompressedAdjacencyIndex.create(0, new Uint32Array())).toBeInstanceOf(CompressedAdjacencyIndex);
    const index = CompressedAdjacencyIndex.create(3, new Uint32Array());
    for (let vertex = 0; vertex < 3; vertex += 1) expect(targets(index, vertex)).toEqual([]);
  });

  it('retains ordered occurrences, including repeated vertices, without owning the input', () => {
    const source = new Uint32Array([2, 0, 2, 2, 1, 0]);
    const index = CompressedAdjacencyIndex.create(4, source);
    source.fill(3);
    expect(targets(index, 0)).toEqual([1, 5]);
    expect(targets(index, 1)).toEqual([4]);
    expect(targets(index, 2)).toEqual([0, 2, 3]);
    expect(targets(index, 3)).toEqual([]);
  });

  it.each([1, 7, 64, 257])('matches reverse adjacency for %i vertices', count => {
    const source = Uint32Array.from({ length: count * 13 }, (_, index) => (index * 37 + (index % 5)) % count);
    const index = CompressedAdjacencyIndex.create(count, source);
    for (let vertex = 0; vertex < count; vertex += 1) {
      expect(targets(index, vertex)).toEqual(
        Array.from(source, (value, offset) => (value === vertex ? offset : -1)).filter(offset => offset >= 0)
      );
    }
  });

  it('bounds all three construction passes and agrees with synchronous construction', () => {
    const source = new Uint32Array([2, 0, 1, 0, 2, 2]);
    const builder = CompressedAdjacencyIndex.build(4, source, 2);
    let yields = 0;
    let step = builder.next();
    while (!step.done) {
      yields += 1;
      step = builder.next();
    }
    expect(yields).toBe(8);
    const reference = CompressedAdjacencyIndex.create(4, source);
    for (let vertex = 0; vertex < 4; vertex += 1)
      expect(targets(step.value, vertex)).toEqual(targets(reference, vertex));
  });

  it.each([-1, 1.5, NaN, Infinity, 0xffff_ffff])('rejects invalid vertex count %s', count => {
    expect(() => CompressedAdjacencyIndex.create(count, new Uint32Array())).toThrow(RangeError);
  });

  it.each([0, -1, 1.5, NaN, Infinity])('rejects invalid chunk size %s', size => {
    expect(() => CompressedAdjacencyIndex.build(1, new Uint32Array(), size).next()).toThrow(RangeError);
  });

  it('rejects occurrences outside the vertex capacity', () => {
    expect(() => CompressedAdjacencyIndex.create(2, new Uint32Array([2]))).toThrow(RangeError);
    expect(() => CompressedAdjacencyIndex.create(0, new Uint32Array([0]))).toThrow(RangeError);
  });
});
