// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { RangeSet, type RangeInterval } from './range-set.js';

describe(RangeSet.name, () => {
  it('sorts and merges overlapping, adjacent, duplicate, and nested intervals while retaining gaps', () => {
    const ranges = new RangeSet();
    ranges.addAll([
      { offset: 96, size: 48 },
      { offset: 0, size: 48 },
      { offset: 40, size: 56 },
      { offset: 192, size: 0 },
      { offset: 192, size: 48 },
      { offset: 0, size: 48 },
      { offset: 8, size: 8 }
    ]);
    expect(ranges.snapshot()).toEqual([
      { offset: 0, size: 144 },
      { offset: 192, size: 48 }
    ]);
    expect(ranges.drain()).toEqual([
      { offset: 0, size: 144 },
      { offset: 192, size: 48 }
    ]);
    expect(ranges.drain()).toEqual([]);
  });

  it('joins existing intervals when a later addition bridges their gap', () => {
    const ranges = new RangeSet();
    ranges.add(0, 4);
    ranges.add(8, 4);
    const first = ranges.snapshot();
    expect(first).toEqual([
      { offset: 0, size: 4 },
      { offset: 8, size: 4 }
    ]);
    ranges.add(4, 4);
    expect(ranges.snapshot()).toEqual([{ offset: 0, size: 12 }]);
    expect(first).toEqual([
      { offset: 0, size: 4 },
      { offset: 8, size: 4 }
    ]);
  });

  it('owns added values and returns independent arrays and interval objects', () => {
    const ranges = new RangeSet();
    const input = [
      { offset: 12, size: 4 },
      { offset: 0, size: 4 }
    ];
    ranges.addAll(input);
    expect(input).toEqual([
      { offset: 12, size: 4 },
      { offset: 0, size: 4 }
    ]);
    for (const range of input) range.size = 100;
    const snapshot = ranges.snapshot();
    for (const range of snapshot) range.offset = 100;
    snapshot.push({ offset: 200, size: 10 });
    expect(ranges.snapshot()).toEqual([
      { offset: 0, size: 4 },
      { offset: 12, size: 4 }
    ]);
    const drained = ranges.drain();
    ranges.add(0, 20);
    expect(drained).toEqual([
      { offset: 0, size: 4 },
      { offset: 12, size: 4 }
    ]);
  });

  it('clears pending work, ignores empty intervals, and supports safe endpoints', () => {
    const ranges = new RangeSet();
    expect(ranges.snapshot()).toEqual([]);
    ranges.add(0, 0);
    ranges.add(Number.MAX_SAFE_INTEGER, 0);
    expect(ranges.drain()).toEqual([]);
    ranges.add(Number.MAX_SAFE_INTEGER - 1, 1);
    expect(ranges.snapshot()).toEqual([{ offset: Number.MAX_SAFE_INTEGER - 1, size: 1 }]);
    ranges.clear();
    expect(ranges.snapshot()).toEqual([]);
    ranges.add(10, 5);
    expect(ranges.drain()).toEqual([{ offset: 10, size: 5 }]);
  });

  it.each([
    [-1, 1],
    [0.5, 1],
    [Number.NaN, 1],
    [Number.POSITIVE_INFINITY, 1],
    [0, -1],
    [0, 0.5],
    [0, Number.NaN],
    [0, Number.POSITIVE_INFINITY],
    [Number.MAX_SAFE_INTEGER + 1, 0],
    [0, Number.MAX_SAFE_INTEGER + 1],
    [Number.MAX_SAFE_INTEGER, 1]
  ])('rejects invalid offsets, sizes, and overflowing endpoints (%s, %s)', (offset, size) => {
    const ranges = new RangeSet();
    ranges.add(0, 1);
    expect(() => ranges.add(offset, size)).toThrow(RangeError);
    expect(ranges.snapshot()).toEqual([{ offset: 0, size: 1 }]);
  });

  it('matches a reference coverage model after each deterministic addition', () => {
    const ranges = new RangeSet();
    const covered = new Array<boolean>(64).fill(false);
    for (let step = 0; step < 100; step += 1) {
      const offset = (step * 17) % covered.length;
      const size = Math.min(step % 9, covered.length - offset);
      ranges.add(offset, size);
      covered.fill(true, offset, offset + size);
      const expected: RangeInterval[] = [];
      for (let index = 0; index < covered.length; ) {
        if (!covered[index]) {
          index += 1;
          continue;
        }
        const start = index;
        while (index < covered.length && covered[index]) index += 1;
        expected.push({ offset: start, size: index - start });
      }
      expect(ranges.snapshot()).toEqual(expected);
    }
  });
});
