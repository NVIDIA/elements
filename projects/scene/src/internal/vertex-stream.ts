// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LAYOUT_STRIDE_MISMATCH, LAYOUT_VALUE_INVALID, TRIANGLES_COUNT } from '../errors.js';
import { POINT } from './layouts/built-ins.js';
import { getFieldOffset, type LayoutDescriptor } from './layouts/define-layout.js';
import { assertCommitRange, getArrayBufferViewBytes, RecordStorage } from './record-storage.js';
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

interface OwnedRecordData {
  readonly bytes: Uint8Array;
  readonly records: DataView;
}

const INVALID_RECORD = 1;
const TRANSPARENT_RECORD = 2;
const OPAQUE_RECORD = 4;
const MAX_INCREMENTAL_SUMMARY_CHANGES = 1_024;
const PACKED_POSITION_COLOR_STRIDE = POINT.stride;
const PACKED_COLOR_ALPHA_OFFSET = getFieldOffset(POINT, 'color') + 3;
const PLATFORM_IS_LITTLE_ENDIAN = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;

interface RevalidationData {
  readonly bytes: Uint8Array;
  readonly records: DataView;
}

interface PositionOptions {
  readonly offset: number;
  readonly width: number;
}

interface RevalidationOptions {
  readonly colorOffset: number | undefined;
  readonly opaqueRecord: ((records: DataView, byteOffset: number) => boolean) | undefined;
  readonly position: PositionOptions;
  readonly stride: number;
  readonly transparentRecord: ((records: DataView, byteOffset: number) => boolean) | undefined;
  readonly validateRecord: ((records: DataView, byteOffset: number) => boolean) | undefined;
}

function hasInvalidPosition(records: DataView, byteOffset: number, position: PositionOptions): boolean {
  for (let component = 0; component < position.width; component += 1) {
    if (!Number.isFinite(records.getFloat32(byteOffset + position.offset + component * 4, true))) return true;
  }
  return false;
}

function scanRevalidatedRecord(index: number, data: RevalidationData, options: RevalidationOptions): number {
  const { bytes, records } = data;
  const { colorOffset, opaqueRecord, position, stride, transparentRecord, validateRecord } = options;
  const byteOffset = index * stride;
  const invalid =
    hasInvalidPosition(records, byteOffset, position) ||
    (validateRecord !== undefined && !validateRecord(records, byteOffset));
  const alpha = colorOffset === undefined ? 255 : (bytes[byteOffset + colorOffset + 3] ?? 0);
  const opaque = opaqueRecord ? opaqueRecord(records, byteOffset) : alpha === 255;
  const transparent = transparentRecord ? transparentRecord(records, byteOffset) : alpha < 255;
  return (invalid ? INVALID_RECORD : 0) | (transparent ? TRANSPARENT_RECORD : 0) | (opaque ? OPAQUE_RECORD : 0);
}

function revalidateRecords(data: RevalidationData, options: RevalidationOptions, summary: RecordSummary): void {
  let changedRecords = 0;
  let rebuildSummary = false;
  const count = data.bytes.byteLength / options.stride;
  for (let index = 0; index < count; index += 1) {
    const flags = scanRevalidatedRecord(index, data, options);
    if (rebuildSummary) summary.setInitialFlags(index, flags);
    else if (summary.updateFlags(index, flags)) {
      changedRecords += 1;
      rebuildSummary = changedRecords > MAX_INCREMENTAL_SUMMARY_CHANGES;
    }
  }
  if (rebuildSummary) summary.finishInitialFlags();
}

// eslint-disable-next-line complexity, max-params, max-statements -- @hotpath This default-layout scan keeps all record state scalar and avoids per-record helper calls.
function revalidateDefaultRecords(
  bytes: Uint8Array,
  records: DataView,
  summary: RecordSummary,
  stride: number,
  positionOffset: number,
  positionWidth: number,
  colorOffset: number | undefined
): void {
  let changedRecords = 0;
  let rebuildSummary = false;
  const count = bytes.byteLength / stride;
  for (let index = 0; index < count; index += 1) {
    const byteOffset = index * stride;
    let invalid = false;
    for (let component = 0; component < positionWidth; component += 1) {
      if (!Number.isFinite(records.getFloat32(byteOffset + positionOffset + component * 4, true))) {
        invalid = true;
        break;
      }
    }
    const alpha = colorOffset === undefined ? 255 : (bytes[byteOffset + colorOffset + 3] ?? 0);
    const flags =
      (invalid ? INVALID_RECORD : 0) | (alpha < 255 ? TRANSPARENT_RECORD : 0) | (alpha === 255 ? OPAQUE_RECORD : 0);
    if (rebuildSummary) summary.setInitialFlags(index, flags);
    else if (summary.updateFlags(index, flags)) {
      changedRecords += 1;
      rebuildSummary = changedRecords > MAX_INCREMENTAL_SUMMARY_CHANGES;
    }
  }
  if (rebuildSummary) summary.finishInitialFlags();
}

