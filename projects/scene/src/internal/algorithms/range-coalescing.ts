// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertRangeInterval, type RangeInterval } from '../structures/range-interval.js';

export interface RangeCoalescingOptions {
  /** Sorted, nonoverlapping intervals with positive sizes and safe integer endpoints. */
  readonly ranges: readonly Readonly<RangeInterval>[];
  /** Cost of each output range in the same units as interval size. Defaults to zero. */
  readonly rangeOverhead?: number;
  /** Limits the number of output ranges. Defaults to no practical limit. */
  readonly maxRanges?: number;
}

/**
 * Minimizes covered length plus range count times overhead within a range budget.
 * Each merged gap adds its length and removes one range cost. Merge gaps within
 * that cost, then the smallest remaining gaps until the budget holds. Equal gaps
 * merge in source order. Inputs stay unchanged; an unchanged plan reuses them.
 * Runs in linear time, or O(n log n) when the budget requires additional merges.
 */
export function coalesceRanges(options: RangeCoalescingOptions): readonly Readonly<RangeInterval>[] {
  const { ranges, rangeOverhead = 0, maxRanges = Number.MAX_SAFE_INTEGER } = options;
  validateOptions(rangeOverhead, maxRanges);
  const count = countCoalescedRanges(ranges, rangeOverhead);
  if (count === ranges.length && count <= maxRanges) return ranges;
  const merged = mergeGaps(ranges, rangeOverhead);
  return merged.length > maxRanges ? mergeCheapestGaps(merged, maxRanges) : merged;
}

function validateOptions(overhead: number, maxRanges: number): void {
  if (!Number.isFinite(overhead) || overhead < 0) {
    throw new RangeError('Range overhead must be finite and nonnegative.');
  }
  if (!Number.isSafeInteger(maxRanges) || maxRanges < 1) {
    throw new RangeError('Range budget must be a positive safe integer.');
  }
}

function countCoalescedRanges(ranges: readonly Readonly<RangeInterval>[], overhead: number): number {
  let count = 0;
  let previousEnd = -1;
  for (const { offset, size } of ranges) {
    assertRangeInterval(offset, size);
    if (size === 0 || offset < previousEnd) {
      throw new RangeError('Coalescing requires sorted, nonoverlapping, nonempty intervals.');
    }
    if (previousEnd < 0 || offset - previousEnd > overhead) count += 1;
    previousEnd = offset + size;
  }
  return count;
}

function mergeGaps(ranges: readonly Readonly<RangeInterval>[], overhead: number): RangeInterval[] {
  const merged: RangeInterval[] = [];
  for (const range of ranges) {
    const previous = merged[merged.length - 1];
    if (previous && range.offset - previous.offset - previous.size <= overhead) {
      previous.size = range.offset + range.size - previous.offset;
    } else {
      merged.push({ offset: range.offset, size: range.size });
    }
  }
  return merged;
}

function mergeCheapestGaps(ranges: RangeInterval[], maxRanges: number): RangeInterval[] {
  if (maxRanges === 1) {
    const first = ranges[0]!;
    const last = ranges[ranges.length - 1]!;
    first.size = last.offset + last.size - first.offset;
    ranges.length = 1;
    return ranges;
  }
  const gaps = Array.from({ length: ranges.length - 1 }, (_, index) => ({
    index: index + 1,
    size: ranges[index + 1]!.offset - ranges[index]!.offset - ranges[index]!.size
  }));
  gaps.sort((left, right) => left.size - right.size || left.index - right.index);
  const selected = new Uint8Array(ranges.length);
  for (let index = 0; index < ranges.length - maxRanges; index += 1) selected[gaps[index]!.index] = 1;
  return mergeSelectedGaps(ranges, selected);
}

function mergeSelectedGaps(ranges: RangeInterval[], selected: Uint8Array): RangeInterval[] {
  let count = 1;
  for (let index = 1; index < ranges.length; index += 1) {
    const range = ranges[index]!;
    if (selected[index]) {
      const previous = ranges[count - 1]!;
      previous.size = range.offset + range.size - previous.offset;
    } else {
      ranges[count++] = range;
    }
  }
  ranges.length = count;
  return ranges;
}
