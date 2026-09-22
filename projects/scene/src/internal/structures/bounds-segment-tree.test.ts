// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { BoundsSegmentTree } from './bounds-segment-tree.js';

function emptyBounds(): Float64Array {
  return new Float64Array([Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]);
}

function bounds(value: number): Float64Array {
  return new Float64Array([value - 1, value - 2, value - 3, value + 4, value + 5, value + 6]);
}

function prefix(tree: BoundsSegmentTree, count: number): Float64Array {
  const result = emptyBounds();
  tree.extendPrefix(count, result);
  return result;
}

describe(BoundsSegmentTree.name, () => {
  it('preserves the caller bounds for empty prefixes and empty leaves', () => {
    const tree = new BoundsSegmentTree();
    const result = bounds(10);
    tree.extendPrefix(0, result);
    tree.reset(7);
    tree.clear(3, 3);
    tree.extendPrefix(7, result);
    expect(result).toEqual(bounds(10));
  });

  it('unions multiple bounds in one leaf without retaining input storage', () => {
    const tree = new BoundsSegmentTree();
    tree.reset(1);
    const input = bounds(10);
    tree.include(0, input);
    tree.include(0, bounds(-10));
    input.fill(100);
    expect(prefix(tree, 1)).toEqual(new Float64Array([-11, -12, -13, 14, 15, 16]));
  });

  it('allows extrema to shrink after clearing and replacing a leaf', () => {
    const tree = new BoundsSegmentTree();
    tree.reset(5);
    tree.include(0, bounds(-100));
    tree.include(4, bounds(100));
    expect(prefix(tree, 5)[3]).toBe(104);
    tree.clear(0, 1);
    tree.clear(4, 5);
    tree.include(2, bounds(0));
    expect(prefix(tree, 5)).toEqual(bounds(0));
    tree.clear(0, 5);
    expect(prefix(tree, 5)).toEqual(emptyBounds());
  });

  it('clones pending mutations and keeps subsequent changes independent', () => {
    const tree = new BoundsSegmentTree();
    tree.reset(9);
    tree.include(2, bounds(10));
    const pendingClone = tree.clone();
    tree.clear(2, 3);
    tree.include(8, bounds(100));
    expect(prefix(pendingClone, 9)).toEqual(bounds(10));
    expect(prefix(tree, 9)).toEqual(bounds(100));
    const cleanClone = tree.clone();
    tree.reset(9);
    expect(prefix(cleanClone, 9)).toEqual(bounds(100));
    expect(prefix(tree, 9)).toEqual(emptyBounds());
  });

  it('resets and resizes without carrying over old leaves', () => {
    const tree = new BoundsSegmentTree();
    for (const count of [7, 7, 3, 0, 8]) {
      tree.reset(count);
      expect(prefix(tree, count)).toEqual(emptyBounds());
      if (count > 0) tree.include(count - 1, bounds(count));
    }
    expect(prefix(tree, 8)).toEqual(bounds(8));
  });

  it('keeps disjoint pending ranges independent when cloning and resetting', () => {
    const tree = new BoundsSegmentTree();
    tree.reset(31);
    tree.include(0, bounds(-100));
    tree.include(30, bounds(100));
    tree.include(15, bounds(0));
    const clone = tree.clone();
    tree.reset(31);
    clone.clear(0, 1);
    clone.clear(30, 31);
    // An empty prefix must leave pending updates available to the next query.
    expect(prefix(clone, 0)).toEqual(emptyBounds());
    expect(prefix(clone, 31)).toEqual(bounds(0));
    expect(prefix(tree, 31)).toEqual(emptyBounds());
    clone.include(0, bounds(-50));
    clone.include(30, bounds(50));
    clone.reset(7);
    expect(prefix(clone, 7)).toEqual(emptyBounds());
  });

  it.each([3, 6, 31, 257, 4096, 5000])(
    'matches linear unions through sparse, overlapping, and shrinking batches with %i leaves',
    count => {
      const tree = new BoundsSegmentTree();
      tree.reset(count);
      const leaves = Array.from({ length: count }, emptyBounds);
      let seed = 0x12345678;
      for (let batch = 0; batch < 32; batch += 1) {
        for (let mutation = 0; mutation < 8; mutation += 1) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          mutateReferenceLeaf(tree, leaves, seed);
        }
        for (const length of [0, 1, Math.floor(count / 2), count - 1, count]) {
          expect(prefix(tree, length)).toEqual(leaves.slice(0, length).reduce(merge, emptyBounds()));
        }
      }
      tree.clear(0, 1);
      tree.clear(count - 1, count);
      tree.include(0, bounds(-2000));
      tree.include(count - 1, bounds(2000));
      leaves[0] = bounds(-2000);
      leaves[count - 1] = bounds(2000);
      expect(prefix(tree, count)).toEqual(leaves.reduce(merge, emptyBounds()));
    }
  );

  it.each([1, 2, 3, 5, 8, 9, 17, 255, 256, 257])(
    'matches a linear union for every prefix after mutations with %i leaves',
    count => {
      const tree = new BoundsSegmentTree();
      tree.reset(count);
      const leaves = Array.from({ length: count }, emptyBounds);
      for (let mutation = 0; mutation < count * 3; mutation += 1) {
        const index = (mutation * 37) % count;
        if (mutation % 4 === 0) {
          tree.clear(index, index + 1);
          leaves[index] = emptyBounds();
        } else {
          const input = bounds(((mutation * 13) % 101) - 50);
          tree.include(index, input);
          merge(leaves[index]!, input);
        }
        // Query between mutations, and also leave batches pending between queries.
        if (mutation % 11 === 0) expect(prefix(tree, count)).toEqual(leaves.reduce(merge, emptyBounds()));
      }
      let expected = emptyBounds();
      for (let length = 0; length <= count; length += 1) {
        expect(prefix(tree, length)).toEqual(expected);
        if (length < count) expected = merge(expected, leaves[length]!);
      }
    }
  );

  it.each([-1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1])('rejects invalid length %s', length => {
    expect(() => new BoundsSegmentTree().reset(length)).toThrow(RangeError);
  });
});

function mutateReferenceLeaf(tree: BoundsSegmentTree, leaves: Float64Array[], seed: number): void {
  const index = seed % leaves.length;
  if (seed % 3 === 0) {
    const end = Math.min(leaves.length, index + (seed % 64) + 1);
    tree.clear(index, end);
    for (let leaf = index; leaf < end; leaf += 1) leaves[leaf] = emptyBounds();
  } else {
    const input = bounds((seed % 2001) - 1000);
    tree.include(index, input);
    merge(leaves[index]!, input);
  }
}

function merge(target: Float64Array, source: Float64Array): Float64Array {
  for (let axis = 0; axis < 3; axis += 1) {
    target[axis] = Math.min(target[axis]!, source[axis]!);
    target[axis + 3] = Math.max(target[axis + 3]!, source[axis + 3]!);
  }
  return target;
}
