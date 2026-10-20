// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { pointBounds, scalarBounds, type PointBoundsSpan } from './point-bounds.js';

describe(pointBounds.name, () => {
  it('reduces planar points or only the selected indices without changing input storage', () => {
    const values = new Float32Array([1, 2, 3, -4, 5, -6, 100, 200, 300]);
    expect(pointBounds({ values, count: 3 })).toEqual({ minimum: [-4, 2, -6], maximum: [100, 200, 300] });
    const indices = new Uint32Array([1, 0, 1]);
    const bounds = pointBounds({ values, count: 3, indices });
    expect(bounds).toEqual({ minimum: [-4, 2, -6], maximum: [1, 5, 3] });
    expect(Object.isFrozen(bounds)).toBe(true);
    expect(Object.isFrozen(bounds?.minimum)).toBe(true);
    expect(Object.isFrozen(bounds?.maximum)).toBe(true);
    values.fill(0);
    indices.fill(2);
    expect(bounds).toEqual({ minimum: [-4, 2, -6], maximum: [1, 5, 3] });
  });

  it('supports interleaved subarrays, offsets, and broadcast points', () => {
    const storage = new Float64Array([99, 99, 99, 1, 2, 3, NaN, -4, 5, -6, NaN, 99]);
    expect(pointBounds({ values: storage.subarray(2, 11), offset: 1, stride: 4, count: 2 })).toEqual({
      minimum: [-4, 2, -6],
      maximum: [1, 5, 3]
    });
    expect(pointBounds({ values: [1, 2, 3], count: 100, stride: 0, indices: [99, 0] })).toEqual({
      minimum: [1, 2, 3],
      maximum: [1, 2, 3]
    });
  });

  it('returns null for empty spans and empty selections, ignoring unselected coordinates', () => {
    expect(pointBounds({ values: [], count: 0 })).toBeNull();
    expect(pointBounds({ values: [1, 2, 3], offset: 3, count: 0 })).toBeNull();
    expect(pointBounds({ values: [NaN, Infinity, -Infinity], count: 1, indices: [] })).toBeNull();
    expect(pointBounds({ values: [1, 2, 3, NaN, Infinity, -Infinity], count: 2, indices: [0] })).toEqual({
      minimum: [1, 2, 3],
      maximum: [1, 2, 3]
    });
  });

  it('preserves JavaScript precision, negative zero minima, and positive zero maxima', () => {
    const bounds = pointBounds({ values: [-0, 1e12 + 0.25, Number.MAX_VALUE], count: 1 });
    expect(bounds?.minimum).toEqual([-0, 1e12 + 0.25, Number.MAX_VALUE]);
    expect(bounds?.maximum).toEqual([0, 1e12 + 0.25, Number.MAX_VALUE]);
  });

  it.each([
    { count: -1 },
    { count: 1.5 },
    { count: Number.MAX_SAFE_INTEGER + 1 },
    { offset: -1 },
    { offset: 0.5 },
    { offset: 4 },
    { stride: -1 },
    { stride: 0.5 },
    { stride: Infinity },
    { count: 2 },
    { count: 3, stride: Number.MAX_SAFE_INTEGER },
    { indices: [-1] },
    { indices: [1] },
    { indices: [0.5] },
    { indices: [NaN] }
  ])('rejects invalid spans and indices %o', changes => {
    expect(() => pointBounds({ values: [1, 2, 3], count: 1, ...changes })).toThrow(RangeError);
  });

  it.each([NaN, Infinity, -Infinity])('rejects a selected nonfinite coordinate %s', value => {
    expect(() => pointBounds({ values: [1, value, 3], count: 1 })).toThrow(RangeError);
  });

  it('matches exhaustive point enumeration across layouts and repeated index selections', () => {
    for (let count = 0; count <= 16; count += 1) {
      for (const stride of [0, 3, 6]) {
        const span = boundsFixture(count, stride);
        expect(pointBounds(span)).toEqual(enumeratedBounds(span));
        const selected = { ...span, indices: Array.from({ length: count * 2 }, (_, index) => (index * 7) % count) };
        expect(pointBounds(selected)).toEqual(enumeratedBounds(selected));
      }
    }
  });
});

describe(scalarBounds.name, () => {
  it('reduces finite samples into independent frozen extrema and returns null for no samples', () => {
    const values = new Float32Array([4, -8, 2, 7]);
    const bounds = scalarBounds(values);
    expect(bounds).toEqual([-8, 7]);
    expect(Object.isFrozen(bounds)).toBe(true);
    values.fill(0);
    expect(bounds).toEqual([-8, 7]);
    expect(scalarBounds([])).toBeNull();
    expect(scalarBounds([-0])).toEqual([-0, -0]);
    expect(scalarBounds([-0, 0])).toEqual([-0, 0]);
    expect(scalarBounds([-Number.MAX_VALUE, Number.MAX_VALUE])).toEqual([-Number.MAX_VALUE, Number.MAX_VALUE]);
  });

  it.each([NaN, Infinity, -Infinity])('rejects a nonfinite sample %s', value => {
    expect(() => scalarBounds([1, value, 2])).toThrow(RangeError);
  });
});

function boundsFixture(count: number, stride: number): PointBoundsSpan {
  const offset = 2;
  const values = new Float64Array(offset + (count === 0 ? 0 : (count - 1) * stride + 3)).fill(NaN);
  for (let index = 0; index < count; index += 1) {
    values.set([index - 7, (index % 5) - 3, 10 - index], offset + index * stride);
  }
  return { values, count, offset, stride };
}

function enumeratedBounds({ values, count, offset = 0, stride = 3, indices }: PointBoundsSpan) {
  const points = Array.from(indices ?? Array.from({ length: count }, (_, index) => index), index => [
    values[offset + index * stride]!,
    values[offset + index * stride + 1]!,
    values[offset + index * stride + 2]!
  ]);
  if (points.length === 0) return null;
  return {
    minimum: [0, 1, 2].map(axis => Math.min(...points.map(point => point[axis]!))),
    maximum: [0, 1, 2].map(axis => Math.max(...points.map(point => point[axis]!)) + 0)
  };
}
