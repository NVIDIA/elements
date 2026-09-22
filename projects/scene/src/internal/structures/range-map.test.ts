// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { RangeMap } from './range-map.js';

describe(RangeMap.name, () => {
  it('looks up half-open ranges, preserves adjacent entries, and misses gaps', () => {
    const entries = [
      { start: 1, end: 4, value: 'first' },
      { start: 4, end: 6, value: 'second' },
      { start: 9, end: 10, value: 'third' }
    ];
    const ranges = new RangeMap(entries);
    expect(ranges.size).toBe(3);
    for (const point of [1, 2, 3]) expect(ranges.get(point)).toEqual(entries[0]);
    for (const point of [4, 5]) expect(ranges.get(point)).toEqual(entries[1]);
    expect(ranges.get(9)).toEqual(entries[2]);
    for (const point of [0, 6, 7, 8, 10, 11]) expect(ranges.get(point)).toBeUndefined();
  });

  it('owns boundaries and returns stable frozen entries while retaining value identity', () => {
    const value = { label: 'first' };
    const input = [{ start: 1, end: 4, value }];
    const ranges = new RangeMap(input);
    input[0]!.start = 20;
    input[0]!.end = 30;
    input[0]!.value = { label: 'replacement' };
    input.length = 0;
    const entry = ranges.get(2)!;
    expect(entry).toEqual({ start: 1, end: 4, value });
    expect(entry.value).toBe(value);
    expect(ranges.get(3)).toBe(entry);
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Reflect.set(entry, 'start', 20)).toBe(false);
    expect(ranges.get(2)).toBe(entry);
    expect(ranges.get(20)).toBeUndefined();
    expect(ranges.size).toBe(1);
    expect(Object.isFrozen(value)).toBe(false);
  });

  it('supports empty maps, zero starts, and the largest safe endpoint', () => {
    const empty = new RangeMap([]);
    expect(empty.size).toBe(0);
    expect(empty.get(0)).toBeUndefined();
    const ranges = new RangeMap([
      { start: 0, end: 1, value: undefined },
      { start: Number.MAX_SAFE_INTEGER - 1, end: Number.MAX_SAFE_INTEGER, value: 'last' }
    ]);
    expect(ranges.get(0)).toEqual({ start: 0, end: 1, value: undefined });
    expect(ranges.get(Number.MAX_SAFE_INTEGER - 1)?.value).toBe('last');
    expect(ranges.get(Number.MAX_SAFE_INTEGER)).toBeUndefined();
  });

  it.each([
    [-1, 1],
    [0.5, 1],
    [Number.NaN, 1],
    [Number.POSITIVE_INFINITY, 2],
    [0, -1],
    [0, 0],
    [2, 1],
    [0, 0.5],
    [0, Number.NaN],
    [0, Number.POSITIVE_INFINITY],
    [0, Number.MAX_SAFE_INTEGER + 1],
    [Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER + 2]
  ])('rejects invalid boundaries (%s, %s)', (start, end) => {
    expect(() => new RangeMap([{ start, end, value: 'invalid' }])).toThrow(RangeError);
  });

  it.each([
    [
      { start: 1, end: 4 },
      { start: 3, end: 6 }
    ],
    [
      { start: 1, end: 4 },
      { start: 1, end: 4 }
    ],
    [
      { start: 1, end: 6 },
      { start: 2, end: 3 }
    ],
    [
      { start: 4, end: 6 },
      { start: 1, end: 3 }
    ]
  ])('rejects overlapping, duplicate, nested, or unsorted entries (%j, %j)', (first, second) => {
    expect(
      () =>
        new RangeMap([
          { ...first, value: 1 },
          { ...second, value: 2 }
        ])
    ).toThrow(RangeError);
  });

  it.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'returns no entry for an invalid point (%s)',
    point => {
      const ranges = new RangeMap([{ start: 0, end: 10, value: 'first' }]);
      expect(ranges.get(point)).toBeUndefined();
    }
  );

  it.each([1, 2, 3, 16, 17, 64, 257])(
    'matches a linear reference for %s ranges with varying widths and gaps',
    count => {
      let end = 0;
      const entries = Array.from({ length: count }, (_, index) => {
        const start = end + (index % 3);
        end = start + (index % 7) + 1;
        return { start, end, value: index };
      });
      const ranges = new RangeMap(entries);
      for (let point = 0; point <= end; point += 1) {
        expect(ranges.get(point)).toEqual(entries.find(entry => point >= entry.start && point < entry.end));
      }
    }
  );
});
