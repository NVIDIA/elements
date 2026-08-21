// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { HeightfieldGrid } from './types.js';
import { drape, heightAt, normalAt, slopeAt } from './query.js';

describe('heightfield queries', () => {
  const bilinearGrid: HeightfieldGrid = {
    origin: [10, -5],
    spacing: 2,
    columns: 2,
    rows: 2,
    heights: new Float32Array([0, 2, 4, 10])
  };

  it('interpolates exact sample and cell-center heights', () => {
    expect(heightAt(bilinearGrid, 10, -5)).toBe(0);
    expect(heightAt(bilinearGrid, 12, -5)).toBe(2);
    expect(heightAt(bilinearGrid, 10, -3)).toBe(4);
    expect(heightAt(bilinearGrid, 12, -3)).toBe(10);
    expect(heightAt(bilinearGrid, 11, -4)).toBe(4);
  });

  it('includes final extent edges and excludes values beyond them', () => {
    expect(heightAt(bilinearGrid, 12, -3)).toBe(10);
    expect(normalAt(bilinearGrid, 12, -3)).toBeDefined();
    expect(heightAt(bilinearGrid, 12.000_001, -3)).toBeUndefined();
    expect(heightAt(bilinearGrid, 12, -2.999_999)).toBeUndefined();
    expect(normalAt(bilinearGrid, Number.NaN, -5)).toBeUndefined();
  });

  it('returns the analytic bilinear normal and plane slope', () => {
    const plane: HeightfieldGrid = {
      spacing: 1,
      columns: 3,
      rows: 3,
      heights: new Float32Array([0, 2, 4, 3, 5, 7, 6, 8, 10])
    };
    const expectedNormal = normalize(-2, -3, 1);
    expectCloseArray(normalAt(plane, 1.25, 0.75)!, expectedNormal, 12);
    expect(slopeAt(plane, 1.25, 0.75)).toBeCloseTo(Math.atan(Math.hypot(2, 3)), 6);
  });

  it('drapes only in-bounds points, preserves outside bits, and leaves input unchanged', () => {
    const points = new Float32Array([11, -4, 99, 13, -4, -0, 10, -5, 123]);
    const inputBits = new Uint32Array(points.buffer.slice(0));
    const result = drape(bilinearGrid, points, 0.25);

    expect(result).not.toBe(points);
    expect(result[2]).toBe(4.25);
    expect(result[5]).toBe(-0);
    expect(Object.is(result[5], -0)).toBe(true);
    expect(result[8]).toBe(0.25);
    expect([...new Uint32Array(points.buffer)]).toEqual([...inputBits]);
  });

  it('uses null-grid semantics and rejects malformed drape input', () => {
    const points = new Float32Array([1, 2, 3]);
    expect(heightAt(null, 1, 2)).toBeUndefined();
    expect(normalAt(null, 1, 2)).toBeUndefined();
    expect(slopeAt(null, 1, 2)).toBeUndefined();
    expect(drape(null, points)).toEqual(points);
    expect(drape(null, points)).not.toBe(points);
    expect(() => drape(null, new Float32Array(4))).toThrow(RangeError);
    expect(() => drape(null, points, Number.NaN)).toThrow(RangeError);
  });
});

function normalize(x: number, y: number, z: number): [number, number, number] {
  const inverseLength = 1 / Math.hypot(x, y, z);
  return [x * inverseLength, y * inverseLength, z * inverseLength];
}

function expectCloseArray(actual: readonly number[], expected: readonly number[], precision: number): void {
  for (let index = 0; index < expected.length; index += 1) {
    expect(actual[index]).toBeCloseTo(expected[index]!, precision);
  }
}
