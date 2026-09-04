// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LAYOUT_STRIDE_MISMATCH, LAYOUT_VALUE_INVALID } from '../errors.js';
import { MARKER } from './layouts/built-ins.js';
import { MarkerBoundsIndex, type MarkerBounds } from './markers/bounds.js';
import { RecordSummary } from './record-summary.js';
import { mergeUploadRanges, type UploadRange } from './upload-ranges.js';

type MarkerInstanceIssue = typeof LAYOUT_STRIDE_MISMATCH | typeof LAYOUT_VALUE_INVALID;

export interface PreparedMarkerSnapshot {
  readonly bounds: MarkerBoundsIndex;
  readonly bytes: Uint8Array;
  readonly structuralIssues: ReadonlySet<MarkerInstanceIssue>;
  readonly summary: RecordSummary;
}

interface MarkerInstanceStatus {
  readonly issues: ReadonlySet<MarkerInstanceIssue>;
  readonly ready: boolean;
  readonly version: number;
}

interface MarkerAlphaStatus {
  readonly count: number;
  readonly opaqueFace: boolean;
  readonly opaqueOutline: boolean;
  readonly partialFace: boolean;
  readonly partialOutline: boolean;
  readonly version: number;
  readonly visibleOutline: boolean;
}

interface MarkerBoundsStatus {
  readonly bounds: MarkerBounds | null;
  readonly count: number;
  readonly version: number;
}

interface MarkerBoundsSource {
  readonly bytes: Uint8Array;
  readonly floats: Float32Array | null;
  readonly view: DataView | null;
}

const POSITION_OFFSET = 0;
const ORIENTATION_OFFSET = 12;
const SCALE_OFFSET = 28;
const FACE_ALPHA_OFFSET = 43;
const OUTLINE_ALPHA_OFFSET = 47;
const FLOATS_PER_RECORD = MARKER.stride / Float32Array.BYTES_PER_ELEMENT;
const PLATFORM_IS_LITTLE_ENDIAN = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
const MAX_INCREMENTAL_SUMMARY_CHANGES = 1_024;
const INVALID_RECORD = 1;
const PARTIAL_FACE_ALPHA = 2;
const PARTIAL_OUTLINE_ALPHA = 4;
const VISIBLE_OUTLINE_ALPHA = 8;
const OPAQUE_FACE_ALPHA = 16;
const OPAQUE_OUTLINE_ALPHA = 32;

export class MarkerInstanceBuffer {
  #alphaStatus?: MarkerAlphaStatus;
  #bounds = new MarkerBoundsIndex();
  #boundsShared = false;
  #boundsStatus?: MarkerBoundsStatus;
  #dirtyRanges: UploadRange[] = [];
  #ownedBytes: Uint8Array | null = null;
  #ownedBytesShared = false;
  #ownedFloats: Float32Array | null = null;
  #ownedView: DataView | null = null;
  #source: ArrayBufferView | null = null;
  #status?: MarkerInstanceStatus;
  #structuralIssues = new Set<MarkerInstanceIssue>();
  #summary = new RecordSummary(6);
  #summaryShared = false;
  #version = 0;

  get source(): ArrayBufferView | null {
    return this.#source;
  }

  get capacity(): number {
    return this.#ownedBytes?.byteLength ? this.#ownedBytes.byteLength / MARKER.stride : 0;
  }

  get ready(): boolean {
    return this.#getStatus().ready;
  }

  replace(source: ArrayBufferView | null): void {
    this.#source = source;
    this.#resetValidation();
    this.#version += 1;
    if (source === null) {
      this.#clearOwnedSource();
      return;
    }
    if (source.byteLength % MARKER.stride !== 0) {
      this.#rejectSourceStride();
      return;
    }
    this.#replaceValidSource(source);
  }

