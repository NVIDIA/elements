// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { BoundsAccumulator, boundsCorners, extendAffineBounds, type SceneBounds } from './bounds.js';
import { composePreciseMat4, identityPreciseMat4, transformPointMat4 } from './mat4.js';
import type { Matrix4, Vec3 } from './types.js';

const box: SceneBounds = { minimum: [-1, -2, -3], maximum: [2, 3, 4] };

function cornerBounds(bounds: SceneBounds, matrix: Matrix4): SceneBounds {
  const result = new BoundsAccumulator();
  for (const corner of boundsCorners(bounds)) result.include(transformPointMat4(matrix, corner));
  return result.bounds!;
}

describe(extendAffineBounds.name, () => {
  it('matches exact corner unions across deterministic float32 and float64 affine transforms', () => {
    let seed = 0x51ce;
    const sample = () => {
      seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
      return (seed / 2 ** 32 - 0.5) * 10 ** ((seed >>> 27) - 16);
    };
    for (let fixture = 0; fixture < 1024; fixture += 1) {
      const minimum: Vec3 = [sample(), sample(), sample()];
      const maximum: Vec3 = [sample(), sample(), sample()];
      for (let axis = 0; axis < 3; axis += 1) {
        const first = minimum[axis]!,
          second = maximum[axis]!;
        minimum[axis] = Math.min(first, second);
        maximum[axis] = Math.max(first, second);
      }
      const source = { minimum, maximum };
      const precise = Float64Array.from({ length: 16 }, sample);
      precise[3] = precise[7] = precise[11] = 0;
      precise[15] = 1;
      if (fixture % 7 === 0) precise[0] = precise[1] = precise[2] = 0;
      for (const matrix of [precise, new Float32Array(precise)]) {
        const lower: Vec3 = [Infinity, Infinity, Infinity];
        const upper: Vec3 = [-Infinity, -Infinity, -Infinity];
        extendAffineBounds(source, matrix, lower, upper);
        expect({ minimum: lower, maximum: upper }).toEqual(cornerBounds(source, matrix));
      }
    }
  });

  it('retains finite extreme endpoints and signed-zero behavior without midpoint or extent arithmetic', () => {
    const signedZero = new Float64Array(16).fill(-0);
    signedZero[15] = 1;
    const cancellation = identityPreciseMat4();
    cancellation[4] = -1;
    cancellation[8] = 1;
    cancellation[12] = -0.5;
    const fixtures: Array<{ bounds: SceneBounds; matrix: Matrix4 }> = [
      {
        bounds: { minimum: [Number.MAX_VALUE, 0, 0], maximum: [Number.MAX_VALUE, 1, 1] },
        matrix: identityPreciseMat4()
      },
      {
        bounds: { minimum: [-Number.MAX_VALUE, -1, -1], maximum: [Number.MAX_VALUE, 1, 1] },
        matrix: identityPreciseMat4()
      },
      {
        bounds: { minimum: [Number.MIN_VALUE, 0, -0], maximum: [Number.MIN_VALUE * 2, 0, 0] },
        matrix: identityPreciseMat4()
      },
      { bounds: { minimum: [1e16, 1e16, 2], maximum: [1e16, 1e16, 2] }, matrix: cancellation },
      { bounds: { minimum: [1, 1, 1], maximum: [1, 1, 1] }, matrix: signedZero },
      { bounds: { minimum: [2, 3, 4], maximum: [-1, -2, -3] }, matrix: identityPreciseMat4() }
    ];
    for (const { bounds, matrix } of fixtures) {
      const actual = new BoundsAccumulator();
      actual.includeBox(bounds, matrix);
      expect(actual.bounds).toEqual(cornerBounds(bounds, matrix));
    }
    const zeroBounds = new BoundsAccumulator();
    zeroBounds.includeBox({ minimum: [1, 1, 1], maximum: [1, 1, 1] }, signedZero);
    expect(Object.is(zeroBounds.bounds?.minimum[0], -0)).toBe(true);
    expect(Object.is(zeroBounds.bounds?.maximum[0], 0)).toBe(true);
  });

  it('extends existing bounds while reading aliased source endpoints before writing', () => {
    const minimum: Vec3 = [1, 2, 3];
    const maximum: Vec3 = [2, 3, 4];
    const source = { minimum, maximum };
    const matrix = new Float64Array([-1, 2, 3, 0, -4, 5, 6, 0, -7, 8, 9, 0, -10, 20, 30, 1]);
    const expected = new BoundsAccumulator();
    expected.include(minimum);
    expected.include(maximum);
    for (const corner of boundsCorners(source)) expected.include(transformPointMat4(matrix, corner));
    const beforeMatrix = matrix.slice();
    extendAffineBounds(source, matrix, minimum, maximum);
    expect(source).toEqual(expected.bounds);
    expect(matrix).toEqual(beforeMatrix);
  });

  it('normalizes existing upper zero bounds when extending them with negative coordinates', () => {
    const minimum: Vec3 = [-2, -2, -2];
    const maximum: Vec3 = [-0, -0, -0];
    extendAffineBounds({ minimum: [-3, -3, -3], maximum: [-1, -1, -1] }, identityPreciseMat4(), minimum, maximum);
    expect(minimum).toEqual([-3, -3, -3]);
    expect(maximum.every(value => Object.is(value, 0))).toBe(true);
  });

  it('rejects invalid affine matrices and identical destination tuples before writing', () => {
    const invalid = identityPreciseMat4();
    invalid[0] = NaN;
    const perspective = identityPreciseMat4();
    perspective[3] = 0.25;
    const minimum: Vec3 = [Infinity, Infinity, Infinity];
    const maximum: Vec3 = [-Infinity, -Infinity, -Infinity];
    for (const matrix of [new Float64Array(15), invalid, perspective]) {
      expect(() => extendAffineBounds(box, matrix, minimum, maximum)).toThrow(RangeError);
      expect(minimum).toEqual([Infinity, Infinity, Infinity]);
      expect(maximum).toEqual([-Infinity, -Infinity, -Infinity]);
    }
    expect(() => extendAffineBounds(box, identityPreciseMat4(), minimum, minimum)).toThrow(RangeError);
  });

  it('rejects overflowing intermediate products even when their real-valued sum would cancel', () => {
    const matrix = identityPreciseMat4();
    matrix[0] = Number.MAX_VALUE;
    matrix[4] = -Number.MAX_VALUE;
    const point: SceneBounds = { minimum: [2, 2, 0], maximum: [2, 2, 0] };
    expect(() => cornerBounds(point, matrix)).toThrow(RangeError);
    expect(() => new BoundsAccumulator().includeBox(point, matrix)).toThrow(RangeError);
  });
});

