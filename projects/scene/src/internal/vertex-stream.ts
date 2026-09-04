// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LAYOUT_STRIDE_MISMATCH, LAYOUT_VALUE_INVALID, TRIANGLES_COUNT } from '../errors.js';
import type { LayoutDescriptor } from './layouts/define-layout.js';
import { RecordSummary } from './record-summary.js';
import { mergeUploadRanges, type UploadRange } from './upload-ranges.js';

export type VertexStreamIssue = typeof LAYOUT_STRIDE_MISMATCH | typeof LAYOUT_VALUE_INVALID | typeof TRIANGLES_COUNT;

export interface PreparedVertexSnapshot {
  readonly bytes: Uint8Array;
  readonly layoutName: string;
  readonly structuralIssues: ReadonlySet<VertexStreamIssue>;
  readonly summary: RecordSummary;
}

export interface VertexStreamRenderData {
  readonly bytes: Uint8Array | null;
  readonly count: number;
  readonly capacity: number;
  readonly opaque: boolean;
  readonly ready: boolean;
  readonly transparent: boolean;
  readonly uploadRanges: readonly UploadRange[];
  readonly issues: ReadonlySet<VertexStreamIssue>;
  readonly version: number;
}

interface VertexStreamStatus {
  readonly issues: ReadonlySet<VertexStreamIssue>;
  readonly opaque: boolean;
  readonly ready: boolean;
  readonly transparent: boolean;
  readonly version: number;
}

const INVALID_RECORD = 1;
const TRANSPARENT_RECORD = 2;
const OPAQUE_RECORD = 4;
const MAX_INCREMENTAL_SUMMARY_CHANGES = 1_024;
const PACKED_POSITION_COLOR_STRIDE = 16;
const PACKED_COLOR_ALPHA_OFFSET = 15;
const PLATFORM_IS_LITTLE_ENDIAN = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;

/**
 * CPU-side staging for the point, line, and triangle wire layouts.
 *
 * This object validates the source without taking ownership. The bytes returned
 * for GPU upload always belong to this object, so producers can safely reuse
 * or mutate its source after replace/commit.
 */
export class VertexStreamBuffer {
  readonly layout: LayoutDescriptor;
  readonly opaqueRecord: ((records: DataView, byteOffset: number) => boolean) | undefined;
  readonly requireCountMultipleOf: number | undefined;
  readonly transparentRecord: ((records: DataView, byteOffset: number) => boolean) | undefined;
  readonly validateRecord: ((records: DataView, byteOffset: number) => boolean) | undefined;
  readonly #usePackedPositionColorScan: boolean;

  #dirtyRanges: UploadRange[] = [];
  #ownedBytes: Uint8Array | null = null;
  #ownedBytesShared = false;
  #ownedFloats: Float32Array | null = null;
  #ownedView: DataView | null = null;
  #source: ArrayBufferView | null = null;
  #sourceCount: number | undefined;
  #status?: VertexStreamStatus;
  #structuralIssues = new Set<VertexStreamIssue>();
  #summary = new RecordSummary(3);
  #summaryShared = false;
  #count: number | undefined;
  #version = 0;

  constructor(
    layout: LayoutDescriptor,
    options: {
      requireCountMultipleOf?: number;
      opaqueRecord?: (records: DataView, byteOffset: number) => boolean;
      transparentRecord?: (records: DataView, byteOffset: number) => boolean;
      validateRecord?: (records: DataView, byteOffset: number) => boolean;
    } = {}
  ) {
    this.layout = layout;
    this.opaqueRecord = options.opaqueRecord;
    this.requireCountMultipleOf = options.requireCountMultipleOf;
    this.transparentRecord = options.transparentRecord;
    this.validateRecord = options.validateRecord;
    this.#usePackedPositionColorScan = usesPackedPositionColorScan(layout, options);
    if (
      options.requireCountMultipleOf !== undefined &&
      (!Number.isInteger(options.requireCountMultipleOf) || options.requireCountMultipleOf < 1)
    ) {
      throw new RangeError('The count divisor must be a positive integer.');
    }
  }

  /** Creates an empty buffer with the same layout and validation behavior. */
  createCompatibleBuffer(): VertexStreamBuffer {
    return new VertexStreamBuffer(this.layout, {
      opaqueRecord: this.opaqueRecord,
      requireCountMultipleOf: this.requireCountMultipleOf,
      transparentRecord: this.transparentRecord,
      validateRecord: this.validateRecord
    });
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
    return this.#count ?? this.#sourceCount ?? this.capacity;
  }

  get ready(): boolean {
    return this.#getStatus().ready;
  }

