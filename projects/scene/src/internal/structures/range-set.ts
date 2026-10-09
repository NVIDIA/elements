// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertRangeInterval, type RangeInterval } from './range-interval.js';

export type { RangeInterval } from './range-interval.js';

/** Accumulates half-open integer intervals and merges them when read. */
export class RangeSet {
  #ranges: RangeInterval[] = [];

  add(offset: number, size: number): void {
    assertRangeInterval(offset, size);
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
