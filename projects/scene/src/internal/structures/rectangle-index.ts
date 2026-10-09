// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type RectangleBounds = readonly [minX: number, minY: number, maxX: number, maxY: number];

/**
 * Packed bounds hierarchy with stable source indices and inclusive overlap queries.
 * Copies finite rectangles in input order. Replacement and removal rebuild ancestors
 * in logarithmic time; construction takes linear time and stores 64 bytes per slot.
 * Queries visit overlapping bounds in tree order and stop when a predicate succeeds.
 * Candidate selection takes linear time in the worst case; spatial locality improves pruning.
 */
export class RectangleIndex {
  readonly #bounds: Float64Array;
  readonly capacity: number;
  #size: number;

  constructor(rectangles: readonly RectangleBounds[]) {
    this.capacity = rectangles.length;
    this.#size = rectangles.length;
    this.#bounds = new Float64Array(rectangles.length * 8);
    for (let index = 0; index < rectangles.length; index += 1) {
      const bounds = rectangles[index]!;
      assertStoredBounds(...bounds);
      this.#bounds.set(bounds, (index + this.capacity) * 4);
    }
    for (let node = this.capacity - 1; node > 0; node -= 1) this.#merge(node);
  }

  get size(): number {
    return this.#size;
  }

  get byteLength(): number {
    return this.#bounds.byteLength;
  }

  /** Replaces or restores a slot without changing any source indices. */
  // eslint-disable-next-line max-params -- @hotpath Scalar bounds avoid allocating a rectangle for each edge update.
  set(index: number, minX: number, minY: number, maxX: number, maxY: number): void {
    this.#assertIndex(index);
    assertStoredBounds(minX, minY, maxX, maxY);
    const offset = (index + this.capacity) * 4;
    if (this.#bounds[offset] === Infinity) this.#size += 1;
    this.#bounds[offset] = minX;
    this.#bounds[offset + 1] = minY;
    this.#bounds[offset + 2] = maxX;
    this.#bounds[offset + 3] = maxY;
    this.#rebuild(index);
  }

  /** Removes a slot; repeated removal leaves the index unchanged. */
  remove(index: number): boolean {
    this.#assertIndex(index);
    const offset = (index + this.capacity) * 4;
    if (this.#bounds[offset] === Infinity) return false;
    this.#bounds[offset] = Infinity;
    this.#bounds[offset + 1] = Infinity;
    this.#bounds[offset + 2] = -Infinity;
    this.#bounds[offset + 3] = -Infinity;
    this.#size -= 1;
    this.#rebuild(index);
    return true;
  }

  /**
   * Tests overlapping slots without a result array. Queries allow infinite bounds.
   * Predicates must not mutate this index during traversal.
   */
  // eslint-disable-next-line max-params -- @hotpath Scalar query bounds avoid allocating candidate envelopes.
  some(minX: number, minY: number, maxX: number, maxY: number, test: (index: number) => boolean): boolean {
    if (
      Number.isNaN(minX) ||
      Number.isNaN(minY) ||
      Number.isNaN(maxX) ||
      Number.isNaN(maxY) ||
      minX > maxX ||
      minY > maxY
    ) {
      throw new RangeError('Rectangle query bounds must be ordered numbers.');
    }
    return this.#size > 0 && this.#some(1, minX, minY, maxX, maxY, test);
  }

  // eslint-disable-next-line max-params -- @hotpath Recursive traversal passes scalar bounds without allocating per-node state.
  #some(
    node: number,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    test: (index: number) => boolean
  ): boolean {
    const offset = node * 4;
    if (
      this.#bounds[offset] === Infinity ||
      this.#bounds[offset]! > maxX ||
      this.#bounds[offset + 1]! > maxY ||
      this.#bounds[offset + 2]! < minX ||
      this.#bounds[offset + 3]! < minY
    )
      return false;
    if (node >= this.capacity) return test(node - this.capacity);
    return this.#some(node * 2, minX, minY, maxX, maxY, test) || this.#some(node * 2 + 1, minX, minY, maxX, maxY, test);
  }

  #assertIndex(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.capacity)
      throw new RangeError('Rectangle index is out of bounds.');
  }

  #rebuild(index: number): void {
    for (let node = Math.floor((index + this.capacity) / 2); node > 0; node = Math.floor(node / 2)) this.#merge(node);
  }

  #merge(node: number): void {
    const offset = node * 4;
    const left = offset * 2;
    const right = left + 4;
    this.#bounds[offset] = Math.min(this.#bounds[left]!, this.#bounds[right]!);
    this.#bounds[offset + 1] = Math.min(this.#bounds[left + 1]!, this.#bounds[right + 1]!);
    this.#bounds[offset + 2] = Math.max(this.#bounds[left + 2]!, this.#bounds[right + 2]!);
    this.#bounds[offset + 3] = Math.max(this.#bounds[left + 3]!, this.#bounds[right + 3]!);
  }
}

// eslint-disable-next-line max-params -- @hotpath Validation accepts the same scalar bounds as replacement.
function assertStoredBounds(minX: number, minY: number, maxX: number, maxY: number): void {
  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY) ||
    minX > maxX ||
    minY > maxY
  ) {
    throw new RangeError('Rectangle bounds must be finite and ordered.');
  }
}
