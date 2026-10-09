// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface ByteTransferSpan {
  readonly sourceOffset: number;
  readonly target: number;
  readonly targetOffset: number;
  readonly size: number;
}

// eslint-disable-next-line max-params -- @hotpath Numeric arguments avoid allocating a result object for every transfer.
export type ByteTransferVisitor = (target: number, sourceOffset: number, targetOffset: number, size: number) => void;

interface IndexedSpan extends ByteTransferSpan {
  readonly end: number;
  readonly ordinal: number;
}

const LINEAR_SPAN_LIMIT = 8;

/** Indexes half-open source spans and translates their intersections in the original transfer order. */
export class ByteTransferIndex {
  readonly #entries: readonly IndexedSpan[];
  readonly #sorted: readonly IndexedSpan[];
  readonly #subtreeEnds: Float64Array;
  readonly #sourceOrdered: boolean;
  readonly #maximumEnd: number;

  constructor(spans: readonly ByteTransferSpan[]) {
    const entries = copySpans(spans);
    const sourceOrdered = entries.every(
      (entry, index) => index === 0 || entry.sourceOffset >= entries[index - 1]!.sourceOffset
    );
    this.#entries = entries;
    this.#sourceOrdered = sourceOrdered;
    this.#maximumEnd = entries.reduce((end, entry) => Math.max(end, entry.end), 0);
    this.#sorted = sourceOrdered
      ? entries
      : entries.slice().sort((left, right) => left.sourceOffset - right.sourceOffset || left.ordinal - right.ordinal);
    this.#subtreeEnds = new Float64Array(entries.length > LINEAR_SPAN_LIMIT ? entries.length : 0);
    if (this.#subtreeEnds.length > 0) this.#build(0, entries.length);
  }

  get size(): number {
    return this.#entries.length;
  }

  /** Reports every overlap, including duplicate source bytes, without merging destination writes. */
  forEachIntersection(offset: number, size: number, visit: ByteTransferVisitor): void {
    validateRange(offset, size);
    if (size === 0) return;
    const end = offset + size;
    if (this.#entries.length === 0) return;
    if (offset <= this.#sorted[0]!.sourceOffset && end >= this.#maximumEnd) {
      for (const entry of this.#entries) visit(entry.target, entry.sourceOffset, entry.targetOffset, entry.size);
    } else if (this.#entries.length <= LINEAR_SPAN_LIMIT) {
      for (const entry of this.#entries) visitIntersection(entry, offset, end, visit);
    } else if (this.#sourceOrdered) {
      this.#visit(0, this.#sorted.length, offset, end, visit);
    } else {
      const matches: IndexedSpan[] = [];
      this.#collect(0, this.#sorted.length, offset, end, matches);
      matches.sort((left, right) => left.ordinal - right.ordinal);
      for (const entry of matches) visitIntersection(entry, offset, end, visit);
    }
  }

  #build(low: number, high: number): number {
    if (low >= high) return 0;
    const middle = Math.floor((low + high) / 2);
    const end = Math.max(this.#sorted[middle]!.end, this.#build(low, middle), this.#build(middle + 1, high));
    this.#subtreeEnds[middle] = end;
    return end;
  }

  // eslint-disable-next-line max-params -- @hotpath Numeric traversal bounds avoid per-node query allocations.
  #visit(low: number, high: number, start: number, end: number, visit: ByteTransferVisitor): void {
    if (low >= high) return;
    const middle = Math.floor((low + high) / 2);
    if (this.#subtreeEnds[middle]! <= start || this.#sorted[low]!.sourceOffset >= end) return;
    this.#visit(low, middle, start, end, visit);
    visitIntersection(this.#sorted[middle]!, start, end, visit);
    this.#visit(middle + 1, high, start, end, visit);
  }

  // eslint-disable-next-line max-params -- @hotpath Numeric traversal bounds avoid per-node query allocations.
  #collect(low: number, high: number, start: number, end: number, matches: IndexedSpan[]): void {
    if (low >= high) return;
    const middle = Math.floor((low + high) / 2);
    if (this.#subtreeEnds[middle]! <= start || this.#sorted[low]!.sourceOffset >= end) return;
    this.#collect(low, middle, start, end, matches);
    const entry = this.#sorted[middle]!;
    if (entry.sourceOffset < end && entry.end > start) matches.push(entry);
    this.#collect(middle + 1, high, start, end, matches);
  }
}

function copySpans(spans: readonly ByteTransferSpan[]): IndexedSpan[] {
  const entries: IndexedSpan[] = [];
  for (const [ordinal, span] of spans.entries()) {
    const { sourceOffset, target, targetOffset, size } = span;
    validateRange(sourceOffset, size);
    validateRange(targetOffset, size);
    if (!Number.isSafeInteger(target) || target < 0) {
      throw new RangeError('Transfer targets must be nonnegative safe integers.');
    }
    if (size > 0) entries.push({ end: sourceOffset + size, ordinal, size, sourceOffset, target, targetOffset });
  }
  return entries;
}

// eslint-disable-next-line max-params -- @hotpath Numeric bounds avoid allocating a result object for every transfer.
function visitIntersection(entry: IndexedSpan, offset: number, end: number, visit: ByteTransferVisitor): void {
  const start = Math.max(offset, entry.sourceOffset);
  const stop = Math.min(end, entry.end);
  if (start < stop) visit(entry.target, start, entry.targetOffset + (start - entry.sourceOffset), stop - start);
}

function validateRange(offset: number, size: number): void {
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    !Number.isSafeInteger(size) ||
    size < 0 ||
    !Number.isSafeInteger(offset + size)
  ) {
    throw new RangeError('Transfer offsets, sizes, and endpoints must be nonnegative safe integers.');
  }
}