describe(BoundsAccumulator.name, () => {
  it('matches transformed corner unions for rotated, sheared, reflected, and singular affine boxes', () => {
    for (let index = 0; index < 32; index += 1) {
      const matrix = composePreciseMat4(
        [1e12 + index, index, -index],
        [1, index % 5, 2, 3],
        [index % 2 ? -2 : 2, index % 3 ? 3 : 0, 0.5]
      );
      matrix[4] = matrix[4]! + 0.25;
      const expected = new BoundsAccumulator();
      for (const corner of boundsCorners(box)) expected.include(transformPointMat4(matrix, corner));
      const actual = new BoundsAccumulator();
      actual.includeBox(box, matrix);
      expect(actual.bounds).toEqual(expected.bounds);
    }
  });

  it('retains perspective division for non-affine matrices', () => {
    const matrix = identityPreciseMat4();
    matrix[3] = 0.125;
    matrix[15] = 2;
    const expected = new BoundsAccumulator();
    for (const corner of boundsCorners(box)) expected.include(transformPointMat4(matrix, corner));
    const actual = new BoundsAccumulator();
    actual.includeBox(box, matrix);
    expect(actual.bounds).toEqual(expected.bounds);
  });

  it('retains precise large translations and frozen snapshots across subsequent boxes', () => {
    const bounds = new BoundsAccumulator();
    const point: SceneBounds = { minimum: [0.25, 0.5, 0.75], maximum: [0.25, 0.5, 0.75] };
    bounds.includeBox(point, composePreciseMat4([1e12 + 0.25, 2, 3], [0, 0, 0, 1]));
    const snapshot = bounds.bounds;
    expect(snapshot).toEqual({ minimum: [1e12 + 0.5, 2.5, 3.75], maximum: [1e12 + 0.5, 2.5, 3.75] });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot?.minimum)).toBe(true);
    expect(Object.isFrozen(snapshot?.maximum)).toBe(true);
    bounds.includeBox(box, identityPreciseMat4());
    expect(snapshot?.minimum[0]).toBe(1e12 + 0.5);
    expect(bounds.bounds?.minimum[0]).toBe(-1);
    expect(point).toEqual({ minimum: [0.25, 0.5, 0.75], maximum: [0.25, 0.5, 0.75] });
  });

  it('rejects invalid matrices, corners, and overflowing transformed bounds', () => {
    const bounds = new BoundsAccumulator();
    const matrix = identityPreciseMat4();
    matrix[0] = Infinity;
    expect(() => bounds.includeBox(box, matrix)).toThrow(RangeError);
    expect(() => bounds.includeBox({ ...box, minimum: [NaN, 0, 0] }, identityPreciseMat4())).toThrow(RangeError);
    expect(() => bounds.includeBox(box, composePreciseMat4([0, 0, 0], [0, 0, 0, 1], [Number.MAX_VALUE, 1, 1]))).toThrow(
      RangeError
    );
  });
});
