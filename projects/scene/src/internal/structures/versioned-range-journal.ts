// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { RangeSet } from './range-set.js';
import { assertRangeInterval, type RangeInterval } from './range-interval.js';

export interface VersionedRangeSnapshot {
  readonly baseVersion: number;
  readonly version: number;
  readonly ranges: readonly Readonly<RangeInterval>[];
}

export type VersionedRangeChanges =
  | { readonly kind: 'ranges'; readonly ranges: readonly Readonly<RangeInterval>[] }
  | { readonly kind: 'unknown' };

const UNKNOWN_CHANGES: VersionedRangeChanges = Object.freeze({ kind: 'unknown' });
const NO_CHANGES: VersionedRangeChanges = Object.freeze({ kind: 'ranges', ranges: Object.freeze([]) });
const COMPACT_AFTER_RANGES = 256;

/** Stores one covered version window and a conservative byte-range union. */
export class VersionedRangeJournal {
  readonly #ranges = new RangeSet();
  #baseVersion?: number;
  #version?: number;
  #snapshot?: VersionedRangeSnapshot;
  #unmergedRanges = 0;

  /** Extends continuous history or starts a new window after a gap. Invalid records leave the journal unchanged. */
  record(change: VersionedRangeSnapshot): void {
    validateWindow(change);
    if (this.#version !== undefined && change.version < this.#version) {
      throw new RangeError('Range journal versions must not move backwards.');
    }
    const incoming = change.ranges.map(({ offset, size }) => {
      assertRangeInterval(offset, size);
      return { offset, size };
    });
    if (!hasVersionedRangeCoverage(change.baseVersion, change.version, this.#version)) {
      this.clear();
      this.#baseVersion = change.baseVersion;
    } else {
      this.#baseVersion = Math.min(this.#baseVersion!, change.baseVersion);
    }
    this.#ranges.addAll(incoming);
    this.#version = change.version;
    this.#snapshot = undefined;
    this.#unmergedRanges += change.ranges.length;
    if (this.#unmergedRanges >= COMPACT_AFTER_RANGES) this.#compact();
  }

  /** Returns a stable immutable snapshot until the next record or clear. */
  snapshot(): VersionedRangeSnapshot | undefined {
    if (this.#baseVersion === undefined || this.#version === undefined) return undefined;
    return (this.#snapshot ??= freezeSnapshot(this.#baseVersion, this.#version, this.#ranges.snapshot()));
  }

  /** Returns known conservative changes, or an explicit missing-history result. */
  changesSince(version: number): VersionedRangeChanges {
    validateVersion(version);
    if (!hasVersionedRangeCoverage(this.#baseVersion, this.#version, version)) return UNKNOWN_CHANGES;
    if (version === this.#version) return NO_CHANGES;
    return { kind: 'ranges', ranges: this.snapshot()!.ranges };
  }

  drain(): VersionedRangeSnapshot | undefined {
    const snapshot = this.snapshot();
    this.clear();
    return snapshot;
  }

  clear(): void {
    this.#ranges.clear();
    this.#baseVersion = undefined;
    this.#version = undefined;
    this.#snapshot = undefined;
    this.#unmergedRanges = 0;
  }

  #compact(): void {
    const ranges = this.#ranges.drain();
    this.#ranges.addAll(ranges);
    this.#unmergedRanges = 0;
  }
}

/** Tests whether this window covers every generation after a consumer's version. */
export function hasVersionedRangeCoverage(
  baseVersion: number | undefined,
  version: number | undefined,
  consumerVersion: number | undefined
): boolean {
  return (
    baseVersion !== undefined &&
    version !== undefined &&
    consumerVersion !== undefined &&
    Number.isSafeInteger(baseVersion) &&
    Number.isSafeInteger(version) &&
    Number.isSafeInteger(consumerVersion) &&
    baseVersion >= 0 &&
    baseVersion <= consumerVersion &&
    consumerVersion <= version
  );
}

/** Combines cancelled and current work only when their version windows overlap or meet. */
export function mergeVersionedRangeSnapshots(
  previous: VersionedRangeSnapshot | undefined,
  current: VersionedRangeSnapshot | undefined,
  version: number
): VersionedRangeSnapshot | undefined {
  validateVersion(version);
  const latest = current ?? (previous?.version === version ? previous : undefined);
  if (!latest || latest.version !== version) return undefined;
  validateWindow(latest);
  const continuous =
    previous && current && hasVersionedRangeCoverage(current.baseVersion, current.version, previous.version);
  let previousRanges: readonly Readonly<RangeInterval>[] = [];
  if (continuous) {
    validateWindow(previous);
    previousRanges = previous.ranges;
  }
  const ranges = mergeRanges(previousRanges, latest.ranges);
  const baseVersion = continuous ? Math.min(previous.baseVersion, latest.baseVersion) : latest.baseVersion;
  return freezeSnapshot(baseVersion, version, ranges);
}

function mergeRanges(
  left: readonly Readonly<RangeInterval>[],
  right: readonly Readonly<RangeInterval>[]
): RangeInterval[] {
  if (!isNormalized(left) || !isNormalized(right)) {
    const ranges = new RangeSet();
    ranges.addAll(left);
    ranges.addAll(right);
    return ranges.drain();
  }
  const merged: RangeInterval[] = [];
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < left.length || rightIndex < right.length) {
    const range =
      rightIndex >= right.length || (leftIndex < left.length && left[leftIndex]!.offset <= right[rightIndex]!.offset)
        ? left[leftIndex++]!
        : right[rightIndex++]!;
    appendRange(merged, range);
  }
  return merged;
}

function isNormalized(ranges: readonly Readonly<RangeInterval>[]): boolean {
  let previousEnd = -1;
  for (const { offset, size } of ranges) {
    assertRangeInterval(offset, size);
    if (size === 0 || offset <= previousEnd) return false;
    previousEnd = offset + size;
  }
  return true;
}

function appendRange(ranges: RangeInterval[], range: Readonly<RangeInterval>): void {
  const previous = ranges[ranges.length - 1];
  if (previous && range.offset <= previous.offset + previous.size) {
    previous.size = Math.max(previous.offset + previous.size, range.offset + range.size) - previous.offset;
  } else {
    ranges.push({ offset: range.offset, size: range.size });
  }
}

function freezeSnapshot(baseVersion: number, version: number, ranges: RangeInterval[]): VersionedRangeSnapshot {
  for (const range of ranges) Object.freeze(range);
  return Object.freeze({ baseVersion, version, ranges: Object.freeze(ranges) });
}

function validateWindow(window: VersionedRangeSnapshot): void {
  validateVersion(window.baseVersion);
  validateVersion(window.version);
  if (
    window.version < window.baseVersion ||
    (window.version === window.baseVersion && window.ranges.some(range => range.size > 0))
  ) {
    throw new RangeError('Changed ranges require a forward version window.');
  }
}

function validateVersion(version: number): void {
  if (!Number.isSafeInteger(version) || version < 0)
    throw new RangeError('Range journal versions must be nonnegative safe integers.');
}
