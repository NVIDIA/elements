// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Mat4, Quaternion, Vec3 } from '../types.js';
import { normalizeQuaternion } from './quaternion.js';

export function identityMat4(): Mat4 {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

export function composeMat4(
  position: Readonly<Vec3>,
  orientation: Readonly<Quaternion>,
  scale: Readonly<Vec3> = [1, 1, 1]
): Mat4 {
  assertFiniteVec3(position);
  assertFiniteVec3(scale);

  const [x, y, z, w] = normalizeQuaternion(orientation),
    [sx, sy, sz] = scale,
    x2 = x + x,
    y2 = y + y,
    z2 = z + z,
    xx = x * x2,
    xy = x * y2,
    xz = x * z2,
    yy = y * y2,
    yz = y * z2,
    zz = z * z2,
    wx = w * x2,
    wy = w * y2,
    wz = w * z2;

  return new Float32Array([
    (1 - (yy + zz)) * sx,
    (xy + wz) * sx,
    (xz - wy) * sx,
    0,
    (xy - wz) * sy,
    (1 - (xx + zz)) * sy,
    (yz + wx) * sy,
    0,
    (xz + wy) * sz,
    (yz - wx) * sz,
    (1 - (xx + yy)) * sz,
    0,
    position[0],
    position[1],
    position[2],
    1
  ]);
}

export function multiplyMat4(left: Mat4, right: Mat4): Mat4 {
  assertMat4(left);
  assertMat4(right);

  const result = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      let value = 0;
      for (let index = 0; index < 4; index += 1) {
        value += readMat4(left, index, row) * readMat4(right, column, index);
      }
      result[column * 4 + row] = value;
    }
  }
  return result;
}

export function transformPointMat4(matrix: Mat4, point: Readonly<Vec3>): Vec3 {
  assertMat4(matrix);
  assertFiniteVec3(point);

  const [x, y, z] = point;
  const transformedW =
    readMat4(matrix, 0, 3) * x + readMat4(matrix, 1, 3) * y + readMat4(matrix, 2, 3) * z + readMat4(matrix, 3, 3);
  const inverseW = transformedW === 0 ? 1 : 1 / transformedW;

  return [
    (readMat4(matrix, 0, 0) * x + readMat4(matrix, 1, 0) * y + readMat4(matrix, 2, 0) * z + readMat4(matrix, 3, 0)) *
      inverseW,
    (readMat4(matrix, 0, 1) * x + readMat4(matrix, 1, 1) * y + readMat4(matrix, 2, 1) * z + readMat4(matrix, 3, 1)) *
      inverseW,
    (readMat4(matrix, 0, 2) * x + readMat4(matrix, 1, 2) * y + readMat4(matrix, 2, 2) * z + readMat4(matrix, 3, 2)) *
      inverseW
  ];
}

function readMat4(matrix: Mat4, column: number, row: number): number {
  const value = matrix[column * 4 + row];
  if (value === undefined) {
    throw new RangeError('Matrix must contain 16 values.');
  }
  return value;
}

function assertMat4(matrix: Mat4): void {
  if (matrix.length !== 16 || matrix.some(value => !Number.isFinite(value))) {
    throw new RangeError('Matrix must contain 16 finite values.');
  }
}

function assertFiniteVec3(vector: Readonly<Vec3>): void {
  if (vector.length !== 3 || vector.some(value => !Number.isFinite(value))) {
    throw new RangeError('Vector must contain 3 finite components.');
  }
}
