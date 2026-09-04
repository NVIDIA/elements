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

  const result = new Float32Array(16),
    left0 = left[0]!,
    left1 = left[1]!,
    left2 = left[2]!,
    left3 = left[3]!,
    left4 = left[4]!,
    left5 = left[5]!,
    left6 = left[6]!,
    left7 = left[7]!,
    left8 = left[8]!,
    left9 = left[9]!,
    left10 = left[10]!,
    left11 = left[11]!,
    left12 = left[12]!,
    left13 = left[13]!,
    left14 = left[14]!,
    left15 = left[15]!;

  for (let column = 0; column < 4; column += 1) {
    const offset = column * 4,
      right0 = right[offset]!,
      right1 = right[offset + 1]!,
      right2 = right[offset + 2]!,
      right3 = right[offset + 3]!;

    result[offset] = left0 * right0 + left4 * right1 + left8 * right2 + left12 * right3;
    result[offset + 1] = left1 * right0 + left5 * right1 + left9 * right2 + left13 * right3;
    result[offset + 2] = left2 * right0 + left6 * right1 + left10 * right2 + left14 * right3;
    result[offset + 3] = left3 * right0 + left7 * right1 + left11 * right2 + left15 * right3;
  }
  return result;
}

export function transformPointMat4(matrix: Mat4, point: Readonly<Vec3>): Vec3 {
  assertMat4(matrix);
  assertFiniteVec3(point);

  const [x, y, z] = point;
  const transformedW = matrix[3]! * x + matrix[7]! * y + matrix[11]! * z + matrix[15]!;
  const inverseW = transformedW === 0 ? 1 : 1 / transformedW;

  return [
    (matrix[0]! * x + matrix[4]! * y + matrix[8]! * z + matrix[12]!) * inverseW,
    (matrix[1]! * x + matrix[5]! * y + matrix[9]! * z + matrix[13]!) * inverseW,
    (matrix[2]! * x + matrix[6]! * y + matrix[10]! * z + matrix[14]!) * inverseW
  ];
}

function assertMat4(matrix: Mat4): void {
  if (matrix.length !== 16) {
    throw new RangeError('Matrix must contain 16 finite values.');
  }
  for (let index = 0; index < 16; index += 1) {
    if (!Number.isFinite(matrix[index])) throw new RangeError('Matrix must contain 16 finite values.');
  }
}

function assertFiniteVec3(vector: Readonly<Vec3>): void {
  if (
    vector.length !== 3 ||
    !Number.isFinite(vector[0]) ||
    !Number.isFinite(vector[1]) ||
    !Number.isFinite(vector[2])
  ) {
    throw new RangeError('Vector must contain 3 finite components.');
  }
}
