// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Mat4, Matrix4, PreciseMat4, Quaternion, Vec3 } from '../types.js';
import { normalizeQuaternion } from './quaternion.js';

export function identityMat4(): Mat4 {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

export function identityPreciseMat4(): PreciseMat4 {
  return new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

export function composeMat4(
  position: Readonly<Vec3>,
  orientation: Readonly<Quaternion>,
  scale: Readonly<Vec3> = [1, 1, 1]
): Mat4 {
  return new Float32Array(composeMat4Values(position, orientation, scale));
}

export function composePreciseMat4(
  position: Readonly<Vec3>,
  orientation: Readonly<Quaternion>,
  scale: Readonly<Vec3> = [1, 1, 1]
): PreciseMat4 {
  return new Float64Array(composeMat4Values(position, orientation, scale));
}

function composeMat4Values(
  position: Readonly<Vec3>,
  orientation: Readonly<Quaternion>,
  scale: Readonly<Vec3>
): number[] {
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

  return [
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
  ];
}

export function multiplyMat4(left: Mat4, right: Mat4): Mat4 {
  return multiplyMat4Into(left, right, new Float32Array(16));
}

export function multiplyPreciseMat4(left: Matrix4, right: Matrix4): PreciseMat4 {
  return multiplyMat4Into(left, right, new Float64Array(16));
}

function multiplyMat4Into<T extends Matrix4>(left: Matrix4, right: Matrix4, result: T): T {
  assertMat4(left);
  assertMat4(right);

  const left0 = left[0]!,
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

export function transformPointMat4(matrix: Matrix4, point: Readonly<Vec3>): Vec3 {
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

/** Writes a finite matrix into an existing GPU-width value array. */
export function writeMat4ToFloat32(target: Float32Array, matrix: Matrix4, offset = 0): void {
  assertMat4(matrix);
  if (!Number.isInteger(offset) || offset < 0 || offset + 16 > target.length) {
    throw new RangeError('Matrix destination must contain 16 values from the selected offset.');
  }
  for (let index = 0; index < 16; index += 1) {
    const value = Math.fround(matrix[index]!);
    if (!Number.isFinite(value)) throw new RangeError('Matrix values must fit the finite Float32 GPU range.');
    target[offset + index] = value;
  }
}

/** Inverts a finite 4x4 matrix, or returns null for a singular matrix. */
export function invertMat4(matrix: Mat4): Mat4 | null {
  const values = invertMat4Values(matrix);
  return values ? new Float32Array(values) : null;
}

export function invertPreciseMat4(matrix: Matrix4): PreciseMat4 | null {
  const values = invertMat4Values(matrix);
  return values ? new Float64Array(values) : null;
}

function invertMat4Values(matrix: Matrix4): number[] | null {
  if (!matrixIsValid(matrix)) return null;
  const augmented = createAugmentedMatrix(matrix);
  for (let pivot = 0; pivot < 4; pivot += 1) {
    if (!reduceMatrixPivot(augmented, pivot)) return null;
  }
  return readInverseMatrix(augmented);
}

function matrixIsValid(matrix: Matrix4): boolean {
  try {
    assertMat4(matrix);
    return true;
  } catch {
    return false;
  }
}

function createAugmentedMatrix(matrix: Matrix4): number[][] {
  return Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 8 }, (_, column) => (column < 4 ? matrix[column * 4 + row]! : column - 4 === row ? 1 : 0))
  );
}

function reduceMatrixPivot(augmented: number[][], pivot: number): boolean {
  const row = findPivotRow(augmented, pivot);
  if (row < pivot) return false;
  const selectedRow = augmented[row]!;
  const previousRow = augmented[pivot]!;
  augmented[pivot] = selectedRow;
  augmented[row] = previousRow;
  const divisor = selectedRow[pivot]!;
  if (divisor === 0) return false;
  const pivotRow = selectedRow.map(value => value / divisor);
  augmented[pivot] = pivotRow;
  for (let other = 0; other < 4; other += 1) {
    if (other !== pivot) eliminateMatrixRow(augmented, other, pivot);
  }
  return true;
}

function findPivotRow(augmented: readonly number[][], pivot: number): number {
  return augmented.slice(pivot).findIndex(candidate => Math.abs(candidate[pivot]!) > Number.EPSILON) + pivot;
}

function eliminateMatrixRow(augmented: number[][], row: number, pivot: number): void {
  const targetRow = augmented[row]!;
  const factor = targetRow[pivot]!;
  const pivotRow = augmented[pivot]!;
  augmented[row] = targetRow.map((value, column) => value - factor * pivotRow[column]!);
}

function readInverseMatrix(augmented: readonly number[][]): number[] {
  return Array.from({ length: 16 }, (_, index) => augmented[index % 4]![4 + Math.floor(index / 4)]!);
}

export function multiplyMat4Vec4(
  matrix: Matrix4,
  vector: readonly [number, number, number, number]
): [number, number, number, number] {
  return [
    matrix[0]! * vector[0] + matrix[4]! * vector[1] + matrix[8]! * vector[2] + matrix[12]! * vector[3],
    matrix[1]! * vector[0] + matrix[5]! * vector[1] + matrix[9]! * vector[2] + matrix[13]! * vector[3],
    matrix[2]! * vector[0] + matrix[6]! * vector[1] + matrix[10]! * vector[2] + matrix[14]! * vector[3],
    matrix[3]! * vector[0] + matrix[7]! * vector[1] + matrix[11]! * vector[2] + matrix[15]! * vector[3]
  ];
}

function assertMat4(matrix: Matrix4): void {
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
