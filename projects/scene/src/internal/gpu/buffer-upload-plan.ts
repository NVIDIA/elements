// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertRangeInterval, type RangeInterval } from '../structures/range-interval.js';
import { RangeSet } from '../structures/range-set.js';

export interface BufferUploadPlanOptions {
  /** Available source and destination bytes, including any required padding. Must divide evenly by four. */
  readonly byteLength: number;
  readonly ranges: readonly Readonly<RangeInterval>[];
  /** Cost of one write expressed in transferred bytes. Zero preserves clean gaps. */
  readonly callOverheadBytes?: number;
  /** Uses a complete upload if the coalesced plan would exceed this write budget. */
  readonly maxWrites?: number;
}

/**
 * Plans bounded, four-byte-aligned writes without owning source bytes or GPU resources.
 * A gap merges when its byte cost is no greater than the saved write cost. This minimizes
 * transferred bytes plus write count times call overhead before applying the write budget.
 * The planner reuses normalized inputs; callers must keep them unchanged during use.
 */
export function planBufferUploads(options: BufferUploadPlanOptions): readonly Readonly<RangeInterval>[] {
  const { byteLength, ranges, callOverheadBytes = 0, maxWrites = Number.MAX_SAFE_INTEGER } = options;
  validateOptions(byteLength, callOverheadBytes, maxWrites);
  const planned = isNormalized(ranges, byteLength, callOverheadBytes)
    ? ranges
    : coalesce(normalize(ranges, byteLength), callOverheadBytes);
  return planned.length > maxWrites ? [{ offset: 0, size: byteLength }] : planned;
}

function validateOptions(byteLength: number, callOverheadBytes: number, maxWrites: number): void {
  if (!Number.isSafeInteger(byteLength) || byteLength < 0 || byteLength % 4 !== 0) {
    throw new RangeError('Upload length must be a nonnegative safe integer and a multiple of four.');
  }
  if (!Number.isFinite(callOverheadBytes) || callOverheadBytes < 0) {
    throw new RangeError('Upload call overhead must be finite and nonnegative.');
  }
  if (!Number.isSafeInteger(maxWrites) || maxWrites < 1) {
    throw new RangeError('Upload write budget must be a positive safe integer.');
  }
}

function isNormalized(ranges: readonly Readonly<RangeInterval>[], byteLength: number, overhead: number): boolean {
  let previousEnd = -1;
  for (const { offset, size } of ranges) {
    assertRangeInterval(offset, size);
    if (
      size === 0 ||
      offset % 4 !== 0 ||
      size % 4 !== 0 ||
      offset + size > byteLength ||
      (previousEnd >= 0 && offset - previousEnd <= overhead)
    ) {
      return false;
    }
    previousEnd = offset + size;
  }
  return true;
}

function normalize(ranges: readonly Readonly<RangeInterval>[], byteLength: number): RangeInterval[] {
  const normalized = new RangeSet();
  for (const { offset, size } of ranges) {
    assertRangeInterval(offset, size);
    if (size === 0 || offset >= byteLength) continue;
    const start = Math.floor(offset / 4) * 4;
    const end = Math.min(byteLength, Math.ceil((offset + size) / 4) * 4);
    normalized.add(start, end - start);
  }
  return normalized.drain();
}

function coalesce(ranges: RangeInterval[], overhead: number): RangeInterval[] {
  let count = 0;
  for (const range of ranges) {
    const previous = ranges[count - 1];
    if (previous && range.offset - previous.offset - previous.size <= overhead) {
      previous.size = range.offset + range.size - previous.offset;
    } else {
      ranges[count++] = range;
    }
  }
  ranges.length = count;
  return ranges;
}
