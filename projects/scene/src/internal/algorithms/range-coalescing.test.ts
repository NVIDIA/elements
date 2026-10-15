// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { coalesceRanges } from './range-coalescing.js';
import type { RangeInterval } from '../structures/range-interval.js';

describe(coalesceRanges.name, () => {
  it('reuses empty and unchanged plans without allocating output ranges', () => {
    const ranges = Object.freeze([Object.freeze({ offset: 4, size: 4 }), Object.freeze({ offset: 12, size: 4 })]);
    expect(coalesceRanges({ ranges })).toBe(ranges);
    expect(coalesceRanges({ ranges, rangeOverhead: 3.5, maxRanges: 2 })).toBe(ranges);
    const empty = Object.freeze([]);
    expect(coalesceRanges({ ranges: empty, maxRanges: 1 })).toBe(empty);
  });

  it('merges adjacency and gaps at the configured cost without changing borrowed intervals', () => {
    const ranges = Object.freeze([
      Object.freeze({ offset: 1, size: 2 }),
      Object.freeze({ offset: 3, size: 2 }),
      Object.freeze({ offset: 7, size: 1 }),
      Object.freeze({ offset: 12, size: 3 })
    ]);
    expect(coalesceRanges({ ranges, rangeOverhead: 2 })).toEqual([
      { offset: 1, size: 7 },
      { offset: 12, size: 3 }
    ]);
    expect(coalesceRanges({ ranges, rangeOverhead: 4 })).toEqual([{ offset: 1, size: 14 }]);
    expect(ranges[0]).toEqual({ offset: 1, size: 2 });
    expect(ranges).toHaveLength(4);
  });

  it('merges the cheapest remaining gaps instead of extending beyond changed extents', () => {
    const ranges = Object.freeze([
      Object.freeze({ offset: 4, size: 4 }),
      Object.freeze({ offset: 12, size: 4 }),
      Object.freeze({ offset: 100, size: 4 }),
      Object.freeze({ offset: 112, size: 4 })
    ]);
    const expected = [
      { offset: 4, size: 12 },
      { offset: 100, size: 16 }
    ];
    expect(coalesceRanges({ ranges, maxRanges: 2 })).toEqual(expected);
    expect(coalesceRanges({ ranges, rangeOverhead: 4, maxRanges: 2 })).toEqual(expected);
    expect(coalesceRanges({ ranges, maxRanges: 1 })).toEqual([{ offset: 4, size: 112 }]);
    expect(ranges[0]).toEqual({ offset: 4, size: 4 });
  });

  it('breaks equal-cost ties in source order, including adjacent selected gaps', () => {
    const ranges = Array.from({ length: 4 }, (_, index) => ({ offset: index * 8, size: 4 }));
    expect(coalesceRanges({ ranges, maxRanges: 3 })).toEqual([
      { offset: 0, size: 12 },
      { offset: 16, size: 4 },
      { offset: 24, size: 4 }
    ]);
    expect(coalesceRanges({ ranges, maxRanges: 2 })).toEqual([
      { offset: 0, size: 20 },
      { offset: 24, size: 4 }
    ]);
  });

  it('preserves safe integer endpoints without truncating offsets', () => {
    const end = Number.MAX_SAFE_INTEGER;
    const ranges = [
      { offset: end - 12, size: 2 },
      { offset: end - 6, size: 1 },
      { offset: end - 2, size: 2 }
    ];
    expect(coalesceRanges({ ranges, maxRanges: 2 })).toEqual([
      { offset: end - 12, size: 2 },
      { offset: end - 6, size: 6 }
    ]);
    expect(coalesceRanges({ ranges, maxRanges: 1 })).toEqual([{ offset: end - 12, size: 12 }]);
  });

  it.each([
    { rangeOverhead: -1 },
    { rangeOverhead: Number.NaN },
    { rangeOverhead: Number.POSITIVE_INFINITY },
    { maxRanges: 0 },
    { maxRanges: 1.5 },
    { maxRanges: Number.POSITIVE_INFINITY },
    { maxRanges: Number.MAX_SAFE_INTEGER + 1 }
  ])('rejects invalid options %o even for empty input', options => {
    expect(() => coalesceRanges({ ranges: [], ...options })).toThrow(RangeError);
  });

  it.each([
    { ranges: [{ offset: -1, size: 1 }] },
    { ranges: [{ offset: 0.5, size: 1 }] },
    { ranges: [{ offset: 0, size: 0 }] },
    { ranges: [{ offset: 0, size: -1 }] },
    { ranges: [{ offset: 0, size: Number.NaN }] },
    { ranges: [{ offset: Number.MAX_SAFE_INTEGER, size: 1 }] },
    {
      ranges: [
        { offset: 8, size: 1 },
        { offset: 0, size: 1 }
      ]
    },
    {
      ranges: [
        { offset: 0, size: 4 },
        { offset: 2, size: 4 }
      ]
    }
  ])('rejects invalid or unnormalized intervals %#', ({ ranges }) => {
    expect(() => coalesceRanges({ ranges })).toThrow(RangeError);
  });

  it('matches exhaustive minimum costs for varied gaps, sizes, overheads, and budgets', () => {
    const input = [
      { offset: 0, size: 1 },
      { offset: 3, size: 2 },
      { offset: 10, size: 1 },
      { offset: 12, size: 3 },
      { offset: 20, size: 2 },
      { offset: 35, size: 1 },
      { offset: 38, size: 4 },
      { offset: 50, size: 2 }
    ];
    for (let mask = 0; mask < 256; mask += 1) {
      const ranges = input.filter((_range, index) => (mask & (1 << index)) !== 0);
      for (const rangeOverhead of [0, 1.5, 4, 12]) {
        for (const maxRanges of [1, 2, 3, 4, 8]) {
          const plan = coalesceRanges({ ranges, rangeOverhead, maxRanges });
          expect(plan.reduce((cost, range) => cost + range.size + rangeOverhead, 0)).toBe(
            minimumGroupingCost(ranges, rangeOverhead, maxRanges)
          );
          expectValidPlan(plan, ranges, maxRanges);
        }
      }
    }
  });
});

function minimumGroupingCost(ranges: readonly RangeInterval[], overhead: number, maxRanges: number): number {
  if (ranges.length === 0) return 0;
  let minimum = Number.POSITIVE_INFINITY;
  for (let splits = 0; splits < 2 ** (ranges.length - 1); splits += 1) {
    let cost = 0;
    let count = 0;
    let start = ranges[0]!.offset;
    for (let index = 0; index < ranges.length; index += 1) {
      if (index === ranges.length - 1 || (splits & (1 << index)) !== 0) {
        cost += ranges[index]!.offset + ranges[index]!.size - start + overhead;
        count += 1;
        start = ranges[index + 1]?.offset ?? 0;
      }
    }
    if (count <= maxRanges) minimum = Math.min(minimum, cost);
  }
  return minimum;
}

function expectValidPlan(
  plan: readonly Readonly<RangeInterval>[],
  input: readonly RangeInterval[],
  maxRanges: number
): void {
  expect(plan.length).toBeLessThanOrEqual(maxRanges);
  let previousEnd = -1;
  for (const range of plan) {
    expect(range.offset).toBeGreaterThan(previousEnd);
    expect(range.size).toBeGreaterThan(0);
    previousEnd = range.offset + range.size;
  }
  for (const source of input) {
    expect(
      plan.some(range => range.offset <= source.offset && range.offset + range.size >= source.offset + source.size)
    ).toBe(true);
  }
}
