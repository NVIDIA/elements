// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { planBufferUploads, type BufferUploadPlanOptions } from './buffer-upload-plan.js';
import type { RangeInterval } from '../structures/range-interval.js';

describe(planBufferUploads.name, () => {
  it('aligns, clips, sorts, and merges dirty bytes without changing the input', () => {
    const ranges = Object.freeze([
      Object.freeze({ offset: 29, size: 12 }),
      Object.freeze({ offset: 7, size: 2 }),
      Object.freeze({ offset: 4, size: 1 }),
      Object.freeze({ offset: 5, size: 0 }),
      Object.freeze({ offset: 3, size: 2 }),
      Object.freeze({ offset: 40, size: 8 }),
      Object.freeze({ offset: 4, size: 4 })
    ]);
    expect(planBufferUploads({ byteLength: 32, ranges })).toEqual([
      { offset: 0, size: 12 },
      { offset: 28, size: 4 }
    ]);
    expect(ranges[0]).toEqual({ offset: 29, size: 12 });
  });

  it('keeps clean gaps by default and merges gaps at the configured write cost', () => {
    const ranges = [
      { offset: 4, size: 4 },
      { offset: 12, size: 4 },
      { offset: 24, size: 4 }
    ];
    expect(planBufferUploads({ byteLength: 32, ranges })).toBe(ranges);
    expect(planBufferUploads({ byteLength: 32, ranges, callOverheadBytes: 3.5 })).toBe(ranges);
    expect(planBufferUploads({ byteLength: 32, ranges, callOverheadBytes: 4 })).toEqual([
      { offset: 4, size: 12 },
      { offset: 24, size: 4 }
    ]);
    expect(planBufferUploads({ byteLength: 32, ranges, callOverheadBytes: 8 })).toEqual([{ offset: 4, size: 24 }]);
    expect(ranges).toHaveLength(3);
  });

  it('applies the write budget after normalization and cost coalescing', () => {
    const ranges = Array.from({ length: 65 }, (_, index) => ({ offset: index * 8, size: 4 }));
    expect(planBufferUploads({ byteLength: 520, ranges: ranges.slice(0, 64), maxWrites: 64 })).toHaveLength(64);
    const bounded = [{ offset: 0, size: 12 }, ...ranges.slice(2)];
    expect(planBufferUploads({ byteLength: 520, ranges, maxWrites: 64 })).toEqual(bounded);
    expect(planBufferUploads({ byteLength: 520, ranges, maxWrites: 64, callOverheadBytes: 4 })).toEqual([
      { offset: 0, size: 516 }
    ]);
    expect(planBufferUploads({ byteLength: 520, ranges: [...ranges, ...ranges], maxWrites: 65 })).toHaveLength(65);
    expect(planBufferUploads({ byteLength: 520, ranges: ranges.slice().reverse(), maxWrites: 64 })).toEqual(bounded);
  });

  it('avoids a full storage upload when only one gap must merge to satisfy the budget', () => {
    const ranges = Object.freeze(
      Array.from({ length: 65 }, (_, index) => Object.freeze({ offset: index * 8, size: 4 }))
    );
    const plan = planBufferUploads({ byteLength: 1024 * 1024, ranges, maxWrites: 64 });
    expect(plan).toHaveLength(64);
    expect(plan.reduce((bytes, range) => bytes + range.size, 0)).toBe(264);
    expect(ranges[0]).toEqual({ offset: 0, size: 4 });
  });

  it('retains alignment, clipping, and changed extents when the budget requires one write', () => {
    expect(
      planBufferUploads({
        byteLength: 32,
        ranges: [
          { offset: 29, size: 12 },
          { offset: 7, size: 2 }
        ],
        maxWrites: 1
      })
    ).toEqual([{ offset: 4, size: 28 }]);
  });

  it('emits no writes for empty storage, empty ranges, or changes outside the active prefix', () => {
    expect(planBufferUploads({ byteLength: 0, ranges: [{ offset: 0, size: 4 }] })).toEqual([]);
    expect(planBufferUploads({ byteLength: 32, ranges: [] })).toEqual([]);
    expect(
      planBufferUploads({
        byteLength: 32,
        ranges: [
          { offset: 1, size: 0 },
          { offset: 32, size: 8 }
        ],
        maxWrites: 1
      })
    ).toEqual([]);
  });

  it('supports safe integer endpoints without bitwise truncation', () => {
    const byteLength = Number.MAX_SAFE_INTEGER - 3;
    expect(planBufferUploads({ byteLength, ranges: [{ offset: byteLength - 1, size: 1 }] })).toEqual([
      { offset: byteLength - 4, size: 4 }
    ]);
  });

  it.each([
    { byteLength: -4 },
    { byteLength: 3 },
    { byteLength: Number.NaN },
    { byteLength: Number.POSITIVE_INFINITY },
    { byteLength: Number.MAX_SAFE_INTEGER + 1 },
    { callOverheadBytes: -1 },
    { callOverheadBytes: Number.NaN },
    { callOverheadBytes: Number.POSITIVE_INFINITY },
    { maxWrites: 0 },
    { maxWrites: 1.5 },
    { maxWrites: Number.POSITIVE_INFINITY }
  ])('rejects invalid planning options %o even without dirty ranges', options => {
    expect(() => planBufferUploads({ byteLength: 32, ranges: [], ...options })).toThrow(RangeError);
  });

  it.each([
    { offset: -1, size: 1 },
    { offset: 0.5, size: 1 },
    { offset: 0, size: -1 },
    { offset: 0, size: Number.NaN },
    { offset: Number.MAX_SAFE_INTEGER, size: 1 }
  ])('rejects invalid intervals %o before coalescing to the write budget', range => {
    const options: BufferUploadPlanOptions = {
      byteLength: 32,
      ranges: [{ offset: 0, size: 4 }, { offset: 8, size: 4 }, range],
      maxWrites: 1
    };
    expect(() => planBufferUploads(options)).toThrow(RangeError);
  });

  it('covers every dirty word and matches the minimum cost across all small interval groupings', () => {
    for (let mask = 0; mask < 256; mask += 1) {
      const ranges = Array.from({ length: 8 }, (_, index) => ({ offset: index * 4, size: 4 })).filter(
        (_range, index) => (mask & (1 << index)) !== 0
      );
      for (const callOverheadBytes of [0, 2, 4, 8, 16]) {
        const planned = planBufferUploads({ byteLength: 32, ranges, callOverheadBytes });
        expect(uploadCost(planned, callOverheadBytes)).toBe(minimumGroupingCost(ranges, callOverheadBytes));
        expectCoverage(planned, mask);
      }
    }
  });
});