  get transparent(): boolean {
    return this.#getStatus().transparent;
  }

  get opaque(): boolean {
    return this.#getStatus().opaque;
  }

  replace(source: ArrayBufferView | null, sourceCount?: number): void {
    assertSource(source);
    this.#source = source;
    this.#sourceCount = undefined;
    this.#resetValidation();
    this.#version += 1;
    if (source === null) {
      this.#clearOwnedSource(0);
      return;
    }
    if (!this.#hasValidStride(source)) {
      return;
    }
    this.#replaceValidSource(source, sourceCount);
  }

  /** Shares validated immutable bytes and indexes until this buffer changes. */
  replacePrepared(source: ArrayBufferView, sourceCount: number | undefined, prepared: PreparedVertexSnapshot): void {
    if (source.byteLength !== prepared.bytes.byteLength || this.layout.name !== prepared.layoutName) {
      this.replace(source, sourceCount);
      return;
    }
    this.#source = source;
    this.#sourceCount = undefined;
    this.#resetValidation();
    this.#version += 1;
    this.#copyPreparedData(prepared);
    this.setSourceCount(sourceCount);
    this.#resetCountIfOutOfBounds(this.capacity);
    this.#queueDirtyRange(0, prepared.bytes.byteLength);
  }

  /** Captures immutable validated bytes for reuse by compatible layer buffers. */
  createPreparedSnapshot(): PreparedVertexSnapshot | null {
    if (!this.#ownedBytes) return null;
    this.#ownedBytesShared = true;
    this.#summaryShared = true;
    return {
      bytes: this.#ownedBytes,
      layoutName: this.layout.name,
      structuralIssues: new Set(this.#structuralIssues),
      summary: this.#summary
    };
  }

  #copyPreparedData(prepared: PreparedVertexSnapshot): void {
    this.#ownedBytes = prepared.bytes;
    this.#ownedBytesShared = true;
    this.#createOwnedRecordView();
    this.#summary = prepared.summary;
    this.#summaryShared = true;
    for (const issue of prepared.structuralIssues) this.#structuralIssues.add(issue);
  }

  #replaceValidSource(source: ArrayBufferView, sourceCount: number | undefined): void {
    const reusedStorage = this.#copySourceBytes(bytesOf(source));
    if (reusedStorage && !this.#usePackedPositionColorScan) {
      this.#revalidateAllRecords();
    } else {
      this.#summary.reset(this.capacity);
      this.#validateAllRecords();
    }
    this.setSourceCount(sourceCount);
    this.#resetCountIfOutOfBounds(this.capacity);
    this.#queueDirtyRange(0, this.#ownedBytes?.byteLength ?? 0);
  }

  #copySourceBytes(sourceBytes: Uint8Array): boolean {
    if (this.#ownedBytes?.byteLength === sourceBytes.byteLength) {
      if (this.#ownedBytesShared) {
        this.#ownedBytes = this.#ownedBytes.slice();
        this.#ownedBytesShared = false;
        this.#createOwnedRecordView();
      }
      this.#replaceSharedSummary();
      this.#ownedBytes.set(sourceBytes);
      return true;
    }
    this.#replaceSharedSummary();
    this.#ownedBytes = new Uint8Array(sourceBytes);
    this.#ownedBytesShared = false;
    this.#createOwnedRecordView();
    return false;
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

