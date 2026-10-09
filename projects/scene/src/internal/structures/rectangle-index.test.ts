// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { RectangleIndex, type RectangleBounds } from './rectangle-index.js';

function candidates(index: RectangleIndex, bounds: RectangleBounds): number[] {
  const result: number[] = [];
  expect(
    index.some(...bounds, candidate => {
      result.push(candidate);
      return false;
    })
  ).toBe(false);
  return result.sort((left, right) => left - right);
}

function overlap(left: RectangleBounds, right: RectangleBounds): boolean {
  return left[0] <= right[2] && left[1] <= right[3] && left[2] >= right[0] && left[3] >= right[1];
}

describe(RectangleIndex.name, () => {
  it('handles empty and singleton indices, closed boundaries, and unbounded queries', () => {
    const empty = new RectangleIndex([]);
    expect(empty.capacity).toBe(0);
    expect(empty.byteLength).toBe(0);
    expect(candidates(empty, [-Infinity, -Infinity, Infinity, Infinity])).toEqual([]);
    const singleton = new RectangleIndex([[1, 2, 1, 2]]);
    expect(candidates(singleton, [1, 2, 3, 4])).toEqual([0]);
    expect(candidates(singleton, [1, 2 + Number.EPSILON * 2, 3, 4])).toEqual([]);
    expect(singleton.remove(0)).toBe(true);
    expect(candidates(singleton, [-Infinity, -Infinity, Infinity, Infinity])).toEqual([]);
    singleton.set(0, 5, 6, 7, 8);
    expect(singleton.size).toBe(1);
    expect(candidates(singleton, [7, 8, 7, 8])).toEqual([0]);
  });

  it('copies bounds and preserves separate indices for identical rectangles', () => {
    const bounds: [number, number, number, number] = [0, 0, 2, 2];
    const index = new RectangleIndex([bounds, bounds, [5, 5, 6, 6]]);
    bounds[0] = 100;
    expect(candidates(index, [0, 0, 0, 0])).toEqual([0, 1]);
    index.remove(0);
    expect(index.remove(0)).toBe(false);
    expect(index.size).toBe(2);
    expect(candidates(index, [-Infinity, -Infinity, Infinity, Infinity])).toEqual([1, 2]);
    index.set(1, 10, 10, 12, 12);
    expect(candidates(index, [0, 0, 2, 2])).toEqual([]);
    expect(candidates(index, [12, 12, 12, 12])).toEqual([1]);
  });

  it('stops after the first successful predicate and propagates predicate failures', () => {
    const index = new RectangleIndex(Array.from({ length: 9 }, () => [0, 0, 1, 1] as const));
    let calls = 0;
    expect(
      index.some(0, 0, 1, 1, () => {
        calls += 1;
        return true;
      })
    ).toBe(true);
    expect(calls).toBe(1);
    expect(() =>
      index.some(0, 0, 1, 1, () => {
        throw new Error('predicate');
      })
    ).toThrow('predicate');
    expect(index.size).toBe(9);
  });

  it.each([1, 2, 3, 7, 64, 129, 257])(
    'matches exhaustive overlap queries through replacement and removal with %i slots',
    count => {
      let seed = count;
      const random = (): number => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 0x1_0000_0000;
      };
      const rectangle = (): RectangleBounds => {
        const x = random() * 100 - 50;
        const y = random() * 100 - 50;
        return [x, y, x + random() * 10, y + random() * 10];
      };
      const reference: Array<RectangleBounds | undefined> = Array.from({ length: count }, rectangle);
      const index = new RectangleIndex(reference.map(bounds => bounds!));
      expect(index.byteLength).toBe(count * 64);
      for (let step = 0; step < 150; step += 1) {
        const slot = Math.floor(random() * count);
        if (step % 3 === 0) {
          index.remove(slot);
          reference[slot] = undefined;
        } else {
          const bounds = rectangle();
          index.set(slot, ...bounds);
          reference[slot] = bounds;
        }
        const query = rectangle();
        const expected = reference.flatMap((bounds, source) => (bounds && overlap(bounds, query) ? [source] : []));
        expect(candidates(index, query)).toEqual(expected);
        expect(index.some(...query, () => true)).toBe(expected.length > 0);
        expect(index.size).toBe(reference.filter(Boolean).length);
      }
      for (let slot = 0; slot < count; slot += 1) index.remove(slot);
      expect(index.size).toBe(0);
      expect(candidates(index, [-Infinity, -Infinity, Infinity, Infinity])).toEqual([]);
    }
  );

  it.each([-1, 2, 0.5, NaN, Infinity])('rejects invalid slot %s without mutation', slot => {
    const index = new RectangleIndex([
      [0, 0, 1, 1],
      [2, 2, 3, 3]
    ]);
    expect(() => index.set(slot, 4, 4, 5, 5)).toThrow(RangeError);
    expect(() => index.remove(slot)).toThrow(RangeError);
    expect(candidates(index, [-Infinity, -Infinity, Infinity, Infinity])).toEqual([0, 1]);
  });

  it.each<RectangleBounds>([
    [NaN, 0, 1, 1],
    [0, NaN, 1, 1],
    [0, 0, NaN, 1],
    [0, 0, 1, NaN],
    [2, 0, 1, 1],
    [0, 2, 1, 1]
  ])('rejects unordered or NaN bounds %j without mutation', (...bounds) => {
    const index = new RectangleIndex([[0, 0, 1, 1]]);
    expect(() => new RectangleIndex([bounds])).toThrow(RangeError);
    expect(() => index.set(0, ...bounds)).toThrow(RangeError);
    expect(() => index.some(...bounds, () => false)).toThrow(RangeError);
    expect(candidates(index, [0, 0, 1, 1])).toEqual([0]);
  });

  it('rejects infinite stored bounds while allowing infinite query bounds', () => {
    const index = new RectangleIndex([[0, 0, 1, 1]]);
    expect(() => new RectangleIndex([[-Infinity, 0, 1, 1]])).toThrow(RangeError);
    expect(() => index.set(0, 0, 0, Infinity, 1)).toThrow(RangeError);
    expect(candidates(index, [-Infinity, -Infinity, Infinity, Infinity])).toEqual([0]);
  });
});
