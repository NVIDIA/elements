// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface RangeInterval {
  offset: number;
  size: number;
}

/** Accumulates half-open integer intervals and merges them when read. */
export class RangeSet {
  #ranges: RangeInterval[] = [];

  add(offset: number, size: number): void {
    if (
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      !Number.isSafeInteger(size) ||
      size < 0 ||
      !Number.isSafeInteger(offset + size)
    ) {
      throw new RangeError('Range offsets, sizes, and endpoints must be nonnegative safe integers.');
    }
    if (size > 0) this.#ranges.push({ offset, size });
  }

  addAll(ranges: readonly RangeInterval[]): void {
    for (const { offset, size } of ranges) this.add(offset, size);
  }

  /** Returns independent, sorted intervals with overlaps and adjacency merged. */
  snapshot(): RangeInterval[] {
    this.#ranges.sort((left, right) => left.offset - right.offset);
    const merged: RangeInterval[] = [];
    for (const range of this.#ranges) {
      const previous = merged[merged.length - 1];
      const end = range.offset + range.size;
      if (previous && range.offset <= previous.offset + previous.size) {
        previous.size = Math.max(previous.offset + previous.size, end) - previous.offset;
      } else {
        merged.push({ offset: range.offset, size: range.size });
      }
    }
    return merged;
  }

  /** Returns a normalized snapshot and clears the accumulated intervals. */
  drain(): RangeInterval[] {
    const ranges = this.snapshot();
    this.clear();
    return ranges;
  }

  clear(): void {
    this.#ranges = [];
  }
}