  setSourceCount(value: number | undefined): void {
    if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > this.capacity)) {
      throw new RangeError('The streamed source count must be a nonnegative integer within capacity.');
    }
    if (this.#sourceCount !== value) {
      this.#sourceCount = value;
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
    const ownedBytes = resolvedCount === 0 ? null : this.#ensureMutableState();
    if (!ownedBytes) return;
    const offset = start * this.layout.stride;
    const size = resolvedCount * this.layout.stride;
    ownedBytes.set(bytesOf(this.#source).subarray(offset, offset + size), offset);
    this.#validateCommittedRecords(start, resolvedCount);
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

  hasTransparency(count: number, evenOnly = false): boolean {
    return this.#summary.has(TRANSPARENT_RECORD, count, evenOnly);
  }

  hasOpacity(count: number, evenOnly = false): boolean {
    return this.#summary.has(OPAQUE_RECORD, count, evenOnly);
  }

  toRenderData(options: { consumeUploadRanges?: boolean } = {}): VertexStreamRenderData {
    const consumeUploadRanges = options.consumeUploadRanges ?? true;
    const status = this.#getStatus();
    return {
      bytes: status.ready ? this.#ownedBytes : null,
      capacity: this.capacity,
      count: status.ready ? this.effectiveCount : 0,
      issues: status.issues,
      opaque: status.opaque,
      ready: status.ready,
      transparent: status.transparent,
      uploadRanges: consumeUploadRanges ? this.takeUploadRanges() : [],
      version: this.#version
    };
  }

  #validateRecord(index: number, initial: boolean): void {
    if (!this.#ownedBytes || !this.#ownedView) return;
    const flags = this.#scanRecordFlags(index);
    if (initial) this.#summary.setInitialFlags(index, flags);
    else this.#summary.updateFlags(index, flags);
  }

  #validateCommittedRecords(start: number, count: number): void {
    const bytes = this.#ownedBytes;
    const floats = this.#ownedFloats;
    if (this.#usePackedPositionColorScan && bytes && floats) {
      const end = start + count;
      for (let index = start; index < end; index += 1) {
        this.#summary.updateFlags(index, packedPositionColorFlags(bytes, floats, index));
      }
      return;
    }
    for (let index = start; index < start + count; index += 1) this.#validateRecord(index, false);
  }

  #scanRecordFlags(index: number): number {
    const byteOffset = index * this.layout.stride;
    return (this.#recordIsInvalid(byteOffset) ? INVALID_RECORD : 0) | this.#renderFlags(byteOffset);
  }

  #recordIsInvalid(byteOffset: number): boolean {
    const records = this.#ownedView;
    if (!records) return true;
    const position = this.layout.fields.position;
    if (position) {
      const width = position.type === 'f32x3' ? 3 : position.type === 'f32x2' ? 2 : 1;
      for (let component = 0; component < width; component += 1) {
        if (!Number.isFinite(records.getFloat32(byteOffset + position.offset + component * 4, true))) return true;
      }
    }
    return this.validateRecord !== undefined && !this.validateRecord(records, byteOffset);
  }

  #renderFlags(byteOffset: number): number {
    const bytes = this.#ownedBytes;
    const records = this.#ownedView;
    if (!bytes || !records) return 0;
    const alpha = this.#recordAlpha(bytes, byteOffset);
    const opaque = this.#recordIsOpaque(records, byteOffset, alpha);
    const transparent = this.#recordIsTransparent(records, byteOffset, alpha);
    return (transparent ? TRANSPARENT_RECORD : 0) | (opaque ? OPAQUE_RECORD : 0);
  }

  #recordAlpha(bytes: Uint8Array, byteOffset: number): number {
    const alphaOffset = this.layout.fields.color?.offset;
    if (alphaOffset === undefined) return 255;
    return bytes[byteOffset + alphaOffset + 3] ?? 0;
  }

  #recordIsOpaque(records: DataView, byteOffset: number, alpha: number): boolean {
    if (this.opaqueRecord) return this.opaqueRecord(records, byteOffset);
    return alpha === 255;
  }

  #recordIsTransparent(records: DataView, byteOffset: number, alpha: number): boolean {
    if (this.transparentRecord) return this.transparentRecord(records, byteOffset);
    // Zero-alpha vertices can interpolate with opaque triangle vertices into visible translucent fragments.
    return alpha < 255;
  }

  #queueDirtyRange(offset: number, size: number): void {
    if (size > 0) {
      this.#dirtyRanges.push({ offset, size });
    }
  }

  #ensureMutableState(): Uint8Array | null {
    if (this.#ownedBytesShared && this.#ownedBytes) {
      this.#ownedBytes = this.#ownedBytes.slice();
      this.#ownedBytesShared = false;
      this.#createOwnedRecordView();
    }
    if (this.#summaryShared) {
      this.#summary = this.#summary.clone();
      this.#summaryShared = false;
    }
    return this.#ownedBytes;
  }

  #replaceSharedSummary(): void {
    if (this.#summaryShared) this.#summary = new RecordSummary(3);
    this.#summaryShared = false;
  }

  #createOwnedRecordView(): void {
    const bytes = this.#ownedBytes;
    if (!bytes) return;
    this.#ownedFloats = this.#usePackedPositionColorScan
      ? new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / Float32Array.BYTES_PER_ELEMENT)
      : null;
    this.#ownedView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  #resetValidation(): void {
    this.#dirtyRanges = [];
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
    this.#replaceSharedSummary();
    this.#ownedBytes = null;
    this.#ownedBytesShared = false;
    this.#ownedFloats = null;
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
    const bytes = this.#ownedBytes;
    const floats = this.#ownedFloats;
    if (this.#usePackedPositionColorScan && bytes && floats) {
      const uniformFlags = this.#initializePackedPositionColorRecords(bytes, floats);
      this.#summary.finishInitialFlags(uniformFlags ?? undefined);
      return;
    }
    for (let index = 0; index < this.capacity; index += 1) {
      this.#validateRecord(index, true);
    }
    this.#summary.finishInitialFlags();
  }

  #initializePackedPositionColorRecords(bytes: Uint8Array, floats: Float32Array): number | null {
    let uniformFlags: number | undefined;
    let uniform = true;
    for (let index = 0; index < this.capacity; index += 1) {
      const flags = packedPositionColorFlags(bytes, floats, index);
      this.#summary.setInitialFlags(index, flags);
      if (uniformFlags === undefined) uniformFlags = flags;
      else if (uniformFlags !== flags) uniform = false;
    }
    return uniform ? (uniformFlags ?? 0) : null;
  }

  #revalidateAllRecords(): void {
    if (!this.#ownedBytes || !this.#ownedView) return;
    let changedRecords = 0;
    let rebuildSummary = false;
    for (let index = 0; index < this.capacity; index += 1) {
      const flags = this.#scanRecordFlags(index);
      if (rebuildSummary) {
        this.#summary.setInitialFlags(index, flags);
      } else if (this.#summary.updateFlags(index, flags)) {
        changedRecords += 1;
        rebuildSummary = changedRecords > MAX_INCREMENTAL_SUMMARY_CHANGES;
      }
    }
    if (rebuildSummary) this.#summary.finishInitialFlags();
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
    const passes = this.#getPassStatus(count, ready);
    this.#status = {
      issues,
      opaque: passes.opaque,
      ready,
      transparent: passes.transparent,
      version: this.#version
    };
    return this.#status;
  }

  #getPassStatus(count: number, ready: boolean): { readonly opaque: boolean; readonly transparent: boolean } {
    if (!ready) return { opaque: false, transparent: false };
    return {
      opaque: this.#summary.has(OPAQUE_RECORD, count),
      transparent: this.#summary.has(TRANSPARENT_RECORD, count)
    };
  }
}