  /** Shares validated immutable bytes and indexes until this buffer changes. */
  replacePrepared(source: ArrayBufferView, prepared: PreparedMarkerSnapshot): void {
    if (source.byteLength !== prepared.bytes.byteLength) {
      this.replace(source);
      return;
    }
    this.#source = source;
    this.#resetValidation();
    this.#version += 1;
    this.#ownedBytes = prepared.bytes;
    this.#ownedBytesShared = true;
    this.#createOwnedRecordView();
    this.#bounds = prepared.bounds;
    this.#boundsShared = true;
    this.#summary = prepared.summary;
    this.#summaryShared = true;
    for (const issue of prepared.structuralIssues) this.#structuralIssues.add(issue);
    this.#queueDirtyRange(0, this.#ownedBytes.byteLength);
  }

  /** Captures immutable validated bytes for reuse by compatible layer buffers. */
  createPreparedSnapshot(): PreparedMarkerSnapshot | null {
    if (!this.#ownedBytes) return null;
    this.#ownedBytesShared = true;
    this.#boundsShared = true;
    this.#summaryShared = true;
    return {
      bounds: this.#bounds,
      bytes: this.#ownedBytes,
      structuralIssues: new Set(this.#structuralIssues),
      summary: this.#summary
    };
  }

  #replaceValidSource(source: ArrayBufferView): void {
    const sourceBytes = bytesOf(source);
    const reusedStorage = this.#copySourceBytes(sourceBytes);
    if (reusedStorage) {
      this.#revalidateAllRecords();
    } else {
      this.#summary.reset(this.capacity);
      this.#validateAllRecords();
    }
    this.#queueDirtyRange(0, this.#ownedBytes?.byteLength ?? 0);
  }

  #copySourceBytes(sourceBytes: Uint8Array): boolean {
    if (this.#ownedBytes?.byteLength === sourceBytes.byteLength) {
      if (this.#ownedBytesShared) {
        this.#ownedBytes = this.#ownedBytes.slice();
        this.#ownedBytesShared = false;
        this.#createOwnedRecordView();
      }
      this.#replaceSharedIndexes();
      this.#ownedBytes.set(sourceBytes);
      return true;
    }
    this.#replaceSharedIndexes();
    this.#ownedBytes = new Uint8Array(sourceBytes);
    this.#ownedBytesShared = false;
    this.#createOwnedRecordView();
    return false;
  }

