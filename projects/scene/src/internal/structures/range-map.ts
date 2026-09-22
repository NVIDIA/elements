// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface RangeMapEntry<T> {
  readonly start: number;
  readonly end: number;
  readonly value: T;
}

/** Maps sorted, disjoint half-open integer ranges to values. Values keep their original identity. */
export class RangeMap<T> {
  readonly #entries: readonly RangeMapEntry<T>[];

  constructor(entries: readonly RangeMapEntry<T>[]) {
    let previousEnd = 0;
    this.#entries = entries.map(({ start, end, value }) => {
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end <= start) {
        throw new RangeError('Range map boundaries must be nonnegative safe integers with start less than end.');
      }
      if (start < previousEnd) {
        throw new RangeError('Range map entries must be sorted and disjoint.');
      }
      previousEnd = end;
      return Object.freeze({ start, end, value });
    });
  }

  get size(): number {
    return this.#entries.length;
  }

  /** Returns the stable entry containing an integer point, or undefined for gaps and invalid points. */
  get(point: number): RangeMapEntry<T> | undefined {
    if (!Number.isSafeInteger(point) || point < 0) return undefined;
    let low = 0;
    let high = this.#entries.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      const entry = this.#entries[middle]!;
      if (point < entry.start) {
        high = middle;
      } else if (point >= entry.end) {
        low = middle + 1;
      } else {
        return entry;
      }
    }
    return undefined;
  }
}
