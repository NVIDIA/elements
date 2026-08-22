// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LAYOUT_STRIDE_MISMATCH, LAYOUT_VALUE_INVALID } from '../errors.js';
import { MARKER } from './layouts/built-ins.js';
import { RecordSummary } from './record-summary.js';

export interface UploadRange {
  readonly offset: number;
  readonly size: number;
}

type InstanceIssue = typeof LAYOUT_STRIDE_MISMATCH | typeof LAYOUT_VALUE_INVALID;

export interface MarkerInstancePerformanceSnapshot {
  readonly recordScans: number;
  readonly recordViewAllocations: number;
  readonly summaryPrefixQueries: number;
  readonly summaryRemainderScans: number;
  readonly summaryStorageAllocations: number;
}

interface MarkerInstanceStatus {
  readonly issues: ReadonlySet<InstanceIssue>;
  readonly ready: boolean;
  readonly version: number;
}

interface MarkerAlphaStatus {
  readonly count: number;
  readonly partialFace: boolean;
  readonly partialOutline: boolean;
  readonly version: number;
  readonly visibleOutline: boolean;
}

const POSITION_OFFSET = 0;
const ORIENTATION_OFFSET = 12;
const SCALE_OFFSET = 28;
const FACE_ALPHA_OFFSET = 43;
const OUTLINE_ALPHA_OFFSET = 47;
const INVALID_RECORD = 1;
const PARTIAL_FACE_ALPHA = 2;
const PARTIAL_OUTLINE_ALPHA = 4;
const VISIBLE_OUTLINE_ALPHA = 8;

export class MarkerInstanceBuffer {
  #alphaStatus?: MarkerAlphaStatus;
  #dirtyRanges: UploadRange[] = [];
  #ownedBytes: Uint8Array | null = null;
  #ownedView: DataView | null = null;
  #recordScans = 0;
  #recordViewAllocations = 0;
  #source: ArrayBufferView | null = null;
  #status?: MarkerInstanceStatus;
  #structuralIssues = new Set<InstanceIssue>();
  #summary = new RecordSummary(4);
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

  // eslint-disable-next-line max-statements -- Replacement resets owned storage, validation, and cached summaries together.
  replace(source: ArrayBufferView | null): void {
    this.#source = source;
    this.#resetValidation();
    this.#version += 1;
    if (source === null) {
      this.#ownedBytes = null;
      this.#summary.reset(0);
      return;
    }
    if (source.byteLength % MARKER.stride !== 0) {
      this.#ownedBytes = null;
      this.#summary.reset(0);
      this.#structuralIssues.add(LAYOUT_STRIDE_MISMATCH);
      return;
    }

    const sourceBytes = bytesOf(source);
    this.#ownedBytes = new Uint8Array(sourceBytes);
    this.#ownedView = new DataView(this.#ownedBytes.buffer, this.#ownedBytes.byteOffset, this.#ownedBytes.byteLength);
    this.#recordViewAllocations += 1;
    this.#summary.reset(this.capacity);
    for (let index = 0; index < this.capacity; index += 1) {
      this.#validateAndNormalizeRecord(index, true);
    }
    this.#summary.finishInitialFlags();
    this.#queueDirtyRange(0, this.#ownedBytes.byteLength);
  }

