// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertRangeInterval, type RangeInterval } from '../structures/range-interval.js';
import { BoundedHeap } from '../structures/bounded-heap.js';

type GapSelection = 'merge' | 'keep';

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
 * Runs in linear time when the budget is one or requires no additional merges.
 * Other plans take O(n log(k + 1)) time with O(k) selection storage.
 * For m ranges after cost-based merging and budget b, k is min(m - b, b - 1).
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
  const mergeCount = ranges.length - maxRanges;
  const keepCount = maxRanges - 1;
  const selection = mergeCount <= keepCount ? 'merge' : 'keep';
  const selected = selectGaps(ranges, Math.min(mergeCount, keepCount), selection);
  return mergeSelectedGaps(ranges, selected, selection);
}

function selectGaps(ranges: readonly RangeInterval[], count: number, selection: GapSelection): number[] {
  const order = selection === 'merge' ? 1 : -1;
  const compare = (left: number, right: number) =>
    order * (gapSize(ranges, left) - gapSize(ranges, right) || left - right);
  const heap = new BoundedHeap<number>(count, compare);
  // Start at the preferred endpoint to avoid repeated replacement for ordered or equal gaps.
  const direction = compare(1, ranges.length - 1) <= 0 ? 1 : -1;
  const start = direction === 1 ? 1 : ranges.length - 1;
  for (let index = start; index > 0 && index < ranges.length; index += direction) heap.add(index);
  return heap.drain().sort((left, right) => left - right);
}

function gapSize(ranges: readonly RangeInterval[], index: number): number {
  const previous = ranges[index - 1]!;
  return ranges[index]!.offset - previous.offset - previous.size;
}

function mergeSelectedGaps(
  ranges: RangeInterval[],
  selected: readonly number[],
  selection: GapSelection
): RangeInterval[] {
  let count = 1;
  let cursor = 0;
  for (let index = 1; index < ranges.length; index += 1) {
    const range = ranges[index]!;
    const included = selected[cursor] === index;
    if (included) cursor += 1;
    if (selection === 'merge' ? included : !included) {
      const previous = ranges[count - 1]!;
      previous.size = range.offset + range.size - previous.offset;
    } else {
      ranges[count++] = range;
    }
  }
  ranges.length = count;
  return ranges;
}
