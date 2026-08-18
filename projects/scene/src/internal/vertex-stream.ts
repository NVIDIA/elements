// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LAYOUT_STRIDE_MISMATCH, LAYOUT_VALUE_INVALID, TRIANGLES_COUNT } from '../errors.js';
import type { LayoutDescriptor } from './layouts/define-layout.js';

interface UploadRange {
  readonly offset: number;
  readonly size: number;
}

export type VertexStreamIssue = typeof LAYOUT_STRIDE_MISMATCH | typeof LAYOUT_VALUE_INVALID | typeof TRIANGLES_COUNT;

export interface VertexStreamRenderData {
  readonly bytes: Uint8Array | null;
  readonly count: number;
  readonly capacity: number;
  readonly ready: boolean;
  readonly transparent: boolean;
  readonly uploadRanges: readonly UploadRange[];
  readonly issues: ReadonlySet<VertexStreamIssue>;
  readonly version: number;
}

/**
 * CPU-side staging for the point, line, and triangle wire layouts.
 *
 * This object validates the source without taking ownership. The bytes returned
 * for GPU upload always belong to this object, so producers can safely reuse
 * or mutate its source after replace/commit.
 */
export class VertexStreamBuffer {
  readonly layout: LayoutDescriptor;
  readonly requireCountMultipleOf: number | undefined;
  readonly validateRecord: ((record: DataView) => boolean) | undefined;

  #dirtyRanges: UploadRange[] = [];
  #issuesByRecord = new Map<number, Set<VertexStreamIssue>>();
  #ownedBytes: Uint8Array | null = null;
  #source: ArrayBufferView | null = null;
  #structuralIssues = new Set<VertexStreamIssue>();
  #count: number | undefined;
  #version = 0;

  constructor(
    layout: LayoutDescriptor,
    options: { requireCountMultipleOf?: number; validateRecord?: (record: DataView) => boolean } = {}
  ) {
    this.layout = layout;
    this.requireCountMultipleOf = options.requireCountMultipleOf;
    this.validateRecord = options.validateRecord;
    if (
      options.requireCountMultipleOf !== undefined &&
      (!Number.isInteger(options.requireCountMultipleOf) || options.requireCountMultipleOf < 1)
    ) {
      throw new RangeError('The count divisor must be a positive integer.');
    }
  }

  get source(): ArrayBufferView | null {
    return this.#source;
  }

  get count(): number | undefined {
    return this.#count;
  }

  set count(value: number | undefined) {
    this.setCount(value);
  }

  get capacity(): number {
    return this.#ownedBytes ? this.#ownedBytes.byteLength / this.layout.stride : 0;
  }

  get effectiveCount(): number {
    return this.#count ?? this.capacity;
  }

  get ready(): boolean {
    return this.#readyWithoutCountIssue() && !this.hasCountIssue();
  }

  get transparent(): boolean {
    if (!this.ready || !this.#ownedBytes) {
      return false;
    }
    const alphaOffset = this.layout.fields.color?.offset;
    if (alphaOffset === undefined) {
      return false;
    }
    for (let index = 0; index < this.effectiveCount; index += 1) {
      if (this.#ownedBytes[index * this.layout.stride + alphaOffset + 3] !== 255) {
        return true;
      }
    }
    return false;
  }

  replace(source: ArrayBufferView | null): void {
    if (source !== null && !ArrayBuffer.isView(source)) {
      throw new TypeError('A streamed vertex source must be an ArrayBufferView or null.');
    }
    this.#source = source;
    this.#resetValidation();
    this.#version += 1;
    if (source === null) {
      this.#clearOwnedSource(0);
      return;
    }
    if (!this.#hasValidStride(source)) {
      return;
    }
    this.#ownedBytes = new Uint8Array(bytesOf(source));
    this.#validateAllRecords();
    this.#resetCountIfOutOfBounds(this.capacity);
    this.#queueDirtyRange(0, this.#ownedBytes.byteLength);
  }

