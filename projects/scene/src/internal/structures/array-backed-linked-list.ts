// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Array-backed circular doubly linked list of stable integer indices. Starts
 * with indices zero through length minus one; removal never moves survivors.
 * Empty lists and removed or invalid indices return minus one for links.
 */
export class ArrayBackedLinkedList {
  readonly #next: Int32Array;
  readonly #previous: Int32Array;
  #first: number;
  #size: number;

  constructor(length: number) {
    if (!Number.isSafeInteger(length) || length < 0 || length > 0x7fff_ffff) {
      throw new RangeError('Index list length must be a nonnegative signed 32-bit integer.');
    }
    this.#next = new Int32Array(length);
    this.#previous = new Int32Array(length);
    this.#first = length === 0 ? -1 : 0;
    this.#size = length;
    for (let index = 0; index < length; index += 1) {
      this.#next[index] = index === length - 1 ? 0 : index + 1;
      this.#previous[index] = index === 0 ? length - 1 : index - 1;
    }
  }

  get first(): number {
    return this.#first;
  }

  get size(): number {
    return this.#size;
  }

  next(index: number): number {
    return this.#next[index] ?? -1;
  }

  previous(index: number): number {
    return this.#previous[index] ?? -1;
  }

  /** Removes an active index in constant time; absent indices leave the list unchanged. */
  remove(index: number): boolean {
    const next = this.next(index);
    if (next === -1) return false;
    const previous = this.previous(index);
    this.#next[previous] = next;
    this.#previous[next] = previous;
    this.#next[index] = -1;
    this.#previous[index] = -1;
    this.#size -= 1;
    if (this.#first === index) this.#first = this.#size === 0 ? -1 : next;
    return true;
  }
}
