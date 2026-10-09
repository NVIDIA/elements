// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  VersionedRangeJournal,
  hasVersionedRangeCoverage,
  mergeVersionedRangeSnapshots
} from './versioned-range-journal.js';

describe(VersionedRangeJournal.name, () => {
  it('unions continuous publications and supports independent consumers with conservative ranges', () => {
    const journal = new VersionedRangeJournal();
    journal.record({ baseVersion: 10, version: 11, ranges: [{ offset: 8, size: 8 }] });
    journal.record({
      baseVersion: 11,
      version: 12,
      ranges: [
        { offset: 16, size: 8 },
        { offset: 40, size: 8 }
      ]
    });
    const ranges = [
      { offset: 8, size: 16 },
      { offset: 40, size: 8 }
    ];
    expect(journal.snapshot()).toEqual({ baseVersion: 10, version: 12, ranges });
    for (const version of [10, 11]) expect(journal.changesSince(version)).toEqual({ kind: 'ranges', ranges });
    expect(journal.changesSince(12)).toEqual({ kind: 'ranges', ranges: [] });
    for (const version of [0, 9, 13]) expect(journal.changesSince(version)).toEqual({ kind: 'unknown' });
  });

  it('preserves empty generations and distinguishes no changes from missing history', () => {
    const journal = new VersionedRangeJournal();
    expect(journal.changesSince(0)).toEqual({ kind: 'unknown' });
    journal.record({ baseVersion: 0, version: 1, ranges: [] });
    journal.record({ baseVersion: 1, version: 2, ranges: [] });
    expect(journal.changesSince(0)).toEqual({ kind: 'ranges', ranges: [] });
    journal.record({ baseVersion: 2, version: 3, ranges: [{ offset: 0, size: 4 }] });
    expect(journal.snapshot()?.baseVersion).toBe(0);
  });

  it('starts a new coverage window after a gap and merges overlapping windows', () => {
    const journal = new VersionedRangeJournal();
    journal.record({ baseVersion: 0, version: 2, ranges: [{ offset: 0, size: 4 }] });
    journal.record({ baseVersion: 1, version: 3, ranges: [{ offset: 4, size: 4 }] });
    expect(journal.snapshot()).toEqual({ baseVersion: 0, version: 3, ranges: [{ offset: 0, size: 8 }] });
    journal.record({ baseVersion: 4, version: 5, ranges: [{ offset: 20, size: 4 }] });
    expect(journal.snapshot()).toEqual({ baseVersion: 4, version: 5, ranges: [{ offset: 20, size: 4 }] });
    expect(journal.changesSince(3)).toEqual({ kind: 'unknown' });
  });

  it('owns input ranges and publishes stable immutable snapshots across records and draining', () => {
    const journal = new VersionedRangeJournal();
    const ranges = [{ offset: 4, size: 8 }];
    journal.record({ baseVersion: 0, version: 1, ranges });
    ranges[0]!.offset = 100;
    const snapshot = journal.snapshot()!;
    expect(journal.snapshot()).toBe(snapshot);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.ranges)).toBe(true);
    expect(Object.isFrozen(snapshot.ranges[0])).toBe(true);
    expect(Reflect.set(snapshot.ranges[0]!, 'size', 100)).toBe(false);
    journal.record({ baseVersion: 1, version: 2, ranges: [{ offset: 12, size: 4 }] });
    expect(snapshot.ranges).toEqual([{ offset: 4, size: 8 }]);
    expect(journal.drain()).toEqual({ baseVersion: 0, version: 2, ranges: [{ offset: 4, size: 12 }] });
    expect(journal.snapshot()).toBeUndefined();
    expect(journal.drain()).toBeUndefined();
    expect(journal.changesSince(2)).toEqual({ kind: 'unknown' });
    journal.record({ baseVersion: 9, version: 10, ranges: [] });
    journal.clear();
    expect(journal.snapshot()).toBeUndefined();
  });

  it('compacts repeated edits while preserving disjoint ranges and earlier snapshots', () => {
    const journal = new VersionedRangeJournal();
    journal.record({ baseVersion: 0, version: 1, ranges: [{ offset: 0, size: 4 }] });
    const before = journal.snapshot();
    for (let version = 2; version <= 1_025; version += 1) {
      journal.record({ baseVersion: version - 1, version, ranges: [{ offset: (version % 4) * 8, size: 4 }] });
    }
    expect(journal.snapshot()).toEqual({
      baseVersion: 0,
      version: 1_025,
      ranges: [0, 8, 16, 24].map(offset => ({ offset, size: 4 }))
    });
    expect(before?.ranges).toEqual([{ offset: 0, size: 4 }]);
  });

  it('rejects invalid records atomically, including stale versions and unsafe endpoints', () => {
    const journal = new VersionedRangeJournal();
    journal.record({ baseVersion: 0, version: 2, ranges: [{ offset: 0, size: 4 }] });
    const before = journal.snapshot();
    for (const change of [
      { baseVersion: 2, version: 1, ranges: [] },
      { baseVersion: 0, version: 1, ranges: [] },
      { baseVersion: 2, version: 2, ranges: [{ offset: 0, size: 1 }] },
      {
        baseVersion: 2,
        version: 3,
        ranges: [
          { offset: 4, size: 4 },
          { offset: -1, size: 4 }
        ]
      },
      { baseVersion: 4, version: 5, ranges: [{ offset: Number.MAX_SAFE_INTEGER, size: 1 }] }
    ]) {
      expect(() => journal.record(change)).toThrow(RangeError);
      expect(journal.snapshot()).toBe(before);
    }
  });

  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid version %s', version => {
    const journal = new VersionedRangeJournal();
    expect(() => journal.record({ baseVersion: version, version: 3, ranges: [] })).toThrow(RangeError);
    expect(() => journal.record({ baseVersion: 0, version, ranges: [] })).toThrow(RangeError);
    expect(() => journal.changesSince(version)).toThrow(RangeError);
    expect(journal.snapshot()).toBeUndefined();
  });

  it('supports the largest safe version and byte endpoint', () => {
    const maximum = Number.MAX_SAFE_INTEGER;
    const journal = new VersionedRangeJournal();
    journal.record({ baseVersion: maximum - 1, version: maximum, ranges: [{ offset: maximum - 1, size: 1 }] });
    expect(journal.changesSince(maximum - 1)).toEqual({ kind: 'ranges', ranges: [{ offset: maximum - 1, size: 1 }] });
    expect(journal.changesSince(maximum)).toEqual({ kind: 'ranges', ranges: [] });
  });
});

