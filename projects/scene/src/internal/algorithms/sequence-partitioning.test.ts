// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  partitionSequence,
  assertSequencePartitionOptions,
  mapSequenceSourceRanges,
  type SequenceSourceRange,
  type SequencePartition,
  type SequencePartitionOptions
} from './sequence-partitioning.js';

describe(partitionSequence.name, () => {
  it('partitions a contiguous sequence and an empty sequence without context', () => {
    const plan = collectPartitions({ count: 10, capacity: 4 });
    expect(plan.map(entry => [entry.offset, entry.count, entry.windowOffset, entry.windowCount])).toEqual([
      [0, 4, 0, 4],
      [4, 4, 0, 4],
      [8, 2, 0, 2]
    ]);
    expect(plan.map(expandWindow)).toEqual([
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9]
    ]);
    expect(collectPartitions({ count: 0, capacity: 1 })).toEqual([]);
  });

  it('keeps ownership separate from clamped context and an unassigned source suffix', () => {
    const plan = collectPartitions({ count: 9, sourceCount: 10, capacity: 4, before: 1, after: 1 });
    expect(plan.map(entry => [entry.offset, entry.count, entry.windowOffset, entry.windowCount])).toEqual([
      [0, 3, 0, 4],
      [3, 2, 1, 4],
      [5, 2, 1, 4],
      [7, 2, 1, 4]
    ]);
    expect(plan.map(expandWindow)).toEqual([
      [0, 1, 2, 3],
      [2, 3, 4, 5],
      [4, 5, 6, 7],
      [6, 7, 8, 9]
    ]);
    const complete = collectPartitions({ count: 10, capacity: 4, before: 1, after: 1 });
    expect(complete.at(-1)?.count).toBe(3);
    expect(expandWindow(complete.at(-1)!)).toEqual([6, 7, 8, 9]);
  });

  it('wraps both ends while keeping source ranges in target order', () => {
    const plan = collectPartitions({ count: 10, capacity: 4, before: 1, after: 1, boundary: 'wrap' });
    expect(plan.map(entry => entry.count)).toEqual([2, 2, 2, 2, 2]);
    expect(plan.map(expandWindow)).toEqual([
      [9, 0, 1, 2],
      [1, 2, 3, 4],
      [3, 4, 5, 6],
      [5, 6, 7, 8],
      [7, 8, 9, 0]
    ]);
    expect(plan[0]?.sourceRanges).toEqual([
      { sourceOffset: 9, targetOffset: 0, count: 1 },
      { sourceOffset: 0, targetOffset: 1, count: 3 }
    ]);
    expect(
      collectPartitions({ count: 1, capacity: 3, before: 1, after: 1, boundary: 'wrap' }).map(expandWindow)
    ).toEqual([[0, 0, 0]]);
  });

  it('captures options before callbacks and does not retain a complete plan', () => {
    const options = { count: 8, capacity: 4, before: 1, after: 1 };
    const spans: SequencePartition[] = [];
    partitionSequence(options, (...[offset, count, windowOffset, windowCount, sourceOffset]) => {
      spans.push(Object.freeze({ offset, count, windowOffset, windowCount, sourceOffset }));
      options.count = 0;
      options.capacity = 0;
    });
    expect(spans.map(entry => [entry.offset, entry.count])).toEqual([
      [0, 3],
      [3, 2],
      [5, 3]
    ]);
    expect(spans.map(entry => entry.sourceOffset)).toEqual([0, 2, 4]);
  });

  it('preserves safe integer offsets beyond 32 bits and wraps without overflowing normalization', () => {
    const count = Number.MAX_SAFE_INTEGER;
    const plan = collectPartitions({ count, capacity: count, before: 1, after: 1, boundary: 'wrap' });
    expect(plan.map(entry => [entry.offset, entry.count, entry.windowCount])).toEqual([
      [0, count - 2, count],
      [count - 2, 2, 4]
    ]);
    expect(plan[0]?.sourceRanges).toEqual([
      { sourceOffset: count - 1, targetOffset: 0, count: 1 },
      { sourceOffset: 0, targetOffset: 1, count: count - 1 }
    ]);
    expect(plan[1]?.sourceRanges).toEqual([
      { sourceOffset: count - 3, targetOffset: 0, count: 3 },
      { sourceOffset: 0, targetOffset: 3, count: 1 }
    ]);
  });

  it.each([
    { count: -1 },
    { count: 1.5 },
    { count: Number.NaN },
    { count: Number.MAX_SAFE_INTEGER + 1 },
    { sourceCount: 4 },
    { sourceCount: Infinity },
    { capacity: 0 },
    { capacity: -1 },
    { capacity: 1.5 },
    { before: -1 },
    { before: 6 },
    { before: 3, after: 1 },
    { after: 6 },
    { after: Number.NaN },
    {
      before: Number.MAX_SAFE_INTEGER,
      after: Number.MAX_SAFE_INTEGER,
      sourceCount: Number.MAX_SAFE_INTEGER,
      capacity: Number.MAX_SAFE_INTEGER
    }
  ])('rejects invalid positions or insufficient capacity %o', changes => {
    expect(() => assertSequencePartitionOptions({ count: 5, capacity: 4, ...changes })).toThrow(RangeError);
  });

  it('rejects an invalid boundary rule before visiting a partition', () => {
    expect(() =>
      Reflect.apply(assertSequencePartitionOptions, undefined, [{ count: 5, capacity: 4, boundary: 'repeat' }])
    ).toThrow(RangeError);
  });

  it('matches enumeration of maximal windows across asymmetric context and boundary rules', () => {
    for (const options of sequenceFixtures()) {
      const actual = collectPartitions(options);
      expect(actual.map(entry => ({ offset: entry.offset, count: entry.count, window: expandWindow(entry) }))).toEqual(
        enumerateWindows(options)
      );
      for (const entry of actual) {
        expect(entry.windowCount).toBeLessThanOrEqual(options.capacity);
        expect(expandWindow(entry).slice(entry.windowOffset, entry.windowOffset + entry.count)).toEqual(
          Array.from({ length: entry.count }, (_, index) => entry.offset + index)
        );
      }
    }
  });
});

