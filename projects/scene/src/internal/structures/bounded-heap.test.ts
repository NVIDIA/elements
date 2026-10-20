// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { BoundedHeap } from './bounded-heap.js';

describe(BoundedHeap.name, () => {
  it('rejects additions at zero capacity and retains the smallest value at capacity one', () => {
    const empty = new BoundedHeap<number>(0, (left, right) => left - right);
    expect(empty.add(1)).toBe(false);
    expect(empty.size).toBe(0);
    expect(empty.drain()).toEqual([]);
    const heap = new BoundedHeap<number>(1, (left, right) => left - right);
    expect(heap.add(10)).toBe(true);
    expect(heap.add(20)).toBe(false);
    expect(heap.add(5)).toBe(true);
    expect(heap.add(5)).toBe(false);
    expect(heap.size).toBe(1);
    expect(heap.drain()).toEqual([5]);
  });

  it('preserves payload identity and uses caller-defined priority and tie ordering', () => {
    const values = Array.from({ length: 12 }, (_, index) => ({ priority: index % 3, index }));
    const compare = (left: (typeof values)[number], right: (typeof values)[number]) =>
      left.priority - right.priority || right.index - left.index;
    const heap = new BoundedHeap(5, compare);
    for (const value of values) heap.add(value);
    const actual = heap.drain().sort(compare);
    const expected = values.slice().sort(compare).slice(0, 5);
    actual.forEach((value, index) => expect(value).toBe(expected[index]));
  });

  it('transfers unsorted storage and starts a new independent selection after draining', () => {
    const heap = new BoundedHeap<number>(3, (left, right) => left - right);
    for (const value of [3, 2, 1]) heap.add(value);
    const before = heap.drain();
    expect(before[0]).toBe(3);
    expect(before.slice().sort()).toEqual([1, 2, 3]);
    expect(heap.size).toBe(0);
    for (const value of [9, 8, 7, 6]) heap.add(value);
    before.fill(-1);
    expect(heap.size).toBe(3);
    expect(heap.drain().sort()).toEqual([6, 7, 8]);
    expect(heap.drain()).toEqual([]);
  });

  it.each([1, -1])('matches sorted selection with comparator direction %i and varied capacities', direction => {
    const shuffled = Array.from({ length: 257 }, (_, index) => ((index * 73) % 257) - 128);
    const inputs = [
      shuffled,
      shuffled.slice().sort((left, right) => left - right),
      shuffled.slice().sort((left, right) => right - left),
      shuffled.map(value => (value % 7) + 0),
      [Number.MAX_SAFE_INTEGER, 0, -Number.MAX_SAFE_INTEGER, 2 ** 40, -(2 ** 40), 1, -1]
    ];
    for (const input of inputs) {
      const compare = (left: number, right: number) => direction * (left - right);
      for (const capacity of [0, 1, 2, 3, 7, 63, 128, 256, 257, 300]) {
        const heap = new BoundedHeap<number>(capacity, compare);
        for (const value of input) heap.add(value);
        expect(heap.size).toBe(Math.min(capacity, input.length));
        expect(heap.drain().sort(compare)).toEqual(input.slice().sort(compare).slice(0, capacity));
      }
    }
  });

  it('does not allocate storage for unused capacity', () => {
    const heap = new BoundedHeap<number>(Number.MAX_SAFE_INTEGER, (left, right) => left - right);
    heap.add(1);
    expect(heap.drain()).toEqual([1]);
  });

  it.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid capacity %s',
    capacity => {
      expect(() => new BoundedHeap<number>(capacity, (left, right) => left - right)).toThrow(RangeError);
    }
  );
});
