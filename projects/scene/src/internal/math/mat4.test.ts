// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  composeMat4,
  composePreciseMat4,
  identityMat4,
  invertMat4,
  invertPreciseMat4,
  multiplyMat4,
  multiplyMat4Into,
  multiplyPreciseMat4,
  transformPointMat4,
  writeMat4ToFloat32
} from './mat4.js';

describe('mat4 math', () => {
  it('should return a column-major identity matrix', () => {
    const matrix = identityMat4();

    expect(matrix).toBeInstanceOf(Float32Array);
    expect([...matrix]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
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

  it('preserves centimeter-scale child offsets at a large frame origin until GPU conversion', () => {
    const parent = composePreciseMat4([1_000_000, 0, 0], [0, 0, 0, 1]);
    const child = composePreciseMat4([0.01, 0, 0], [0, 0, 0, 1]);
    const world = multiplyPreciseMat4(parent, child);

    expect(world).toBeInstanceOf(Float64Array);
    expect(world[12]).toBeCloseTo(1_000_000.01, 6);
    expect(new Float32Array(world)[12]).toBe(1_000_000);
  });

  it('rejects transforms outside the finite GPU matrix range', () => {
    const matrix = new Float64Array(identityMat4());
    matrix[12] = Number.MAX_VALUE;

    expect(() => writeMat4ToFloat32(new Float32Array(16), matrix)).toThrow(RangeError);
  });

  it('rejects invalid matrix destinations and returns null for noninvertible matrices', () => {
    const identity = identityMat4();
    expect(() => writeMat4ToFloat32(new Float32Array(16), identity, Number.NaN)).toThrow(RangeError);
    expect(() => writeMat4ToFloat32(new Float32Array(16), identity, -1)).toThrow(RangeError);
    expect(() => writeMat4ToFloat32(new Float32Array(16), identity, 1)).toThrow(RangeError);
    expect(invertMat4(new Float32Array(16))).toBeNull();
    expect(invertPreciseMat4(new Float64Array(15))).toBeNull();
  });

  it('should multiply all components of general matrices', () => {
    const left = Float32Array.from({ length: 16 }, (_, index) => index + 1);
    const right = Float32Array.from({ length: 16 }, (_, index) => index + 17);

    expect([...multiplyMat4(left, right)]).toEqual([
      538, 612, 686, 760, 650, 740, 830, 920, 762, 868, 974, 1080, 874, 996, 1118, 1240
    ]);
  });

  it('writes general matrix products into either destination precision without changing the inputs', () => {
    const left = Float64Array.from({ length: 16 }, (_, index) => index + 1);
    const right = Float32Array.from({ length: 16 }, (_, index) => index + 17);
    const originalLeft = left.slice();
    const originalRight = right.slice();
    const expected = [538, 612, 686, 760, 650, 740, 830, 920, 762, 868, 974, 1080, 874, 996, 1118, 1240];
    for (const destination of [new Float32Array(16), new Float64Array(16)]) {
      expect(multiplyMat4Into(left, right, destination)).toBe(destination);
      expect(Array.from(destination)).toEqual(expected);
    }
    expect(left).toEqual(originalLeft);
    expect(right).toEqual(originalRight);
  });

  it('retains precision through cancellation and rounds only at the final destination', () => {
    const left = composePreciseMat4([1_000_000.01, 0, 0], [0, 0, 0, 1]);
    const right = composePreciseMat4([-1_000_000, 0, 0], [0, 0, 0, 1]);
    const precise = multiplyMat4Into(left, right, new Float64Array(16));
    const gpu = multiplyMat4Into(left, right, new Float32Array(16));
    expect(precise[12]).toBe(left[12]! - 1_000_000);
    expect(gpu[12]).toBe(Math.fround(precise[12]!));
    expect(gpu[12]).toBeCloseTo(0.01, 6);
  });

  it('supports exact aliases with either input, including equivalent views and squaring in place', () => {
    for (const ArrayType of [Float32Array, Float64Array]) {
      const left = new ArrayType(Array.from({ length: 16 }, (_, index) => index + 1));
      const right = new ArrayType(Array.from({ length: 16 }, (_, index) => index + 17));
      const expected = ArrayType.from([
        538, 612, 686, 760, 650, 740, 830, 920, 762, 868, 974, 1080, 874, 996, 1118, 1240
      ]);
      const leftAlias = left.slice();
      const rightAlias = right.slice();
      multiplyMat4Into(leftAlias, right, leftAlias);
      multiplyMat4Into(left, rightAlias, new ArrayType(rightAlias.buffer));
      expect(leftAlias).toEqual(expected);
      expect(rightAlias).toEqual(expected);
      const square = left.slice();
      const squared = ArrayType.from([90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484, 542, 600]);
      multiplyMat4Into(square, square, square);
      expect(square).toEqual(squared);
    }
  });

  it('accepts disjoint views but rejects partial overlaps before writing', () => {
    const values = new Float64Array(48);
    const left = values.subarray(0, 16);
    const right = values.subarray(16, 32);
    const output = values.subarray(32, 48);
    left.set(identityMat4());
    right.set(identityMat4());
    multiplyMat4Into(left, right, output);
    expect(output).toEqual(new Float64Array(identityMat4()));
    const before = values.slice();
    for (const destination of [values.subarray(1, 17), values.subarray(17, 33)]) {
      expect(() => multiplyMat4Into(left, right, destination)).toThrow('partially overlap');
      expect(values).toEqual(before);
    }
    const mixed = new Float32Array(values.buffer, left.byteOffset, 16);
    expect(() => multiplyMat4Into(left, right, mixed)).toThrow('partially overlap');
    expect(values).toEqual(before);
  });

  it('rejects invalid inputs and destination sizes before writing', () => {
    const destination = new Float64Array(16).fill(99);
    const identity = identityMat4();
    const invalid = new Float64Array(identity);
    invalid[0] = Number.NaN;
    expect(() => multiplyMat4Into(invalid, identity, destination)).toThrow(RangeError);
    expect(() => multiplyMat4Into(identity, invalid, destination)).toThrow(RangeError);
    expect(() => multiplyMat4Into(new Float32Array(15), identity, destination)).toThrow(RangeError);
    expect(destination).toEqual(new Float64Array(16).fill(99));
    for (const size of [15, 17]) {
      const output = new Float64Array(size).fill(99);
      expect(() => multiplyMat4Into(identity, identity, output)).toThrow('destination');
      expect(output).toEqual(new Float64Array(size).fill(99));
    }
  });

  it('selects the largest pivot to avoid cancellation on a well-conditioned matrix', () => {
    const matrix = new Float64Array([1e-15, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const original = matrix.slice();
    const inverse = invertPreciseMat4(matrix);
    const denominator = 1e-15 - 1;

    expect(inverse).toBeInstanceOf(Float64Array);
    expectArrayCloseTo(
      [...inverse!],
      [1 / denominator, -1 / denominator, 0, 0, -1 / denominator, 1e-15 / denominator, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    );
    expectInverseProducts(matrix, inverse!);
    expect(matrix).toEqual(original);
    inverse![0] = 0;
    expect(invertPreciseMat4(matrix)![0]).toBeCloseTo(1 / denominator, 12);
  });

  it('uses partial pivoting for Float32 results too', () => {
    const matrix = new Float32Array([1e-15, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const original = matrix.slice();
    const inverse = invertMat4(matrix);

    expect(inverse).toBeInstanceOf(Float32Array);
    expectInverseProducts(matrix, inverse!, 6);
    expect(matrix).toEqual(original);
  });

  it.each([1e-100, 1e-20, 1, 1e20, 1e100])('inverts a nonsingular matrix at scale %s', scale => {
    const matrix = new Float64Array([scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale]);
    const inverse = invertPreciseMat4(matrix);

    expect(inverse).not.toBeNull();
    expectInverseProducts(matrix, inverse!);
  });

  it.each([
    new Float64Array([0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0]),
    new Float64Array([2, 0, 0, 0, 0, 3, 0, 0, 0, 0, -1.25, -1, 0, 0, -2.25, 0]),
    new Float64Array([2, 0, 0, 0, 1, -3, 0, 0, 0, 2, 4, 0, 5, 6, 7, 1]),
    new Float64Array([1, 2, 3, 4, 2, 5, 2, 1, 1, 0, 4, 2, 3, 1, 2, 6])
  ])('inverts permutations, perspective, affine, and general matrices %#', matrix => {
    const inverse = invertPreciseMat4(matrix);

    expect(inverse).not.toBeNull();
    expectInverseProducts(matrix, inverse!);
  });

  it('returns null for dependent rows, nonfinite input, and unrepresentable inverses', () => {
    const dependent = new Float64Array([1, 1, 0, 0, 2, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    expect(invertPreciseMat4(dependent)).toBeNull();
    for (const value of [Number.NaN, Infinity, -Infinity]) {
      const invalid = new Float64Array(identityMat4());
      invalid[0] = value;
      expect(invertPreciseMat4(invalid)).toBeNull();
      expect(invertMat4(new Float32Array(invalid))).toBeNull();
    }
    const tiny = identityMat4();
    tiny[0] = 1e-40;
    expect(invertMat4(tiny)).toBeNull();
    expectInverseProducts(tiny, invertPreciseMat4(tiny)!);
    const subnormal = new Float64Array(identityMat4());
    subnormal[0] = Number.MIN_VALUE;
    expect(invertPreciseMat4(subnormal)).toBeNull();
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

function expectInverseProducts(matrix: ArrayLike<number>, inverse: ArrayLike<number>, precision = 12): void {
  expectIdentityProduct(matrix, inverse, precision);
  expectIdentityProduct(inverse, matrix, precision);
}

function expectIdentityProduct(left: ArrayLike<number>, right: ArrayLike<number>, precision: number): void {
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      let product = 0;
      for (let inner = 0; inner < 4; inner += 1) product += left[inner * 4 + row]! * right[column * 4 + inner]!;
      expect(product).toBeCloseTo(row === column ? 1 : 0, precision);
    }
  }
}
