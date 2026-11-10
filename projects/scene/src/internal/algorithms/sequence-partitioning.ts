// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface SequencePartitionOptions {
  /** Number of positions to assign, starting at zero. */
  readonly count: number;
  /** Available source positions. Defaults to count and must cover the assigned prefix. */
  readonly sourceCount?: number;
  /** Window size limit, including neighboring positions. */
  readonly capacity: number;
  /** Context on each side of an assigned range. Each count must fit within the source length. */
  readonly before?: number;
  readonly after?: number;
  readonly boundary?: 'clamp' | 'wrap';
}

type SequencePartitionVisitor = (
  ...partition: [offset: number, count: number, windowOffset: number, windowCount: number, sourceOffset: number]
) => void;

/**
 * Visits maximal capacity-bounded windows over an assigned prefix, including clamped or wrapped context.
 * Each position belongs to one partition; neighboring windows may repeat context positions.
 * Call only with checked safe integer positions and capacity for both context counts and one assigned position.
 * Captures options before visiting. Scalar arguments avoid temporary partition objects.
 * Traversal takes O(partitions) time without retaining the complete plan.
 */
export function partitionSequence(options: SequencePartitionOptions, visit: SequencePartitionVisitor): void {
  const { count, sourceCount = count, capacity, before = 0, after = 0, boundary } = options;
  const finalContext = Math.min(after, sourceCount - count);
  for (let offset = 0; offset < count; ) {
    const windowOffset = boundary === 'wrap' ? before : Math.min(before, offset);
    const available = capacity - windowOffset;
    const remaining = count - offset;
    const assigned =
      boundary === 'wrap'
        ? Math.min(remaining, available - after)
        : remaining <= available - finalContext
          ? remaining
          : available - after;
    const trailing = boundary === 'wrap' ? after : Math.min(after, sourceCount - offset - assigned);
    const windowCount = windowOffset + assigned + trailing;
    const first = offset >= windowOffset ? offset - windowOffset : sourceCount - (windowOffset - offset);
    visit(offset, assigned, windowOffset, windowCount, first);
    offset += assigned;
  }
}

/** Maps a checked partition's wrapped source span directly into caller-owned range values in target order. */
// eslint-disable-next-line max-params -- @hotpath Scalar span bounds avoid allocating a wrapper for every partition.
export function mapSequenceSourceRanges<T>(
  sourceCount: number,
  first: number,
  count: number,
  createRange: (sourceOffset: number, targetOffset: number, count: number) => T
): T[] {
  if (count === 0) return [];
  const firstCount = Math.min(count, sourceCount - first);
  const ranges: T[] = [createRange(first, 0, firstCount)];
  for (let targetOffset = firstCount; targetOffset < count; ) {
    const length = Math.min(count - targetOffset, sourceCount);
    ranges.push(createRange(0, targetOffset, length));
    targetOffset += length;
  }
  return ranges;
}