function sequenceFixtures(): Required<SequencePartitionOptions>[] {
  return Array.from({ length: 10 }, (_, count) =>
    [count, count + 2].flatMap(sourceCount => contextFixtures(count, sourceCount))
  ).flat();
}

function contextFixtures(count: number, sourceCount: number): Required<SequencePartitionOptions>[] {
  const result: Required<SequencePartitionOptions>[] = [];
  for (const before of [0, 1, 2].filter(value => value <= sourceCount)) {
    for (const after of [0, 1, 2].filter(value => value <= sourceCount)) {
      for (const capacity of [before + after + 1, before + after + 3]) {
        result.push(
          { count, sourceCount, capacity, before, after, boundary: 'clamp' },
          { count, sourceCount, capacity, before, after, boundary: 'wrap' }
        );
      }
    }
  }
  return result;
}

function expandWindow(entry: CollectedPartition): number[] {
  const result: number[] = [];
  for (const range of entry.sourceRanges) {
    expect(range.targetOffset).toBe(result.length);
    result.push(...Array.from({ length: range.count }, (_, index) => range.sourceOffset + index));
  }
  expect(result).toHaveLength(entry.windowCount);
  return result;
}

// Independently enumerates candidate windows, then chooses the largest fitting assignment.
function enumerateWindows(
  options: Required<SequencePartitionOptions>
): Array<{ offset: number; count: number; window: number[] }> {
  const { count, sourceCount, capacity, before, after, boundary } = options;
  const result: Array<{ offset: number; count: number; window: number[] }> = [];
  for (let offset = 0; offset < count; ) {
    let best: { offset: number; count: number; window: number[] } = { offset, count: 0, window: [] };
    for (let end = offset + 1; end <= count; end += 1) {
      const positions = Array.from({ length: end - offset + before + after }, (_, index) => offset - before + index);
      const window =
        boundary === 'clamp'
          ? positions.filter(index => index >= 0 && index < sourceCount)
          : positions.map(index => (index + sourceCount) % sourceCount);
      if (window.length > capacity) break;
      best = { offset, count: end - offset, window };
    }
    if (best.count === 0) throw new Error('The reference requires capacity for one assigned position.');
    result.push(best);
    offset += best.count;
  }
  return result;
}

interface CollectedPartition extends SequencePartition {
  readonly sourceRanges: readonly SequenceSourceRange[];
}

function collectPartitions(options: SequencePartitionOptions): CollectedPartition[] {
  assertSequencePartitionOptions(options);
  const result: CollectedPartition[] = [];
  const sourceCount = options.sourceCount ?? options.count;
  partitionSequence(options, (...[offset, count, windowOffset, windowCount, sourceOffset]) => {
    result.push({
      offset,
      count,
      windowOffset,
      windowCount,
      sourceOffset,
      sourceRanges: mapSequenceSourceRanges(sourceCount, sourceOffset, windowCount, (source, target, length) => ({
        sourceOffset: source,
        targetOffset: target,
        count: length
      }))
    });
  });
  return result;
}