  #clearOwnedSource(): void {
    this.#replaceSharedIndexes();
    this.#ownedBytes = null;
    this.#ownedBytesShared = false;
    this.#ownedFloats = null;
    this.#ownedView = null;
    this.#bounds.reset(0);
    this.#summary.reset(0);
  }

  #rejectSourceStride(): void {
    this.#clearOwnedSource();
    this.#structuralIssues.add(LAYOUT_STRIDE_MISMATCH);
  }

  #createOwnedRecordView(): void {
    const bytes = this.#ownedBytes;
    if (!bytes) return;
    this.#ownedFloats = null;
    this.#ownedView = null;
    if (PLATFORM_IS_LITTLE_ENDIAN) {
      this.#ownedFloats = new Float32Array(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength / Float32Array.BYTES_PER_ELEMENT
      );
      return;
    }
    this.#ownedView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  commit(start = 0, count?: number): void {
    if (this.#source === null) {
      return;
    }
    assertCommitRange(start, count, this.capacity);
    const resolvedCount = count ?? this.capacity - start;
    const ownedBytes = resolvedCount === 0 ? null : this.#ensureMutableState();
    if (!ownedBytes) return;
    const sourceBytes = bytesOf(this.#source);
    const offset = start * MARKER.stride;
    const size = resolvedCount * MARKER.stride;
    ownedBytes.set(sourceBytes.subarray(offset, offset + size), offset);
    this.#refreshCommittedRecords(ownedBytes, start, resolvedCount);
    this.#queueDirtyRange(offset, size);
    this.#version += 1;
  }

  #refreshCommittedRecords(ownedBytes: Uint8Array, start: number, count: number): void {
    if (start === 0 && count === this.capacity) {
      this.#revalidateAllRecords();
      return;
    }
    for (let index = start; index < start + count; index += 1) {
      this.#summary.updateFlags(index, this.#scanRecordFlags(index, ownedBytes));
    }
    this.#bounds.updateBlocks({
      ...this.#getBoundsSource(ownedBytes),
      count,
      recordCount: this.capacity,
      start
    });
  }

  getIssues(): ReadonlySet<MarkerInstanceIssue> {
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

  hasPartialFaceAlpha(count: number): boolean {
    return this.#getAlphaStatus(count).partialFace;
  }

  hasOpaqueFaceAlpha(count: number): boolean {
    return this.#getAlphaStatus(count).opaqueFace;
  }

  hasPartialOutlineAlpha(count: number): boolean {
    return this.#getAlphaStatus(count).partialOutline;
  }

  hasOpaqueOutlineAlpha(count: number): boolean {
    return this.#getAlphaStatus(count).opaqueOutline;
  }

  hasVisibleOutlineAlpha(count: number): boolean {
    return this.#getAlphaStatus(count).visibleOutline;
  }

  getBounds(count: number): MarkerBounds | null {
    const resolvedCount = Math.min(Math.max(0, count), this.capacity);
    if (this.#boundsStatus?.version === this.#version && this.#boundsStatus.count === resolvedCount) {
      return this.#boundsStatus.bounds;
    }
    const bytes = this.#ownedBytes;
    const bounds = bytes ? this.#bounds.getBounds(resolvedCount, this.#getBoundsSource(bytes)) : null;
    this.#boundsStatus = { bounds, count: resolvedCount, version: this.#version };
    return bounds;
  }

  #scanRecordFlags(index: number, bytes: Uint8Array, bounds?: MarkerBoundsIndex): number {
    const offset = index * MARKER.stride;
    const recordBounds = markerRecordIsVisible(bytes, offset) ? bounds : undefined;
    const invalid = this.#ownedFloats
      ? validateAndNormalizeFloatRecord(this.#ownedFloats, index * FLOATS_PER_RECORD, index, recordBounds)
      : validateAndNormalizeDataViewRecord(this.#ownedView, offset, index, recordBounds);
    return (invalid ? INVALID_RECORD : 0) | markerAlphaFlags(bytes, offset);
  }

  #validateAllRecords(): void {
    const bytes = this.#ownedBytes;
    if (!bytes) return;
    this.#bounds.reset(this.capacity);
    for (let index = 0; index < this.capacity; index += 1) {
      this.#summary.setInitialFlags(index, this.#scanRecordFlags(index, bytes, this.#bounds));
    }
    this.#summary.finishInitialFlags();
  }

  #revalidateAllRecords(): void {
    const bytes = this.#ownedBytes;
    if (!bytes) return;
    this.#bounds.reset(this.capacity);
    let changedRecords = 0;
    let index = 0;
    for (; index < this.capacity; index += 1) {
      if (this.#updateRecord(index, bytes)) {
        changedRecords += 1;
        if (changedRecords > MAX_INCREMENTAL_SUMMARY_CHANGES) {
          index += 1;
          break;
        }
      }
    }
    if (changedRecords <= MAX_INCREMENTAL_SUMMARY_CHANGES) return;
    this.#finishSummaryRebuild(index, bytes);
  }

  #updateRecord(index: number, bytes: Uint8Array): boolean {
    return this.#summary.updateFlags(index, this.#scanRecordFlags(index, bytes, this.#bounds));
  }

  #finishSummaryRebuild(index: number, bytes: Uint8Array): void {
    for (let cursor = index; cursor < this.capacity; cursor += 1) {
      this.#summary.setInitialFlags(cursor, this.#scanRecordFlags(cursor, bytes, this.#bounds));
    }
    this.#summary.finishInitialFlags();
  }

  #getStatus(): MarkerInstanceStatus {
    if (this.#status?.version === this.#version) return this.#status;
    const invalid = this.#summary.has(INVALID_RECORD, this.capacity);
    const issues = new Set<MarkerInstanceIssue>(this.#structuralIssues);
    if (invalid) issues.add(LAYOUT_VALUE_INVALID);
    this.#status = {
      issues,
      ready: this.#structuralIssues.size === 0 && !invalid,
      version: this.#version
    };
    return this.#status;
  }

  #getAlphaStatus(count: number): MarkerAlphaStatus {
    if (this.#alphaStatus?.version === this.#version && this.#alphaStatus.count === count) return this.#alphaStatus;
    this.#alphaStatus = {
      count,
      opaqueFace: this.#summary.has(OPAQUE_FACE_ALPHA, count),
      opaqueOutline: this.#summary.has(OPAQUE_OUTLINE_ALPHA, count),
      partialFace: this.#summary.has(PARTIAL_FACE_ALPHA, count),
      partialOutline: this.#summary.has(PARTIAL_OUTLINE_ALPHA, count),
      version: this.#version,
      visibleOutline: this.#summary.has(VISIBLE_OUTLINE_ALPHA, count)
    };
    return this.#alphaStatus;
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
    if (this.#boundsShared) {
      this.#bounds = this.#bounds.clone();
      this.#boundsShared = false;
    }
    if (this.#summaryShared) {
      this.#summary = this.#summary.clone();
      this.#summaryShared = false;
    }
    return this.#ownedBytes;
  }

  #replaceSharedIndexes(): void {
    if (this.#boundsShared) this.#bounds = new MarkerBoundsIndex();
    if (this.#summaryShared) this.#summary = new RecordSummary(6);
    this.#boundsShared = false;
    this.#summaryShared = false;
  }

  #getBoundsSource(bytes: Uint8Array): MarkerBoundsSource {
    return { bytes, floats: this.#ownedFloats, view: this.#ownedView };
  }

  #resetValidation(): void {
    this.#alphaStatus = undefined;
    this.#boundsStatus = undefined;
    this.#dirtyRanges = [];
    this.#status = undefined;
    this.#structuralIssues.clear();
  }
}