// eslint-disable-next-line max-params -- @hotpath This commit scan keeps all record state scalar and avoids per-record helper calls.
function validateDefaultRecords(
  start: number,
  count: number,
  bytes: Uint8Array,
  records: DataView,
  summary: RecordSummary,
  stride: number,
  positionOffset: number,
  positionWidth: number,
  colorOffset: number | undefined
): void {
  const end = start + count;
  for (let index = start; index < end; index += 1) {
    const byteOffset = index * stride;
    let invalid = false;
    for (let component = 0; component < positionWidth; component += 1) {
      if (!Number.isFinite(records.getFloat32(byteOffset + positionOffset + component * 4, true))) {
        invalid = true;
        break;
      }
    }
    const alpha = colorOffset === undefined ? 255 : (bytes[byteOffset + colorOffset + 3] ?? 0);
    const flags =
      (invalid ? INVALID_RECORD : 0) | (alpha < 255 ? TRANSPARENT_RECORD : 0) | (alpha === 255 ? OPAQUE_RECORD : 0);
    summary.updateFlags(index, flags);
  }
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
  readonly opaqueRecord: ((records: DataView, byteOffset: number) => boolean) | undefined;
  readonly requireCountMultipleOf: number | undefined;
  readonly transparentRecord: ((records: DataView, byteOffset: number) => boolean) | undefined;
  readonly validateRecord: ((records: DataView, byteOffset: number) => boolean) | undefined;
  readonly #usePackedPositionColorScan: boolean;

  #dirtyRanges: UploadRange[] = [];
  #source: ArrayBufferView | null = null;
  #sourceCount: number | undefined;
  #status?: VertexStreamStatus;
  #structuralIssues = new Set<VertexStreamIssue>();
  #summary = new RecordSummary(3);
  #summaryShared = false;
  readonly #storage = new RecordStorage();
  #count: number | undefined;
  #version = 0;

  get #ownedBytes(): Uint8Array | null {
    return this.#storage.bytes;
  }

  get #ownedFloats(): Float32Array | null {
    return this.#usePackedPositionColorScan ? this.#storage.float32 : null;
  }

  get #ownedView(): DataView | null {
    return this.#storage.dataView;
  }

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
    return (this.#ownedBytes?.byteLength ?? 0) / this.layout.stride;
  }

  get effectiveCount(): number {
    const sourceCount = this.#sourceCount ?? this.capacity;
    return Math.min(this.#count ?? sourceCount, sourceCount);
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
    const bytes = this.#storage.captureSnapshot();
    if (!bytes) return null;
    this.#summaryShared = true;
    return {
      bytes,
      layoutName: this.layout.name,
      structuralIssues: new Set(this.#structuralIssues),
      summary: this.#summary
    };
  }

  #copyPreparedData(prepared: PreparedVertexSnapshot): void {
    this.#storage.adopt(prepared.bytes);
    this.#summary = prepared.summary;
    this.#summaryShared = true;
    for (const issue of prepared.structuralIssues) this.#structuralIssues.add(issue);
  }

  #replaceValidSource(source: ArrayBufferView, sourceCount: number | undefined): void {
    const reusedStorage = this.#copySourceBytes(getArrayBufferViewBytes(source));
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
    this.#replaceSharedSummary();
    return this.#storage.replace(sourceBytes);
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
    ownedBytes.set(getArrayBufferViewBytes(this.#source).subarray(offset, offset + size), offset);
    this.#validateCommittedRecords(start, resolvedCount);
    this.#queueDirtyRange(offset, size);
    this.#version += 1;
  }

  getIssues(): ReadonlySet<VertexStreamIssue> {
    return this.#getStatus().issues;
  }

  /** Validates a borrowed active prefix without creating an owned staging buffer. */
  sourceRecordsAreValid(source: Uint8Array, activeCount: number): boolean {
    if (!Number.isInteger(activeCount) || activeCount < 0 || source.byteLength % this.layout.stride !== 0) return false;
    if (activeCount > source.byteLength / this.layout.stride) return false;
    if (this.requireCountMultipleOf !== undefined && activeCount % this.requireCountMultipleOf !== 0) return false;
    const records = new DataView(source.buffer, source.byteOffset, activeCount * this.layout.stride);
    for (let index = 0; index < activeCount; index += 1) {
      if (this.#recordIsInvalidIn(records, index * this.layout.stride)) return false;
    }
    return true;
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

  #validateRecord(index: number, initial: boolean, data: OwnedRecordData): void {
    const flags = this.#scanRecordFlagsIn(index, data.bytes, data.records);
    if (initial) this.#summary.setInitialFlags(index, flags);
    else this.#summary.updateFlags(index, flags);
  }

  // eslint-disable-next-line complexity -- @hotpath The default scan selects a scalar fast path before the extensible fallback.
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
    const records = this.#ownedView;
    if (!bytes || !records) return;
    if (this.validateRecord === undefined && this.opaqueRecord === undefined && this.transparentRecord === undefined) {
      const position = this.layout.fields.position;
      validateDefaultRecords(
        start,
        count,
        bytes,
        records,
        this.#summary,
        this.layout.stride,
        position?.offset ?? 0,
        position ? (position.type === 'f32x3' ? 3 : position.type === 'f32x2' ? 2 : 1) : 0,
        this.layout.fields.color?.offset
      );
      return;
    }
    const data = { bytes, records };
    for (let index = start; index < start + count; index += 1) this.#validateRecord(index, false, data);
  }

  #scanRecordFlagsIn(index: number, bytes: Uint8Array, records: DataView): number {
    const byteOffset = index * this.layout.stride;
    return (
      (this.#recordIsInvalidIn(records, byteOffset) ? INVALID_RECORD : 0) |
      this.#renderFlags(bytes, records, byteOffset)
    );
  }

  #recordIsInvalidIn(records: DataView, byteOffset: number): boolean {
    const position = this.layout.fields.position;
    if (position) {
      const width = position.type === 'f32x3' ? 3 : position.type === 'f32x2' ? 2 : 1;
      for (let component = 0; component < width; component += 1) {
        if (!Number.isFinite(records.getFloat32(byteOffset + position.offset + component * 4, true))) return true;
      }
    }
    return this.validateRecord !== undefined && !this.validateRecord(records, byteOffset);
  }

  #renderFlags(bytes: Uint8Array, records: DataView, byteOffset: number): number {
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
    const bytes = this.#storage.writable();
    if (this.#summaryShared) {
      this.#summary = this.#summary.clone();
      this.#summaryShared = false;
    }
    return bytes;
  }

  #replaceSharedSummary(): void {
    if (this.#summaryShared) this.#summary = this.#summary.clone();
    this.#summaryShared = false;
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
    this.#storage.clear();
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
    const records = this.#ownedView;
    if (!bytes || !records) return;
    const count = bytes.byteLength / this.layout.stride;
    const data = { bytes, records };
    for (let index = 0; index < count; index += 1) this.#validateRecord(index, true, data);
    this.#summary.finishInitialFlags();
  }

  #initializePackedPositionColorRecords(bytes: Uint8Array, floats: Float32Array): number | null {
    let uniformFlags: number | undefined;
    let uniform = true;
    const count = bytes.byteLength / this.layout.stride;
    for (let index = 0; index < count; index += 1) {
      const flags = packedPositionColorFlags(bytes, floats, index);
      this.#summary.setInitialFlags(index, flags);
      if (uniformFlags === undefined) uniformFlags = flags;
      else if (uniformFlags !== flags) uniform = false;
    }
    return uniform ? (uniformFlags ?? 0) : null;
  }

  // eslint-disable-next-line complexity -- @hotpath The default scan selects a scalar fast path before the extensible fallback.
  #revalidateAllRecords(): void {
    const bytes = this.#ownedBytes;
    const records = this.#ownedView;
    if (!bytes || !records) return;
    const position = this.layout.fields.position;
    if (this.validateRecord === undefined && this.opaqueRecord === undefined && this.transparentRecord === undefined) {
      revalidateDefaultRecords(
        bytes,
        records,
        this.#summary,
        this.layout.stride,
        position?.offset ?? 0,
        position ? (position.type === 'f32x3' ? 3 : position.type === 'f32x2' ? 2 : 1) : 0,
        this.layout.fields.color?.offset
      );
      return;
    }
    revalidateRecords(
      { bytes, records },
      {
        colorOffset: this.layout.fields.color?.offset,
        opaqueRecord: this.opaqueRecord,
        position: {
          offset: position?.offset ?? 0,
          width: position ? (position.type === 'f32x3' ? 3 : position.type === 'f32x2' ? 2 : 1) : 0
        },
        stride: this.layout.stride,
        transparentRecord: this.transparentRecord,
        validateRecord: this.validateRecord
      },
      this.#summary
    );
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

function assertSource(source: ArrayBufferView | null): void {
  if (source !== null && !ArrayBuffer.isView(source)) {
    throw new TypeError('A streamed vertex source must be an ArrayBufferView or null.');
  }
}
