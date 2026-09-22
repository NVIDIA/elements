// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { RangeSet } from './range-set.js';

const WIDTH = 6;

/**
 * Numeric AABB unions over indexed leaves. Bounds store minimum xyz followed by
 * maximum xyz. Empty leaves use positive minima and negative maxima at infinity.
 * Mutations rebuild affected ancestors together on the next prefix query.
 * Callers validate indices, prefix lengths, and six-component buffers.
 */
export class BoundsSegmentTree {
  #length = 0;
  #values = new Float64Array();
  #dirtyStart = Number.POSITIVE_INFINITY;
  #dirtyEnd = 0;
  // Writes outside the active span move the previous span here.
  #dirtyRanges?: RangeSet;

  clone(): BoundsSegmentTree {
    const clone = new BoundsSegmentTree();
    clone.#length = this.#length;
    clone.#values = this.#values.slice();
    clone.#dirtyStart = this.#dirtyStart;
    clone.#dirtyEnd = this.#dirtyEnd;
    if (this.#dirtyRanges) {
      clone.#dirtyRanges = new RangeSet();
      clone.#dirtyRanges.addAll(this.#dirtyRanges.snapshot());
    }
    return clone;
  }

  reset(length: number): void {
    if (!Number.isSafeInteger(length) || length < 0) {
      throw new RangeError('Bounds tree length must be a nonnegative safe integer.');
    }
    if (length !== this.#length) this.#values = new Float64Array(length * 2 * WIDTH);
    this.#length = length;
    this.#clearNodes(0, length * 2);
    this.#dirtyStart = Number.POSITIVE_INFINITY;
    this.#dirtyEnd = 0;
    this.#dirtyRanges = undefined;
  }

  /** Includes one checked six-component bound in a checked leaf index. */
  include(index: number, bounds: Float64Array): void {
    union(this.#values, (this.#length + index) * WIDTH, bounds, 0);
    this.#markDirty(index, index + 1);
  }

  /** Clears a checked half-open range of leaves, allowing their bounds to shrink. */
  clear(start: number, end: number): void {
    if (start === end) return;
    this.#clearNodes(this.#length + start, this.#length + end);
    this.#markDirty(start, end);
  }

  /** Extends a caller-owned bound by the checked prefix without allocating a result. */
  extendPrefix(count: number, target: Float64Array): void {
    if (count === 0) return;
    this.#rebuild();
    let left = this.#length;
    let right = left + count;
    while (left < right) {
      if (left % 2 !== 0) union(target, 0, this.#values, left++ * WIDTH);
      if (right % 2 !== 0) union(target, 0, this.#values, --right * WIDTH);
      left = Math.floor(left / 2);
      right = Math.floor(right / 2);
    }
  }

  #markDirty(start: number, end: number): void {
    if (start >= this.#dirtyStart && end <= this.#dirtyEnd) return;
    if (end >= this.#dirtyStart && start <= this.#dirtyEnd) {
      this.#dirtyStart = Math.min(this.#dirtyStart, start);
      this.#dirtyEnd = Math.max(this.#dirtyEnd, end);
      return;
    }
    if (this.#dirtyEnd !== 0) {
      this.#dirtyRanges ??= new RangeSet();
      this.#dirtyRanges.add(this.#dirtyStart, this.#dirtyEnd - this.#dirtyStart);
    }
    this.#dirtyStart = start;
    this.#dirtyEnd = end;
  }

  #clearNodes(start: number, end: number): void {
    for (let node = start; node < end; node += 1) {
      const offset = node * WIDTH;
      this.#values.fill(Number.POSITIVE_INFINITY, offset, offset + 3);
      this.#values.fill(Number.NEGATIVE_INFINITY, offset + 3, offset + WIDTH);
    }
  }

  #rebuild(): void {
    if (this.#dirtyEnd === 0) return;
    if (this.#dirtyRanges) this.#rebuildDisjoint(this.#dirtyRanges);
    else this.#rebuildSpan();
    this.#dirtyStart = Number.POSITIVE_INFINITY;
    this.#dirtyEnd = 0;
    this.#dirtyRanges = undefined;
  }

  #rebuildSpan(): void {
    let first = Math.floor((this.#length + this.#dirtyStart) / 2);
    let last = Math.floor((this.#length + this.#dirtyEnd - 1) / 2);
    while (first > 0) {
      rebuildNodes(this.#values, first, last);
      first = Math.floor(first / 2);
      last = Math.floor(last / 2);
    }
  }

  #rebuildDisjoint(ranges: RangeSet): void {
    ranges.add(this.#dirtyStart, this.#dirtyEnd - this.#dirtyStart);
    let frontier = ranges.drain();
    let leafOffset = this.#length;
    while (frontier.length > 0) {
      for (const { offset, size } of frontier) {
        const first = Math.max(1, Math.floor((leafOffset + offset) / 2));
        const last = Math.floor((leafOffset + offset + size - 1) / 2);
        if (last >= first) ranges.add(first, last - first + 1);
      }
      frontier = ranges.drain();
      // Descending node order handles leaves at different depths in trees whose
      // length isn't a power of two. Shared ancestors merge before each pass.
      for (let index = frontier.length - 1; index >= 0; index -= 1) {
        const { offset, size } = frontier[index]!;
        rebuildNodes(this.#values, offset, offset + size - 1);
      }
      leafOffset = 0;
    }
  }
}

// eslint-disable-next-line max-params -- @hotpath Scalar offsets avoid allocating views or wrappers for each tree node.
function union(target: Float64Array, targetOffset: number, source: Float64Array, sourceOffset: number): void {
  for (let axis = 0; axis < 3; axis += 1) {
    target[targetOffset + axis] = Math.min(target[targetOffset + axis]!, source[sourceOffset + axis]!);
    target[targetOffset + axis + 3] = Math.max(target[targetOffset + axis + 3]!, source[sourceOffset + axis + 3]!);
  }
}

function rebuildNodes(values: Float64Array, first: number, last: number): void {
  for (let node = last; node >= first; node -= 1) {
    const offset = node * WIDTH;
    const left = node * 2 * WIDTH;
    for (let axis = 0; axis < 3; axis += 1) {
      values[offset + axis] = Math.min(values[left + axis]!, values[left + WIDTH + axis]!);
      values[offset + axis + 3] = Math.max(values[left + axis + 3]!, values[left + WIDTH + axis + 3]!);
    }
  }
}