  commit(start = 0, count?: number): void {
    if (this.#source === null) {
      return;
    }
    assertCommitRange(start, count, this.capacity);
    const resolvedCount = count ?? this.capacity - start;
    if (!this.#ownedBytes || resolvedCount === 0) {
      return;
    }
    const sourceBytes = bytesOf(this.#source);
    const offset = start * MARKER.stride;
    const size = resolvedCount * MARKER.stride;
    this.#ownedBytes.set(sourceBytes.subarray(offset, offset + size), offset);
    for (let index = start; index < start + resolvedCount; index += 1) {
      this.#validateAndNormalizeRecord(index, false);
    }
    this.#queueDirtyRange(offset, size);
    this.#version += 1;
  }

  getIssues(): ReadonlySet<InstanceIssue> {
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

  hasPartialOutlineAlpha(count: number): boolean {
    return this.#getAlphaStatus(count).partialOutline;
  }

  hasVisibleOutlineAlpha(count: number): boolean {
    return this.#getAlphaStatus(count).visibleOutline;
  }

  getPerformanceSnapshot(): MarkerInstancePerformanceSnapshot {
    const summary = this.#summary.getSnapshot();
    return {
      recordScans: this.#recordScans,
      recordViewAllocations: this.#recordViewAllocations,
      summaryPrefixQueries: summary.prefixQueries,
      summaryRemainderScans: summary.remainderScans,
      summaryStorageAllocations: summary.storageAllocations
    };
  }

  // eslint-disable-next-line complexity, max-statements -- Allocation-free validation reads and normalizes each marker field directly.
  #validateAndNormalizeRecord(index: number, initial: boolean): void {
    if (!this.#ownedBytes || !this.#ownedView) {
      return;
    }
    this.#recordScans += 1;
    const offset = index * MARKER.stride;
    const positionX = this.#ownedView.getFloat32(offset + POSITION_OFFSET, true);
    const positionY = this.#ownedView.getFloat32(offset + POSITION_OFFSET + 4, true);
    const positionZ = this.#ownedView.getFloat32(offset + POSITION_OFFSET + 8, true);
    const orientationX = this.#ownedView.getFloat32(offset + ORIENTATION_OFFSET, true);
    const orientationY = this.#ownedView.getFloat32(offset + ORIENTATION_OFFSET + 4, true);
    const orientationZ = this.#ownedView.getFloat32(offset + ORIENTATION_OFFSET + 8, true);
    const orientationW = this.#ownedView.getFloat32(offset + ORIENTATION_OFFSET + 12, true);
    const scaleX = this.#ownedView.getFloat32(offset + SCALE_OFFSET, true);
    const scaleY = this.#ownedView.getFloat32(offset + SCALE_OFFSET + 4, true);
    const scaleZ = this.#ownedView.getFloat32(offset + SCALE_OFFSET + 8, true);
    const orientationLength = Math.hypot(orientationX, orientationY, orientationZ, orientationW);
    const invalid =
      !Number.isFinite(positionX) ||
      !Number.isFinite(positionY) ||
      !Number.isFinite(positionZ) ||
      !Number.isFinite(orientationX) ||
      !Number.isFinite(orientationY) ||
      !Number.isFinite(orientationZ) ||
      !Number.isFinite(orientationW) ||
      !Number.isFinite(scaleX) ||
      !Number.isFinite(scaleY) ||
      !Number.isFinite(scaleZ) ||
      orientationLength === 0;
    if (!invalid) {
      this.#ownedView.setFloat32(offset + ORIENTATION_OFFSET, orientationX / orientationLength, true);
      this.#ownedView.setFloat32(offset + ORIENTATION_OFFSET + 4, orientationY / orientationLength, true);
      this.#ownedView.setFloat32(offset + ORIENTATION_OFFSET + 8, orientationZ / orientationLength, true);
      this.#ownedView.setFloat32(offset + ORIENTATION_OFFSET + 12, orientationW / orientationLength, true);
    }
    const faceAlpha = this.#ownedBytes[offset + FACE_ALPHA_OFFSET] ?? 0;
    const outlineAlpha = this.#ownedBytes[offset + OUTLINE_ALPHA_OFFSET] ?? 0;
    const flags =
      (invalid ? INVALID_RECORD : 0) |
      (faceAlpha > 0 && faceAlpha < 255 ? PARTIAL_FACE_ALPHA : 0) |
      (outlineAlpha > 0 && outlineAlpha < 255 ? PARTIAL_OUTLINE_ALPHA : 0) |
      (outlineAlpha > 0 ? VISIBLE_OUTLINE_ALPHA : 0);
    if (initial) this.#summary.setInitialFlags(index, flags);
    else this.#summary.updateFlags(index, flags);
  }

  #getStatus(): MarkerInstanceStatus {
    if (this.#status?.version === this.#version) return this.#status;
    const invalid = this.#summary.has(INVALID_RECORD, this.capacity);
    const issues = new Set<InstanceIssue>(this.#structuralIssues);
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

  #resetValidation(): void {
    this.#alphaStatus = undefined;
    this.#dirtyRanges = [];
    this.#ownedView = null;
    this.#status = undefined;
    this.#structuralIssues.clear();
  }
}

export function mergeUploadRanges(ranges: readonly UploadRange[]): UploadRange[] {
  const sorted = [...ranges].sort((left, right) => left.offset - right.offset);
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
