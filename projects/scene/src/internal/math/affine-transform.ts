// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { invertPreciseMat4 } from './mat4.js';
import type { Matrix4, Vec3 } from './types.js';

type VectorStorage = Float32Array | Float64Array | Vec3;

/**
 * Captures a finite column-major affine matrix for repeated position transforms.
 * Coefficients retain JavaScript precision independently of the input matrix.
 * Preparation takes constant time and space; each write allocates no storage.
 * Singular matrices are valid for positions. Perspective matrices require transformPointMat4.
 */
export class PreparedAffineTransform {
  readonly #positions: readonly number[];

  constructor(matrix: Matrix4) {
    assertAffineMatrix(matrix);
    this.#positions = [
      matrix[0]!,
      matrix[4]!,
      matrix[8]!,
      matrix[12]!,
      matrix[1]!,
      matrix[5]!,
      matrix[9]!,
      matrix[13]!,
      matrix[2]!,
      matrix[6]!,
      matrix[10]!,
      matrix[14]!
    ];
  }

  /**
   * Writes one xyz position from valid source and destination spans, returning the destination.
   * Callers validate finite inputs and output representability. Reads all coordinates before
   * writing, supporting overlapping spans. Rounding occurs only in the destination storage.
   */
  // eslint-disable-next-line max-params -- @hotpath Scalar offsets avoid allocating source and destination span wrappers.
  writePosition<T extends VectorStorage>(
    source: ArrayLike<number>,
    sourceOffset: number,
    target: T,
    targetOffset: number
  ): T {
    const x = source[sourceOffset]!,
      y = source[sourceOffset + 1]!,
      z = source[sourceOffset + 2]!;
    const values = this.#positions;
    target[targetOffset] = values[0]! * x + values[1]! * y + values[2]! * z + values[3]!;
    target[targetOffset + 1] = values[4]! * x + values[5]! * y + values[6]! * z + values[7]!;
    target[targetOffset + 2] = values[8]! * x + values[9]! * y + values[10]! * z + values[11]!;
    return target;
  }
}

/** Adds a captured inverse-transpose normal transform and reflection classification for mesh preparation. */
export class PreparedAffineGeometryTransform extends PreparedAffineTransform {
  readonly #normals: readonly number[];
  readonly mirrored: boolean;

  constructor(matrix: Matrix4) {
    super(matrix);
    const inverse = invertPreciseMat4(matrix);
    if (!inverse) throw new RangeError('Normal transforms require a nonsingular matrix with a finite inverse.');
    this.#normals = [
      inverse[0]!,
      inverse[1]!,
      inverse[2]!,
      inverse[4]!,
      inverse[5]!,
      inverse[6]!,
      inverse[8]!,
      inverse[9]!,
      inverse[10]!
    ];
    this.mirrored = isMirrored(matrix);
  }

  /**
   * Writes a unit inverse-transpose normal from valid xyz spans without allocating storage.
   * Callers validate finite inputs and transformed arithmetic. A zero normal becomes positive Z.
   * Supports overlapping spans and ignores translation.
   */
  // eslint-disable-next-line max-params -- @hotpath Scalar offsets avoid allocating source and destination span wrappers.
  writeNormal<T extends VectorStorage>(
    source: ArrayLike<number>,
    sourceOffset: number,
    target: T,
    targetOffset: number
  ): T {
    const x = source[sourceOffset]!,
      y = source[sourceOffset + 1]!,
      z = source[sourceOffset + 2]!;
    const values = this.#normals;
    const nx = values[0]! * x + values[1]! * y + values[2]! * z;
    const ny = values[3]! * x + values[4]! * y + values[5]! * z;
    const nz = values[6]! * x + values[7]! * y + values[8]! * z;
    const length = Math.hypot(nx, ny, nz);
    target[targetOffset] = length === 0 ? 0 : nx / length;
    target[targetOffset + 1] = length === 0 ? 0 : ny / length;
    target[targetOffset + 2] = length === 0 ? 1 : nz / length;
    return target;
  }
}

/** Checks finite affine coefficients, including transforms with singular linear parts. */
export function assertAffineMatrix(matrix: Matrix4): void {
  if (matrix.length !== 16 || !matrix.every(Number.isFinite)) {
    throw new RangeError('Affine matrices must contain 16 finite values.');
  }
  if (matrix[3] !== 0 || matrix[7] !== 0 || matrix[11] !== 0 || matrix[15] !== 1) {
    throw new RangeError('Affine matrices must have a final row of [0, 0, 0, 1].');
  }
}

// Positive column scaling preserves determinant sign without overflowing or underflowing uniform scales.
function isMirrored(matrix: Matrix4): boolean {
  const sx = Math.max(Math.abs(matrix[0]!), Math.abs(matrix[1]!), Math.abs(matrix[2]!));
  const sy = Math.max(Math.abs(matrix[4]!), Math.abs(matrix[5]!), Math.abs(matrix[6]!));
  const sz = Math.max(Math.abs(matrix[8]!), Math.abs(matrix[9]!), Math.abs(matrix[10]!));
  const a = matrix[0]! / sx,
    b = matrix[1]! / sx,
    c = matrix[2]! / sx;
  const d = matrix[4]! / sy,
    e = matrix[5]! / sy,
    f = matrix[6]! / sy;
  const g = matrix[8]! / sz,
    h = matrix[9]! / sz,
    i = matrix[10]! / sz;
  return a * (e * i - h * f) - d * (b * i - h * c) + g * (b * f - e * c) < 0;
}