// eslint-disable-next-line max-params, max-statements -- Reuse scanned values while building full-source bounds.
function validateAndNormalizeFloatRecord(
  values: Float32Array,
  offset: number,
  index: number,
  bounds?: MarkerBoundsIndex
): boolean {
  const positionX = floatAt(values, offset);
  const positionY = floatAt(values, offset + 1);
  const positionZ = floatAt(values, offset + 2);
  const orientationX = floatAt(values, offset + 3);
  const orientationY = floatAt(values, offset + 4);
  const orientationZ = floatAt(values, offset + 5);
  const orientationW = floatAt(values, offset + 6);
  const scaleX = floatAt(values, offset + 7);
  const scaleY = floatAt(values, offset + 8);
  const scaleZ = floatAt(values, offset + 9);
  const fieldSum =
    positionX +
    positionY +
    positionZ +
    orientationX +
    orientationY +
    orientationZ +
    orientationW +
    scaleX +
    scaleY +
    scaleZ;
  const orientationLengthSquared =
    orientationX * orientationX +
    orientationY * orientationY +
    orientationZ * orientationZ +
    orientationW * orientationW;
  const invalid = !Number.isFinite(fieldSum) || orientationLengthSquared === 0;
  if (!invalid && orientationLengthSquared !== 1) {
    normalizeFloatQuaternion(values, offset + 3, orientationLengthSquared);
  }
  includeRecordBounds(
    bounds,
    index,
    positionX,
    positionY,
    positionZ,
    Math.max(Math.abs(scaleX), Math.abs(scaleY), Math.abs(scaleZ))
  );
  return invalid;
}

