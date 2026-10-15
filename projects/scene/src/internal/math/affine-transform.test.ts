// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { PreparedAffineGeometryTransform, PreparedAffineTransform } from './affine-transform.js';
import { composePreciseMat4, identityPreciseMat4, invertPreciseMat4, transformPointMat4 } from './mat4.js';
import type { Vec3 } from './types.js';

describe(PreparedAffineTransform.name, () => {
  it('writes position spans into caller storage without changing source values or neighboring output', () => {
    const matrix = composePreciseMat4([10, 20, 30], [0, 0, 0, 1], [2, 3, 4]);
    const source = Object.freeze([99, 1, 2, 3, 88]);
    const target = new Float64Array(7).fill(-1);
    const transform = new PreparedAffineTransform(matrix);
    expect(transform.writePosition(source, 1, target, 2)).toBe(target);
    expect([...target]).toEqual([-1, -1, 12, 26, 42, -1, -1]);
    expect(source).toEqual([99, 1, 2, 3, 88]);
  });

  it('captures matrix coefficients at JavaScript precision and rounds only into output storage', () => {
    const matrix = composePreciseMat4([1e12 + 0.25, 2, 3], [0, 0, 0, 1]);
    const transform = new PreparedAffineTransform(matrix);
    const point: Vec3 = [0.25, 0.5, 0.75];
    const precise = new Float64Array(3);
    const gpu = new Float32Array(3);
    matrix.fill(0);
    transform.writePosition(point, 0, precise, 0);
    transform.writePosition(point, 0, gpu, 0);
    expect([...precise]).toEqual([1e12 + 0.5, 2.5, 3.75]);
    expect(gpu).toEqual(new Float32Array(precise));
    expect(point).toEqual([0.25, 0.5, 0.75]);
  });

  it('supports exact and partially overlapping source and destination spans', () => {
    const transform = new PreparedAffineTransform(composePreciseMat4([10, 20, 30], [0, 0, 0, 1]));
    const point: Vec3 = [1, 2, 3];
    expect(transform.writePosition(point, 0, point, 0)).toBe(point);
    expect(point).toEqual([11, 22, 33]);
    const shared = new Float64Array([7, 1, 2, 3, 9, 9]);
    transform.writePosition(shared, 1, shared, 2);
    expect([...shared]).toEqual([7, 1, 11, 22, 33, 9]);
  });

  it('allows singular affine matrices for position transforms', () => {
    const matrix = composePreciseMat4([1, 2, 3], [0, 0, 0, 1], [0, 2, 0]);
    const target: Vec3 = [0, 0, 0];
    new PreparedAffineTransform(matrix).writePosition([4, 5, 6], 0, target, 0);
    expect(target).toEqual([1, 12, 3]);
    expect(() => new PreparedAffineGeometryTransform(matrix)).toThrow(RangeError);
  });

  it('matches general matrix transforms across varied rotations, reflections, shear, and points', () => {
    const target = new Float64Array(3);
    for (let fixture = 0; fixture < 64; fixture += 1) {
      const matrix = composePreciseMat4(
        [1e12 + fixture, fixture * 0.125, -fixture],
        [fixture % 5, (fixture % 7) - 3, fixture % 11, 1],
        [fixture % 2 ? -2 : 2, 0.5, 3]
      );
      matrix[4] = matrix[4]! + 0.25;
      const transform = new PreparedAffineTransform(matrix);
      for (let index = 0; index < 16; index += 1) {
        const point: Vec3 = [index * 0.125, (index % 3) - 1, (index % 5) * 2];
        transform.writePosition(point, 0, target, 0);
        expect([...target]).toEqual(transformPointMat4(matrix, point));
      }
    }
  });

  it.each([
    { matrix: new Float64Array(15) },
    { matrix: new Float64Array(17) },
    { matrix: new Float64Array([NaN, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) },
    { matrix: new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, Infinity, 0, 0, 1]) },
    { matrix: new Float64Array([1, 0, 0, 0.25, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) },
    { matrix: new Float64Array([1, 0, 0, 0, 0, 1, 0, 0.25, 0, 0, 1, 0, 0, 0, 0, 1]) },
    { matrix: new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.25, 0, 0, 0, 1]) },
    { matrix: new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2]) }
  ])('rejects invalid or perspective matrices before preparing fixture %#', ({ matrix }) => {
    expect(() => new PreparedAffineTransform(matrix)).toThrow(RangeError);
    expect(() => new PreparedAffineGeometryTransform(matrix)).toThrow(RangeError);
  });
});

