// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { ByteTransferIndex, type ByteTransferSpan } from './byte-transfer-index.js';

describe(ByteTransferIndex.name, () => {
  it('clips half-open intersections, translates offsets, and keeps duplicated source bytes', () => {
    const index = new ByteTransferIndex([
      { sourceOffset: 8, target: 0, targetOffset: 0, size: 8 },
      { sourceOffset: 12, target: 1, targetOffset: 4, size: 8 },
      { sourceOffset: 24, target: 2, targetOffset: 0, size: 4 }
    ]);
    expect(intersections(index, 10, 8)).toEqual([
      { sourceOffset: 10, target: 0, targetOffset: 2, size: 6 },
      { sourceOffset: 12, target: 1, targetOffset: 4, size: 6 }
    ]);
    expect(intersections(index, 20, 4)).toEqual([]);
    expect(intersections(index, 28, 1)).toEqual([]);
    expect(intersections(index, 8, 0)).toEqual([]);
  });

  it.each([4, 64])('matches byte-by-byte transfers for %i ordered and reordered overlapping spans', count => {
    const ordered = Array.from({ length: count }, (_, index) => ({
      sourceOffset: index === 0 ? 0 : index * 3,
      target: index % 4,
      targetOffset: (index * 7) % 64,
      size: index === 0 ? 250 : (index % 5) + 1
    }));
    const reordered = [...ordered.slice(-1), ...ordered.slice(1, -1).reverse(), ordered[0]!];
    for (const spans of [ordered, reordered]) {
      const index = new ByteTransferIndex(spans);
      for (let offset = 0; offset <= 260; offset += 7) {
        for (const size of [0, 1, 8, 33, 260]) verifyByteTransfers(index, spans, { offset, size });
      }
    }
  });

  it('owns input spans and handles empty spans and the largest safe endpoint', () => {
    const spans = [{ sourceOffset: 2, target: 0, targetOffset: 8, size: 4 }];
    const index = new ByteTransferIndex(spans);
    spans[0]!.sourceOffset = 100;
    spans.length = 0;
    expect(intersections(index, 3, 1)).toEqual([{ sourceOffset: 3, target: 0, targetOffset: 9, size: 1 }]);
    const empty = new ByteTransferIndex([{ sourceOffset: 0, target: 0, targetOffset: 0, size: 0 }]);
    expect(empty.size).toBe(0);
    expect(intersections(empty, 0, 100)).toEqual([]);
    const maximum = Number.MAX_SAFE_INTEGER;
    const last = new ByteTransferIndex([{ sourceOffset: maximum - 1, target: 0, targetOffset: maximum - 1, size: 1 }]);
    expect(intersections(last, maximum - 1, 1)).toEqual([
      { sourceOffset: maximum - 1, target: 0, targetOffset: maximum - 1, size: 1 }
    ]);
  });

  it('keeps equal source starts in their input order during indexed queries', () => {
    const spans = Array.from({ length: 16 }, (_, target) => ({
      sourceOffset: 8,
      target,
      targetOffset: target * 4,
      size: 8
    }));
    const index = new ByteTransferIndex(spans);
    expect(intersections(index, 12, 4)).toEqual(
      spans.map(span => ({ ...span, sourceOffset: 12, targetOffset: span.targetOffset + 4, size: 4 }))
    );
  });

  it('translates partial intersections near the largest safe endpoint without rounding', () => {
    const maximum = Number.MAX_SAFE_INTEGER;
    const index = new ByteTransferIndex([{ sourceOffset: maximum - 2, target: 0, targetOffset: maximum - 2, size: 2 }]);
    expect(intersections(index, maximum - 1, 1)).toEqual([
      { sourceOffset: maximum - 1, target: 0, targetOffset: maximum - 1, size: 1 }
    ]);
  });

  it('keeps queries independent when a visitor reenters or throws', () => {
    const spans = Array.from({ length: 16 }, (_, target) => ({
      sourceOffset: (15 - target) * 4,
      target,
      targetOffset: 0,
      size: 8
    }));
    const index = new ByteTransferIndex(spans);
    const expected = intersections(index, 4, 12);
    const targets: number[] = [];
    index.forEachIntersection(4, 12, target => {
      targets.push(target);
      expect(intersections(index, 4, 12)).toEqual(expected);
    });
    expect(targets).toEqual(expected.map(span => span.target));
    expect(() =>
      index.forEachIntersection(4, 12, () => {
        throw new Error('stop');
      })
    ).toThrow('stop');
    expect(intersections(index, 4, 12)).toEqual(expected);
  });

  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid boundaries and target identifiers: %s',
    invalid => {
      const valid = { sourceOffset: 0, target: 0, targetOffset: 0, size: 1 };
      for (const field of ['sourceOffset', 'target', 'targetOffset', 'size'] as const) {
        expect(() => new ByteTransferIndex([{ ...valid, [field]: invalid }])).toThrow(RangeError);
      }
      const index = new ByteTransferIndex([valid]);
      const visit = vi.fn();
      expect(() => index.forEachIntersection(invalid, 1, visit)).toThrow(RangeError);
      expect(() => index.forEachIntersection(0, invalid, visit)).toThrow(RangeError);
      expect(visit).not.toHaveBeenCalled();
    }
  );

  it('rejects unsafe source, target, and query endpoints', () => {
    const maximum = Number.MAX_SAFE_INTEGER;
    expect(() => new ByteTransferIndex([{ sourceOffset: maximum, target: 0, targetOffset: 0, size: 1 }])).toThrow(
      RangeError
    );
    expect(() => new ByteTransferIndex([{ sourceOffset: 0, target: 0, targetOffset: maximum, size: 1 }])).toThrow(
      RangeError
    );
    expect(() => new ByteTransferIndex([]).forEachIntersection(maximum, 1, () => undefined)).toThrow(RangeError);
  });
});

function verifyByteTransfers(
  index: ByteTransferIndex,
  spans: readonly ByteTransferSpan[],
  range: { offset: number; size: number }
): void {
  const actual = emptyTargets();
  const expected = emptyTargets();
  const targets: number[] = [];
  // eslint-disable-next-line max-params -- Mirrors the allocation-free transfer visitor contract.
  index.forEachIntersection(range.offset, range.size, (target, sourceOffset, targetOffset, length) => {
    targets.push(target);
    for (let byte = 0; byte < length; byte += 1) actual[target]![targetOffset + byte] = (sourceOffset + byte + 1) % 251;
  });
  const expectedTargets: number[] = [];
  for (const span of spans) {
    let matched = false;
    for (let byte = 0; byte < span.size; byte += 1) {
      const source = span.sourceOffset + byte;
      if (source < range.offset || source >= range.offset + range.size) continue;
      expected[span.target]![span.targetOffset + byte] = (source + 1) % 251;
      matched = true;
    }
    if (matched) expectedTargets.push(span.target);
  }
  expect(actual).toEqual(expected);
  expect(targets).toEqual(expectedTargets);
}

function intersections(index: ByteTransferIndex, offset: number, size: number): ByteTransferSpan[] {
  const spans: ByteTransferSpan[] = [];
  // eslint-disable-next-line max-params -- Mirrors the allocation-free transfer visitor contract.
  index.forEachIntersection(offset, size, (target, sourceOffset, targetOffset, length) => {
    spans.push({ sourceOffset, target, targetOffset, size: length });
  });
  return spans;
}

function emptyTargets(): Uint8Array[] {
  return Array.from({ length: 4 }, () => new Uint8Array(320));
}