// eslint-disable-next-line max-params, max-statements -- Reuse scanned values while building full-source bounds.
function validateAndNormalizeDataViewRecord(
  values: DataView | null,
  offset: number,
  index: number,
  bounds?: MarkerBoundsIndex
): boolean {
  if (!values) return true;
  const positionX = values.getFloat32(offset + POSITION_OFFSET, true);
  const positionY = values.getFloat32(offset + POSITION_OFFSET + 4, true);
  const positionZ = values.getFloat32(offset + POSITION_OFFSET + 8, true);
  const orientationX = values.getFloat32(offset + ORIENTATION_OFFSET, true);
  const orientationY = values.getFloat32(offset + ORIENTATION_OFFSET + 4, true);
  const orientationZ = values.getFloat32(offset + ORIENTATION_OFFSET + 8, true);
  const orientationW = values.getFloat32(offset + ORIENTATION_OFFSET + 12, true);
  const scaleX = values.getFloat32(offset + SCALE_OFFSET, true);
  const scaleY = values.getFloat32(offset + SCALE_OFFSET + 4, true);
  const scaleZ = values.getFloat32(offset + SCALE_OFFSET + 8, true);
  const fieldSum =
    positionX +
    positionY +
    positionZ +
    orientationX +
    orientationY +
    orientationZ +
    orientationW +
    scaleX +
    scaleY +
    scaleZ;
  const orientationLengthSquared =
    orientationX * orientationX +
    orientationY * orientationY +
    orientationZ * orientationZ +
    orientationW * orientationW;
  const invalid = !Number.isFinite(fieldSum) || orientationLengthSquared === 0;
  if (!invalid && orientationLengthSquared !== 1) {
    normalizeDataViewQuaternion(values, offset + ORIENTATION_OFFSET, orientationLengthSquared);
  }
  includeRecordBounds(
    bounds,
    index,
    positionX,
    positionY,
    positionZ,
    Math.max(Math.abs(scaleX), Math.abs(scaleY), Math.abs(scaleZ))
  );
  return invalid;
}

function floatAt(values: Float32Array, index: number): number {
  return values[index] ?? Number.NaN;
}

// eslint-disable-next-line max-params -- Passing scalars avoids allocating one tuple per marker record.
function includeRecordBounds(
  bounds: MarkerBoundsIndex | undefined,
  index: number,
  positionX: number,
  positionY: number,
  positionZ: number,
  radius: number
): void {
  if (!bounds) return;
  if (Number.isFinite(positionX + positionY + positionZ + radius)) {
    bounds.includeRecordValues(index, positionX, positionY, positionZ, radius);
  }
}

function normalizeFloatQuaternion(values: Float32Array, offset: number, lengthSquared: number): void {
  const inverseLength = 1 / Math.sqrt(lengthSquared);
  values[offset] = (values[offset] ?? 0) * inverseLength;
  values[offset + 1] = (values[offset + 1] ?? 0) * inverseLength;
  values[offset + 2] = (values[offset + 2] ?? 0) * inverseLength;
  values[offset + 3] = (values[offset + 3] ?? 0) * inverseLength;
}

function normalizeDataViewQuaternion(values: DataView, offset: number, lengthSquared: number): void {
  const inverseLength = 1 / Math.sqrt(lengthSquared);
  values.setFloat32(offset, values.getFloat32(offset, true) * inverseLength, true);
  values.setFloat32(offset + 4, values.getFloat32(offset + 4, true) * inverseLength, true);
  values.setFloat32(offset + 8, values.getFloat32(offset + 8, true) * inverseLength, true);
  values.setFloat32(offset + 12, values.getFloat32(offset + 12, true) * inverseLength, true);
}

function markerAlphaFlags(bytes: Uint8Array, offset: number): number {
  const faceAlpha = bytes[offset + FACE_ALPHA_OFFSET] ?? 0;
  const outlineAlpha = bytes[offset + OUTLINE_ALPHA_OFFSET] ?? 0;
  return (
    (faceAlpha > 0 && faceAlpha < 255 ? PARTIAL_FACE_ALPHA : 0) |
    (outlineAlpha > 0 && outlineAlpha < 255 ? PARTIAL_OUTLINE_ALPHA : 0) |
    (outlineAlpha > 0 ? VISIBLE_OUTLINE_ALPHA : 0) |
    (faceAlpha === 255 ? OPAQUE_FACE_ALPHA : 0) |
    (outlineAlpha === 255 ? OPAQUE_OUTLINE_ALPHA : 0)
  );
}

function markerRecordIsVisible(bytes: Uint8Array, offset: number): boolean {
  return (bytes[offset + FACE_ALPHA_OFFSET] ?? 0) > 0 || (bytes[offset + OUTLINE_ALPHA_OFFSET] ?? 0) > 0;
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