  setCount(value: number | undefined): void {
    if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > this.capacity)) {
      throw new RangeError('The streamed vertex count must be a nonnegative integer within capacity.');
    }
    if (this.#count !== value) {
      this.#count = value;
      this.#version += 1;
    }
  }

  /** Commit a range after the producer mutates its source in place. */
  commit(start = 0, count?: number): void {
    if (this.#source === null) {
      return;
    }
    assertCommitRange(start, count, this.capacity);
    const resolvedCount = count ?? this.capacity - start;
    if (!this.#ownedBytes || resolvedCount === 0) {
      return;
    }
    const offset = start * this.layout.stride;
    const size = resolvedCount * this.layout.stride;
    this.#ownedBytes.set(bytesOf(this.#source).subarray(offset, offset + size), offset);
    for (let index = start; index < start + resolvedCount; index += 1) {
      this.#validateRecord(index);
    }
    this.#queueDirtyRange(offset, size);
    this.#version += 1;
  }

  getIssues(): ReadonlySet<VertexStreamIssue> {
    const issues = new Set<VertexStreamIssue>(this.#structuralIssues);
    for (const [index, recordIssues] of this.#issuesByRecord) {
      if (index < this.effectiveCount) recordIssues.forEach(issue => issues.add(issue));
    }
    if (this.hasCountIssue()) {
      issues.add(TRIANGLES_COUNT);
    }
    return issues;
  }

  getUploadBytes(): Uint8Array | null {
    return this.ready ? this.#ownedBytes : null;
  }

  takeUploadRanges(): UploadRange[] {
    if (!this.ready) {
      return [];
    }
    const ranges = mergeUploadRanges(this.#dirtyRanges);
    this.#dirtyRanges = [];
    return ranges;
  }

  getVersion(): number {
    return this.#version;
  }

  toRenderData(options: { consumeUploadRanges?: boolean } = {}): VertexStreamRenderData {
    const consumeUploadRanges = options.consumeUploadRanges ?? true;
    return {
      bytes: this.getUploadBytes(),
      capacity: this.capacity,
      count: this.ready ? this.effectiveCount : 0,
      issues: this.getIssues(),
      ready: this.ready,
      transparent: this.transparent,
      uploadRanges: consumeUploadRanges ? this.takeUploadRanges() : [],
      version: this.#version
    };
  }

  #validateRecord(index: number): void {
    if (!this.#ownedBytes) {
      return;
    }
    const record = new DataView(this.#ownedBytes.buffer, index * this.layout.stride, this.layout.stride);
    const issues = new Set<VertexStreamIssue>();
    const position = this.layout.fields.position;
    if (position) {
      const width = position.type === 'f32x3' ? 3 : position.type === 'f32x2' ? 2 : 1;
      for (let component = 0; component < width; component += 1) {
        if (!Number.isFinite(record.getFloat32(position.offset + component * 4, true))) {
          issues.add(LAYOUT_VALUE_INVALID);
        }
      }
    }
    if (this.validateRecord && !this.validateRecord(record)) {
      issues.add(LAYOUT_VALUE_INVALID);
    }
    if (issues.size === 0) {
      this.#issuesByRecord.delete(index);
    } else {
      this.#issuesByRecord.set(index, issues);
    }
  }

  #queueDirtyRange(offset: number, size: number): void {
    if (size > 0) {
      this.#dirtyRanges.push({ offset, size });
    }
  }

  #resetValidation(): void {
    this.#dirtyRanges = [];
    this.#issuesByRecord.clear();
    this.#structuralIssues.clear();
  }

  hasCountIssue(): boolean {
    return (
      this.requireCountMultipleOf !== undefined &&
      this.#readyWithoutCountIssue() &&
      this.effectiveCount % this.requireCountMultipleOf !== 0
    );
  }

  #readyWithoutCountIssue(): boolean {
    return this.#structuralIssues.size === 0 && !this.#hasActiveRecordIssues();
  }

  #hasActiveRecordIssues(): boolean {
    for (const index of this.#issuesByRecord.keys()) {
      if (index < this.effectiveCount) return true;
    }
    return false;
  }

  #resetCountIfOutOfBounds(capacity: number): void {
    if (this.#count !== undefined && this.#count > capacity) {
      this.#count = undefined;
      this.#version += 1;
    }
  }

  #clearOwnedSource(capacity: number): void {
    this.#ownedBytes = null;
    this.#resetCountIfOutOfBounds(capacity);
  }

  #hasValidStride(source: ArrayBufferView): boolean {
    if (source.byteLength % this.layout.stride === 0) {
      return true;
    }
    this.#structuralIssues.add(LAYOUT_STRIDE_MISMATCH);
    this.#clearOwnedSource(0);
    return false;
  }

  #validateAllRecords(): void {
    for (let index = 0; index < this.capacity; index += 1) {
      this.#validateRecord(index);
    }
  }
}

export function mergeUploadRanges(ranges: readonly UploadRange[]): UploadRange[] {
  const sorted = [...ranges].filter(range => range.size > 0).sort((left, right) => left.offset - right.offset);
  const merged: UploadRange[] = [];
  for (const range of sorted) {
    const previous = merged.at(-1);
    const end = range.offset + range.size;
    if (previous && range.offset <= previous.offset + previous.size) {
      merged[merged.length - 1] = {
        offset: previous.offset,
        size: Math.max(previous.offset + previous.size, end) - previous.offset
      };
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

function bytesOf(view: ArrayBufferView): Uint8Array {
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}

function assertCommitRange(start: number, count: number | undefined, capacity: number): void {
  if (!Number.isInteger(start) || start < 0 || start > capacity) {
    throw new RangeError('Commit start must be a nonnegative integer within capacity.');
  }
  if (count !== undefined && (!Number.isInteger(count) || count < 0 || start + count > capacity)) {
    throw new RangeError('Commit count must be a nonnegative integer within capacity.');
  }
}