function usesPackedPositionColorScan(
  layout: LayoutDescriptor,
  options: {
    readonly opaqueRecord?: (records: DataView, byteOffset: number) => boolean;
    readonly transparentRecord?: (records: DataView, byteOffset: number) => boolean;
    readonly validateRecord?: (records: DataView, byteOffset: number) => boolean;
  }
): boolean {
  const position = layout.fields.position;
  const color = layout.fields.color;
  const canonicalLayout =
    PLATFORM_IS_LITTLE_ENDIAN &&
    layout.stride === PACKED_POSITION_COLOR_STRIDE &&
    position?.type === 'f32x3' &&
    position.offset === 0 &&
    color?.type === 'unorm8x4' &&
    color.offset === 12;
  return canonicalLayout && usesDefaultRecordRules(options);
}

function usesDefaultRecordRules(options: {
  readonly opaqueRecord?: (records: DataView, byteOffset: number) => boolean;
  readonly transparentRecord?: (records: DataView, byteOffset: number) => boolean;
  readonly validateRecord?: (records: DataView, byteOffset: number) => boolean;
}): boolean {
  return (
    options.opaqueRecord === undefined &&
    options.transparentRecord === undefined &&
    options.validateRecord === undefined
  );
}

function packedPositionColorFlags(bytes: Uint8Array, floats: Float32Array, index: number): number {
  const floatOffset = index * (PACKED_POSITION_COLOR_STRIDE / Float32Array.BYTES_PER_ELEMENT);
  const invalid =
    !Number.isFinite(floats[floatOffset]) ||
    !Number.isFinite(floats[floatOffset + 1]) ||
    !Number.isFinite(floats[floatOffset + 2]);
  const alpha = bytes[index * PACKED_POSITION_COLOR_STRIDE + PACKED_COLOR_ALPHA_OFFSET] ?? 0;
  return (invalid ? INVALID_RECORD : 0) | (alpha < 255 ? TRANSPARENT_RECORD : 0) | (alpha === 255 ? OPAQUE_RECORD : 0);
}

function bytesOf(view: ArrayBufferView): Uint8Array {
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}

function assertSource(source: ArrayBufferView | null): void {
  if (source !== null && !ArrayBuffer.isView(source)) {
    throw new TypeError('A streamed vertex source must be an ArrayBufferView or null.');
  }
}

function assertCommitRange(start: number, count: number | undefined, capacity: number): void {
  if (!Number.isInteger(start) || start < 0 || start > capacity) {
    throw new RangeError('Commit start must be a nonnegative integer within capacity.');
  }
  if (count !== undefined && (!Number.isInteger(count) || count < 0 || start + count > capacity)) {
    throw new RangeError('Commit count must be a nonnegative integer within capacity.');
  }
}
