// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { composeMat4, identityMat4, multiplyMat4, transformPointMat4 } from './mat4.js';

describe('mat4 math', () => {
  it('should return a column-major identity matrix', () => {
    expect([...identityMat4()]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  });

  it('should compose fixed translation, orientation, and scale values', () => {
    const matrix = composeMat4([1, 2, 3], [0, 0, Math.SQRT1_2, Math.SQRT1_2], [2, 3, 4]);

    expectArrayCloseTo([...matrix], [0, 2, 0, 0, -3, 0, 0, 0, 0, 0, 4, 0, 1, 2, 3, 1]);
  });

  it('should multiply parent and child transforms in column-major order', () => {
    const parent = composeMat4([1, 0, 0], [0, 0, 0, 1]);
    const child = composeMat4([0, 2, 0], [0, 0, 0, 1]);
    const world = multiplyMat4(parent, child);

    expect([...world]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 0, 1]);
    expect(transformPointMat4(world, [1, 1, 1])).toEqual([2, 3, 1]);
  });

  it('should apply perspective division when transforming a point', () => {
    const matrix = identityMat4();
    matrix[15] = 2;
    expect(transformPointMat4(matrix, [2, 4, 6])).toEqual([1, 2, 3]);

    matrix[15] = 0;
    expect(transformPointMat4(matrix, [2, 4, 6])).toEqual([2, 4, 6]);
  });

  it('should reject invalid vectors, quaternions, and matrices', () => {
    expect(() => composeMat4([Number.NaN, 0, 0], [0, 0, 0, 1])).toThrow(RangeError);
    expect(() => composeMat4([0, 0, 0], [0, 0, 0, 1], [1, Infinity, 1])).toThrow(RangeError);
    expect(() => composeMat4([0, 0, 0], [0, 0, 0, 0])).toThrow(RangeError);
    expect(() => multiplyMat4(new Float32Array(15), identityMat4())).toThrow(RangeError);

    const invalid = identityMat4();
    invalid[0] = Number.NaN;
    expect(() => transformPointMat4(invalid, [0, 0, 0])).toThrow(RangeError);
    expect(() => transformPointMat4(identityMat4(), [0, 0, Infinity])).toThrow(RangeError);
  });

  it('should reject short and long vectors at the JavaScript boundary', () => {
    expect(() =>
      callWithUnknownArgs(composeMat4, [
        [0, 0],
        [0, 0, 0, 1]
      ])
    ).toThrow(RangeError);
    expect(() =>
      callWithUnknownArgs(composeMat4, [
        [0, 0, 0, 1],
        [0, 0, 0, 1]
      ])
    ).toThrow(RangeError);
    expect(() => callWithUnknownArgs(transformPointMat4, [identityMat4(), [0, 0, 0, 1]])).toThrow(RangeError);
  });
});

function expectArrayCloseTo(actual: readonly number[], expected: readonly number[]): void {
  actual.forEach((value, index) => expect(value).toBeCloseTo(expected[index] ?? Number.NaN, 6));
}

function callWithUnknownArgs(callback: unknown, args: readonly unknown[]): unknown {
  return Reflect.apply(callback as (...args: readonly unknown[]) => unknown, undefined, args);
}