function uploadCost(ranges: readonly Readonly<RangeInterval>[], overhead: number): number {
  return ranges.reduce((cost, range) => cost + range.size + overhead, 0);
}

function minimumGroupingCost(ranges: readonly RangeInterval[], overhead: number): number {
  if (ranges.length === 0) return 0;
  let minimum = Number.POSITIVE_INFINITY;
  for (let splits = 0; splits < 2 ** (ranges.length - 1); splits += 1) {
    let cost = 0;
    let start = ranges[0]!.offset;
    for (let index = 0; index < ranges.length; index += 1) {
      if (index === ranges.length - 1 || (splits & (1 << index)) !== 0) {
        cost += ranges[index]!.offset + ranges[index]!.size - start + overhead;
        start = ranges[index + 1]?.offset ?? 0;
      }
    }
    minimum = Math.min(minimum, cost);
  }
  return minimum;
}

function expectCoverage(ranges: readonly Readonly<RangeInterval>[], mask: number): void {
  let previousEnd = -1;
  for (const range of ranges) {
    expect(range.offset % 4).toBe(0);
    expect(range.size % 4).toBe(0);
    expect(range.size).toBeGreaterThan(0);
    expect(range.offset).toBeGreaterThan(previousEnd);
    previousEnd = range.offset + range.size;
    expect(previousEnd).toBeLessThanOrEqual(32);
  }
  for (let index = 0; index < 8; index += 1) {
    if ((mask & (1 << index)) !== 0) {
      expect(ranges.some(range => range.offset <= index * 4 && range.offset + range.size >= index * 4 + 4)).toBe(true);
    }
  }
}
