// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Retains the smallest values under a caller-defined order in a bounded max heap.
 * The greatest retained value is the root, so rejected additions take constant time.
 * Accepted additions take O(log(k + 1)) time and storage takes O(k), for capacity k.
 * Values must keep their comparison keys while stored. Include a tie-breaker in the
 * comparator when selection among equal priorities must follow a particular order.
 */
export class BoundedHeap<T> {
  readonly capacity: number;
  readonly #compare: (left: T, right: T) => number;
  #values: T[] = [];

  constructor(capacity: number, compare: (left: T, right: T) => number) {
    if (!Number.isSafeInteger(capacity) || capacity < 0) {
      throw new RangeError('Bounded heap capacity must be a nonnegative safe integer.');
    }
    this.capacity = capacity;
    this.#compare = compare;
  }

  get size(): number {
    return this.#values.length;
  }

  /** Retains a value if space remains or it precedes the greatest retained value. */
  add(value: T): boolean {
    if (this.capacity === 0) return false;
    if (this.#values.length < this.capacity) {
      this.#insert(value);
      return true;
    }
    if (this.#compare(value, this.#values[0]!) >= 0) return false;
    this.#replaceRoot(value);
    return true;
  }

  /** Transfers the retained values in heap order and empties the heap without copying. */
  drain(): T[] {
    const values = this.#values;
    this.#values = [];
    return values;
  }

  #insert(value: T): void {
    const values = this.#values;
    let index = values.length;
    values.push(value);
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.#compare(values[parent]!, value) >= 0) break;
      values[index] = values[parent]!;
      index = parent;
    }
    values[index] = value;
  }

  #replaceRoot(value: T): void {
    const values = this.#values;
    let index = 0;
    while (index * 2 + 1 < values.length) {
      let child = index * 2 + 1;
      const right = child + 1;
      if (right < values.length && this.#compare(values[right]!, values[child]!) > 0) child = right;
      if (this.#compare(value, values[child]!) >= 0) break;
      values[index] = values[child]!;
      index = child;
    }
    values[index] = value;
  }
}
