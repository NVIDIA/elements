// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Stores a fixed number of numeric samples, overwriting the oldest sample when full. */
export class Float64RingBuffer {
  readonly #values: Float64Array;
  #start = 0;
  #length = 0;

  constructor(capacity: number) {
    if (!Number.isSafeInteger(capacity) || capacity <= 0) {
      throw new RangeError('Ring buffer capacity must be a positive safe integer.');
    }
    this.#values = new Float64Array(capacity);
  }

  get capacity(): number {
    return this.#values.length;
  }

  get length(): number {
    return this.#length;
  }

  push(value: number): void {
    this.#values[(this.#start + this.#length) % this.capacity] = value;
    if (this.#length < this.capacity) this.#length += 1;
    else this.#start = (this.#start + 1) % this.capacity;
  }

  /** Reads a sample by its index from oldest to newest. */
  get(index: number): number | undefined {
    if (!Number.isInteger(index) || index < 0 || index >= this.#length) return undefined;
    return this.#values[(this.#start + index) % this.capacity];
  }

  /** Copies the active samples in order from oldest to newest. */
  snapshot(): Float64Array {
    const snapshot = new Float64Array(this.#length);
    const firstCount = Math.min(this.#length, this.capacity - this.#start);
    snapshot.set(this.#values.subarray(this.#start, this.#start + firstCount));
    snapshot.set(this.#values.subarray(0, this.#length - firstCount), firstCount);
    return snapshot;
  }

  clear(): void {
    this.#start = 0;
    this.#length = 0;
  }
}