describe(PreparedAffineGeometryTransform.name, () => {
  it('uses the inverse transpose for nonuniform scale and shear, independently of translation', () => {
    const matrix = new Float64Array([2, 0, 0, 0, 1, 3, 0, 0, 0, 0, -4, 0, 1e12, 20, 30, 1]);
    const transform = new PreparedAffineGeometryTransform(matrix);
    const target = new Float64Array(5).fill(-1);
    const source = Object.freeze([99, 1, 0, 0]);
    matrix.fill(0);
    expect(transform.writeNormal(source, 1, target, 1)).toBe(target);
    expect(target[0]).toBe(-1);
    expect(target[4]).toBe(-1);
    expect(target[1]).toBeCloseTo(3 / Math.sqrt(10), 12);
    expect(target[2]).toBeCloseTo(-1 / Math.sqrt(10), 12);
    expect(target[3]).toBe(0);
    expect(target[1]! + target[2]! * 3).toBeCloseTo(0, 12);
    expect(Math.hypot(target[1]!, target[2]!, target[3]!)).toBeCloseTo(1, 12);
    expect(transform.mirrored).toBe(true);
  });

  it('normalizes into overlapping output spans and gives zero normals the existing positive Z fallback', () => {
    const transform = new PreparedAffineGeometryTransform(identityPreciseMat4());
    const shared = new Float64Array([3, 0, 0, 9, 9]);
    transform.writeNormal(shared, 0, shared, 1);
    expect([...shared]).toEqual([3, 1, 0, 0, 9]);
    const target: Vec3 = [9, 9, 9];
    transform.writeNormal([0, 0, 0], 0, target, 0);
    expect(target).toEqual([0, 0, 1]);
  });

  it('retains pivoted inversion when a diagonal coefficient is tiny', () => {
    const matrix = new Float32Array([1e-15, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const transform = new PreparedAffineGeometryTransform(matrix);
    const target: Vec3 = [0, 0, 0];
    transform.writeNormal([1, 0, 0], 0, target, 0);
    expect(target[0]).toBeCloseTo(-Math.SQRT1_2, 12);
    expect(target[1]).toBeCloseTo(Math.SQRT1_2, 12);
    expect(target[2]).toBe(0);
    expect(transform.mirrored).toBe(true);
  });

  it.each([1e-100, 1, 1e100])('classifies reflection without overflowing or underflowing scale %s', scale => {
    const matrix = composePreciseMat4([0, 0, 0], [0, 0, 0, 1], [-scale, scale, scale]);
    const transform = new PreparedAffineGeometryTransform(matrix);
    const target: Vec3 = [0, 0, 0];
    expect(transform.mirrored).toBe(true);
    transform.writeNormal([1, 0, 0], 0, target, 0);
    expect(target).toEqual([-1, 0, 0]);
    matrix[0] = scale;
    expect(new PreparedAffineGeometryTransform(matrix).mirrored).toBe(false);
  });

  it('matches captured inverse-transpose normals across varied affine transforms', () => {
    const target = new Float64Array(3);
    for (let index = 0; index < 64; index += 1) {
      const matrix = composePreciseMat4([index, -index, 1e12], [1, index % 5, 2, 3], [index % 2 ? -2 : 2, 3, 0.5]);
      const inverse = invertPreciseMat4(matrix)!;
      const transform = new PreparedAffineGeometryTransform(matrix);
      const source: Vec3 = [1, index % 3, 2];
      const expected: Vec3 = [
        inverse[0]! * source[0] + inverse[1]! * source[1] + inverse[2]! * source[2],
        inverse[4]! * source[0] + inverse[5]! * source[1] + inverse[6]! * source[2],
        inverse[8]! * source[0] + inverse[9]! * source[1] + inverse[10]! * source[2]
      ];
      const length = Math.hypot(...expected);
      transform.writeNormal(source, 0, target, 0);
      expect([...target]).toEqual(expected.map(value => value / length));
    }
  });

  it('rejects matrices whose inverse cannot remain finite', () => {
    const matrix = identityPreciseMat4();
    matrix[0] = Number.MIN_VALUE;
    expect(() => new PreparedAffineGeometryTransform(matrix)).toThrow(RangeError);
  });
});