describe(mergeVersionedRangeSnapshots.name, () => {
  const previous = { baseVersion: 0, version: 2, ranges: [{ offset: 0, size: 4 }] };
  const current = { baseVersion: 2, version: 3, ranges: [{ offset: 4, size: 4 }] };

  it('combines continuous work without changing inputs and owns the resulting ranges', () => {
    const merged = mergeVersionedRangeSnapshots(previous, current, 3);
    expect(merged).toEqual({ baseVersion: 0, version: 3, ranges: [{ offset: 0, size: 8 }] });
    expect(previous.ranges).toEqual([{ offset: 0, size: 4 }]);
    expect(current.ranges).toEqual([{ offset: 4, size: 4 }]);
    expect(merged?.ranges[0]).not.toBe(previous.ranges[0]);
    expect(Object.isFrozen(merged)).toBe(true);
  });

  it('keeps unchanged work, drops incompatible history, and reports missing generations', () => {
    expect(mergeVersionedRangeSnapshots(previous, undefined, 2)).toEqual(previous);
    expect(mergeVersionedRangeSnapshots(previous, undefined, 3)).toBeUndefined();
    expect(mergeVersionedRangeSnapshots(undefined, current, 3)).toEqual(current);
    const gap = { ...current, baseVersion: 4, version: 5 };
    expect(mergeVersionedRangeSnapshots(previous, gap, 5)).toEqual(gap);
    expect(mergeVersionedRangeSnapshots(gap, current, 3)).toEqual(current);
    expect(mergeVersionedRangeSnapshots(previous, current, 4)).toBeUndefined();
  });

  it('merges sorted interleaved intervals and normalizes unsorted, empty, and overlapping inputs', () => {
    const left = {
      baseVersion: 0,
      version: 1,
      ranges: [
        { offset: 4, size: 4 },
        { offset: 20, size: 4 }
      ]
    };
    const right = {
      baseVersion: 1,
      version: 2,
      ranges: [
        { offset: 0, size: 6 },
        { offset: 12, size: 8 },
        { offset: 28, size: 4 }
      ]
    };
    const expected = {
      baseVersion: 0,
      version: 2,
      ranges: [
        { offset: 0, size: 8 },
        { offset: 12, size: 12 },
        { offset: 28, size: 4 }
      ]
    };
    expect(mergeVersionedRangeSnapshots(left, right, 2)).toEqual(expected);
    expect(
      mergeVersionedRangeSnapshots(
        { ...left, ranges: left.ranges.slice().reverse() },
        { ...right, ranges: [...right.ranges.slice().reverse(), { offset: 14, size: 2 }, { offset: 0, size: 0 }] },
        2
      )
    ).toEqual(expected);
    expect(() =>
      mergeVersionedRangeSnapshots(left, { ...right, ranges: [{ offset: Number.MAX_SAFE_INTEGER, size: 1 }] }, 2)
    ).toThrow(RangeError);
  });
});

describe(hasVersionedRangeCoverage.name, () => {
  it('requires a valid window containing the consumer version, including both endpoints', () => {
    for (const version of [2, 3, 4]) expect(hasVersionedRangeCoverage(2, 4, version)).toBe(true);
    for (const version of [0, 1, 5, NaN, 2.5, undefined]) expect(hasVersionedRangeCoverage(2, 4, version)).toBe(false);
    expect(hasVersionedRangeCoverage(undefined, 4, 2)).toBe(false);
    expect(hasVersionedRangeCoverage(2, undefined, 2)).toBe(false);
    expect(hasVersionedRangeCoverage(4, 2, 3)).toBe(false);
    expect(hasVersionedRangeCoverage(-1, 4, 2)).toBe(false);
  });
});
