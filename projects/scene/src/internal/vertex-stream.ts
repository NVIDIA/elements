// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LAYOUT_STRIDE_MISMATCH, LAYOUT_VALUE_INVALID, TRIANGLES_COUNT } from '../errors.js';
import type { LayoutDescriptor } from './layouts/define-layout.js';
import { RecordSummary } from './record-summary.js';

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

export interface VertexStreamPerformanceSnapshot {
  readonly recordScans: number;
  readonly recordViewAllocations: number;
  readonly summaryPrefixQueries: number;
  readonly summaryRemainderScans: number;
  readonly summaryStorageAllocations: number;
}

interface VertexStreamStatus {
  readonly issues: ReadonlySet<VertexStreamIssue>;
  readonly ready: boolean;
  readonly transparent: boolean;
  readonly version: number;
}

const INVALID_RECORD = 1;
const TRANSPARENT_RECORD = 2;

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
  readonly transparentRecord: ((records: DataView, byteOffset: number) => boolean) | undefined;
  readonly validateRecord: ((records: DataView, byteOffset: number) => boolean) | undefined;

  #dirtyRanges: UploadRange[] = [];
  #ownedBytes: Uint8Array | null = null;
  #ownedView: DataView | null = null;
  #recordScans = 0;
  #recordViewAllocations = 0;
  #source: ArrayBufferView | null = null;
  #status?: VertexStreamStatus;
  #structuralIssues = new Set<VertexStreamIssue>();
  #summary = new RecordSummary(2);
  #count: number | undefined;
  #version = 0;

  constructor(
    layout: LayoutDescriptor,
    options: {
      requireCountMultipleOf?: number;
      transparentRecord?: (records: DataView, byteOffset: number) => boolean;
      validateRecord?: (records: DataView, byteOffset: number) => boolean;
    } = {}
  ) {
    this.layout = layout;
    this.requireCountMultipleOf = options.requireCountMultipleOf;
    this.transparentRecord = options.transparentRecord;
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
    return this.#getStatus().ready;
  }

  get transparent(): boolean {
    return this.#getStatus().transparent;
  }

  // eslint-disable-next-line max-statements -- Replacement resets owned storage, validation, and cached summaries together.
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
    this.#ownedView = new DataView(this.#ownedBytes.buffer, this.#ownedBytes.byteOffset, this.#ownedBytes.byteLength);
    this.#recordViewAllocations += 1;
    this.#summary.reset(this.capacity);
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
      this.#validateRecord(index, false);
    }
    this.#queueDirtyRange(offset, size);
    this.#version += 1;
  }

  getIssues(): ReadonlySet<VertexStreamIssue> {
    return this.#getStatus().issues;
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

  getPerformanceSnapshot(): VertexStreamPerformanceSnapshot {
    const summary = this.#summary.getSnapshot();
    return {
      recordScans: this.#recordScans,
      recordViewAllocations: this.#recordViewAllocations,
      summaryPrefixQueries: summary.prefixQueries,
      summaryRemainderScans: summary.remainderScans,
      summaryStorageAllocations: summary.storageAllocations
    };
  }

  hasTransparency(count: number, evenOnly = false): boolean {
    return this.#summary.has(TRANSPARENT_RECORD, count, evenOnly);
  }

  toRenderData(options: { consumeUploadRanges?: boolean } = {}): VertexStreamRenderData {
    const consumeUploadRanges = options.consumeUploadRanges ?? true;
    const status = this.#getStatus();
    return {
      bytes: status.ready ? this.#ownedBytes : null,
      capacity: this.capacity,
      count: status.ready ? this.effectiveCount : 0,
      issues: status.issues,
      ready: status.ready,
      transparent: status.transparent,
      uploadRanges: consumeUploadRanges ? this.takeUploadRanges() : [],
      version: this.#version
    };
  }

  // eslint-disable-next-line complexity -- One record combines optional layout, custom validation, and transparency checks.
  #validateRecord(index: number, initial: boolean): void {
    if (!this.#ownedBytes || !this.#ownedView) {
      return;
    }
    this.#recordScans += 1;
    const byteOffset = index * this.layout.stride;
    let invalid = false;
    const position = this.layout.fields.position;
    if (position) {
      const width = position.type === 'f32x3' ? 3 : position.type === 'f32x2' ? 2 : 1;
      for (let component = 0; component < width; component += 1) {
        if (!Number.isFinite(this.#ownedView.getFloat32(byteOffset + position.offset + component * 4, true)))
          invalid = true;
      }
    }
    if (this.validateRecord && !this.validateRecord(this.#ownedView, byteOffset)) invalid = true;
    const alphaOffset = this.layout.fields.color?.offset;
    const transparent = this.transparentRecord
      ? this.transparentRecord(this.#ownedView, byteOffset)
      : alphaOffset !== undefined && this.#ownedBytes[byteOffset + alphaOffset + 3] !== 255;
    const flags = (invalid ? INVALID_RECORD : 0) | (transparent ? TRANSPARENT_RECORD : 0);
    if (initial) this.#summary.setInitialFlags(index, flags);
    else this.#summary.updateFlags(index, flags);
  }

  #queueDirtyRange(offset: number, size: number): void {
    if (size > 0) {
      this.#dirtyRanges.push({ offset, size });
    }
  }

  #resetValidation(): void {
    this.#dirtyRanges = [];
    this.#ownedView = null;
    this.#status = undefined;
    this.#structuralIssues.clear();
  }

  hasCountIssue(): boolean {
    return (
      this.requireCountMultipleOf !== undefined &&
      this.#structuralIssues.size === 0 &&
      !this.#summary.has(INVALID_RECORD, this.effectiveCount) &&
      this.effectiveCount % this.requireCountMultipleOf !== 0
    );
  }

  #resetCountIfOutOfBounds(capacity: number): void {
    if (this.#count !== undefined && this.#count > capacity) {
      this.#count = undefined;
      this.#version += 1;
    }
  }

  #clearOwnedSource(capacity: number): void {
    this.#ownedBytes = null;
    this.#ownedView = null;
    this.#summary.reset(0);
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
      this.#validateRecord(index, true);
    }
    this.#summary.finishInitialFlags();
  }

  #getStatus(): VertexStreamStatus {
    if (this.#status?.version === this.#version) return this.#status;
    const count = this.effectiveCount;
    const invalid = this.#summary.has(INVALID_RECORD, count);
    const readyWithoutCountIssue = this.#structuralIssues.size === 0 && !invalid;
    const countIssue =
      this.requireCountMultipleOf !== undefined && readyWithoutCountIssue && count % this.requireCountMultipleOf !== 0;
    const issues = new Set<VertexStreamIssue>(this.#structuralIssues);
    if (invalid) issues.add(LAYOUT_VALUE_INVALID);
    if (countIssue) issues.add(TRIANGLES_COUNT);
    const ready = readyWithoutCountIssue && !countIssue;
    this.#status = {
      issues,
      ready,
      transparent: ready && this.#summary.has(TRANSPARENT_RECORD, count),
      version: this.#version
    };
    return this.#status;
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
