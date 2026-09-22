// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Mat4, Matrix4, PreciseMat4, Quaternion, Vec3 } from './types.js';
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
  return multiplyMat4ValuesInto(left, right, new Float32Array(16));
}

export function multiplyPreciseMat4(left: Matrix4, right: Matrix4): PreciseMat4 {
  return multiplyMat4ValuesInto(left, right, new Float64Array(16));
}

/**
 * Writes the column-major product left * right into caller-owned storage and returns that storage.
 * Inputs must contain 16 finite values; the destination must contain exactly 16 values.
 * Supports exact aliases with either input; rejects partially overlapping views before writing.
 * Arithmetic uses JavaScript precision and rounds only when writing to the destination's element type.
 */
export function multiplyMat4Into<T extends Matrix4>(left: Matrix4, right: Matrix4, result: T): T {
  if (result.length !== 16) throw new RangeError('Matrix destination must contain 16 values.');
  assertNoPartialMatrixOverlap(result, left);
  assertNoPartialMatrixOverlap(result, right);
  return multiplyMat4ValuesInto(left, right, result);
}

// Fresh wrapper results cannot alias an input; keep their backing buffers unobserved for allocation elision.
function multiplyMat4ValuesInto<T extends Matrix4>(left: Matrix4, right: Matrix4, result: T): T {
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

function assertNoPartialMatrixOverlap(result: Matrix4, input: Matrix4): void {
  if (result.buffer !== input.buffer) return;
  if (result.byteOffset === input.byteOffset && result.byteLength === input.byteLength) return;
  if (
    result.byteOffset < input.byteOffset + input.byteLength &&
    input.byteOffset < result.byteOffset + result.byteLength
  ) {
    throw new RangeError('Matrix destination must not partially overlap an input.');
  }
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

/**
 * Inverts a column-major 4x4 matrix using Gauss-Jordan elimination with partial pivoting.
 * Returns null for invalid input, a zero pivot, nonfinite arithmetic, or output outside the finite Float32 range.
 * Accepts small nonzero pivots without estimating the matrix condition number.
 */
export function invertMat4(matrix: Mat4): Mat4 | null {
  return invertMat4Into(matrix, new Float32Array(16));
}

/** Uses the same inversion algorithm with a finite Float64 result. */
export function invertPreciseMat4(matrix: Matrix4): PreciseMat4 | null {
  return invertMat4Into(matrix, new Float64Array(16));
}

function invertMat4Into<T extends Matrix4>(matrix: Matrix4, result: T): T | null {
  if (!matrixIsValid(matrix)) return null;
  const augmented = createAugmentedMatrix(matrix);
  for (let pivot = 0; pivot < 4; pivot += 1) {
    if (!reduceMatrixPivot(augmented, pivot)) return null;
  }
  for (let index = 0; index < 16; index += 1) {
    result[index] = augmented[(index % 4) * 8 + 4 + Math.floor(index / 4)]!;
    if (!Number.isFinite(result[index])) return null;
  }
  return result;
}

function matrixIsValid(matrix: Matrix4): boolean {
  try {
    assertMat4(matrix);
    return true;
  } catch {
    return false;
  }
}

function createAugmentedMatrix(matrix: Matrix4): Float64Array {
  const augmented = new Float64Array(32);
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) augmented[row * 8 + column] = matrix[column * 4 + row]!;
    augmented[row * 8 + 4 + row] = 1;
  }
  return augmented;
}

function reduceMatrixPivot(augmented: Float64Array, pivot: number): boolean {
  const row = findPivotRow(augmented, pivot);
  if (row === -1) return false;
  swapMatrixRows(augmented, row, pivot);
  if (!normalizeMatrixRow(augmented, pivot)) return false;
  for (let other = 0; other < 4; other += 1) {
    if (other !== pivot && !eliminateMatrixRow(augmented, other, pivot)) return false;
  }
  return true;
}

function findPivotRow(augmented: Float64Array, pivot: number): number {
  let selected = -1;
  let maximum = 0;
  for (let row = pivot; row < 4; row += 1) {
    const magnitude = Math.abs(augmented[row * 8 + pivot]!);
    if (magnitude > maximum) {
      maximum = magnitude;
      selected = row;
    }
  }
  return selected;
}

function swapMatrixRows(augmented: Float64Array, left: number, right: number): void {
  if (left === right) return;
  for (let column = 0; column < 8; column += 1) {
    const previous = augmented[left * 8 + column]!;
    augmented[left * 8 + column] = augmented[right * 8 + column]!;
    augmented[right * 8 + column] = previous;
  }
}

function normalizeMatrixRow(augmented: Float64Array, pivot: number): boolean {
  const offset = pivot * 8;
  const divisor = augmented[offset + pivot]!;
  for (let column = 0; column < 8; column += 1) {
    const value = augmented[offset + column]! / divisor;
    if (!Number.isFinite(value)) return false;
    augmented[offset + column] = value;
  }
  return true;
}

function eliminateMatrixRow(augmented: Float64Array, row: number, pivot: number): boolean {
  const offset = row * 8;
  const factor = augmented[offset + pivot]!;
  if (factor === 0) return true;
  for (let column = 0; column < 8; column += 1) {
    const value = augmented[offset + column]! - factor * augmented[pivot * 8 + column]!;
    if (!Number.isFinite(value)) return false;
    augmented[offset + column] = value;
  }
  return true;
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
