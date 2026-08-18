// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LAYOUT_STRIDE_MISMATCH, LAYOUT_VALUE_INVALID } from '../errors.js';
import { MARKER } from './layouts/built-ins.js';

export interface UploadRange {
  readonly offset: number;
  readonly size: number;
}

type InstanceIssue = typeof LAYOUT_STRIDE_MISMATCH | typeof LAYOUT_VALUE_INVALID;

const POSITION_OFFSET = 0;
const ORIENTATION_OFFSET = 12;
const SCALE_OFFSET = 28;

export class MarkerInstanceBuffer {
  #dirtyRanges: UploadRange[] = [];
  #issuesByRecord = new Map<number, Set<InstanceIssue>>();
  #ownedBytes: Uint8Array | null = null;
  #source: ArrayBufferView | null = null;
  #structuralIssues = new Set<InstanceIssue>();

  get source(): ArrayBufferView | null {
    return this.#source;
  }

  get capacity(): number {
    return this.#ownedBytes?.byteLength ? this.#ownedBytes.byteLength / MARKER.stride : 0;
  }

  get ready(): boolean {
    return this.#structuralIssues.size === 0 && this.#issuesByRecord.size === 0;
  }

  replace(source: ArrayBufferView | null): void {
    this.#source = source;
    this.#resetValidation();
    if (source === null) {
      this.#ownedBytes = null;
      return;
    }
    if (source.byteLength % MARKER.stride !== 0) {
      this.#ownedBytes = null;
      this.#structuralIssues.add(LAYOUT_STRIDE_MISMATCH);
      return;
    }

    const sourceBytes = bytesOf(source);
    this.#ownedBytes = new Uint8Array(sourceBytes);
    for (let index = 0; index < this.capacity; index += 1) {
      this.#validateAndNormalizeRecord(index);
    }
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
      this.#validateAndNormalizeRecord(index);
    }
    this.#queueDirtyRange(offset, size);
  }

  getIssues(): ReadonlySet<InstanceIssue> {
    const issues = new Set(this.#structuralIssues);
    for (const recordIssues of this.#issuesByRecord.values()) {
      recordIssues.forEach(issue => issues.add(issue));
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

  #validateAndNormalizeRecord(index: number): void {
    if (!this.#ownedBytes) {
      return;
    }
    const record = new DataView(
      this.#ownedBytes.buffer,
      this.#ownedBytes.byteOffset + index * MARKER.stride,
      MARKER.stride
    );
    const issues = new Set<InstanceIssue>();
    const values = [
      ...readFloatTuple(record, POSITION_OFFSET, 3),
      ...readFloatTuple(record, ORIENTATION_OFFSET, 4),
      ...readFloatTuple(record, SCALE_OFFSET, 3)
    ];
    const orientation = values.slice(3, 7);
    if (values.some(value => !Number.isFinite(value)) || Math.hypot(...orientation) === 0) {
      issues.add(LAYOUT_VALUE_INVALID);
    } else {
      const orientationLength = Math.hypot(...orientation);
      orientation.forEach((value, component) =>
        record.setFloat32(ORIENTATION_OFFSET + component * 4, value / orientationLength, true)
      );
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

function readFloatTuple(record: DataView, offset: number, length: number): number[] {
  return Array.from({ length }, (_, index) => record.getFloat32(offset + index * 4, true));
}

function assertCommitRange(start: number, count: number | undefined, capacity: number): void {
  if (!Number.isInteger(start) || start < 0 || start > capacity) {
    throw new RangeError('Commit start must be a nonnegative integer within capacity.');
  }
  if (count !== undefined && (!Number.isInteger(count) || count < 0 || start + count > capacity)) {
    throw new RangeError('Commit count must be a nonnegative integer within capacity.');
  }
}
