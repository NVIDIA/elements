// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Matrix4, Vec3 } from './types.js';
import { transformPointMat4 } from './mat4.js';
import { assertAffineMatrix } from './affine-transform.js';

/** A conservative world-space axis-aligned box at JavaScript numeric precision. */
export interface SceneBounds {
  readonly minimum: Readonly<Vec3>;
  readonly maximum: Readonly<Vec3>;
}

/**
 * Extends distinct caller-owned xyz minima and maxima with a finite box's affine image.
 * Destinations contain existing bounds or positive minima and negative maxima at infinity.
 * Endpoint products retain corner evaluation order at JavaScript precision, with 18 multiplications
 * and no temporary storage. Singular transforms are valid. Reads all source coordinates before
 * writing, allowing destinations to alias the source bounds. Upper zero bounds become positive zero,
 * matching point accumulation. Callers supply valid destination tuples.
 */
// eslint-disable-next-line max-params -- @hotpath Separate destination tuples avoid allocating a wrapper for every box.
export function extendAffineBounds(bounds: SceneBounds, matrix: Matrix4, minimum: Vec3, maximum: Vec3): void {
  assertAffineMatrix(matrix);
  if (minimum === maximum) throw new RangeError('Bounds destination tuples must be distinct.');
  const minimumX = bounds.minimum[0],
    minimumY = bounds.minimum[1],
    minimumZ = bounds.minimum[2],
    maximumX = bounds.maximum[0],
    maximumY = bounds.maximum[1],
    maximumZ = bounds.maximum[2];
  for (let axis = 0; axis < 3; axis += 1) {
    const x = matrix[axis]!,
      y = matrix[axis + 4]!,
      z = matrix[axis + 8]!,
      translation = matrix[axis + 12]!;
    const firstX = x * minimumX,
      lastX = x * maximumX,
      firstY = y * minimumY,
      lastY = y * maximumY,
      firstZ = z * minimumZ,
      lastZ = z * maximumZ;
    const lower = Math.min(firstX, lastX) + Math.min(firstY, lastY) + Math.min(firstZ, lastZ) + translation;
    const upper = Math.max(firstX, lastX) + Math.max(firstY, lastY) + Math.max(firstZ, lastZ) + translation;
    if (!Number.isFinite(lower) || !Number.isFinite(upper)) {
      throw new RangeError('Bounds arithmetic must remain finite.');
    }
    minimum[axis] = Math.min(minimum[axis]!, lower);
    maximum[axis] = Math.max(maximum[axis]!, upper) + 0;
  }
}

const SQRT_3 = Math.sqrt(3);

/**
 * Returns the radius of an origin-centered sphere that encloses a box after any rotation and any per-axis scale of
 * magnitude at most one: the square root of 3 times the box's largest absolute coordinate. At unit scale, it equals
 * the farthest corner distance when every axis reaches that coordinate, as Scene primitives do.
 */
export function unitScaleEnclosingRadius(bounds: SceneBounds): number {
  const { minimum, maximum } = bounds;
  return (
    SQRT_3 *
    Math.max(
      Math.abs(minimum[0]),
      Math.abs(minimum[1]),
      Math.abs(minimum[2]),
      Math.abs(maximum[0]),
      Math.abs(maximum[1]),
      Math.abs(maximum[2])
    )
  );
}

/**
 * Multiplies a `unitScaleEnclosingRadius` by a record's largest absolute scale, which encloses the scaled box under
 * any rotation without a square root per record. Shaders use `SCALED_ENCLOSING_RADIUS_WGSL` at float32 precision.
 */
// eslint-disable-next-line max-params -- @hotpath Scalar scale components avoid allocating one tuple per record.
export function scaledEnclosingRadius(unitRadius: number, scaleX: number, scaleY: number, scaleZ: number): number {
  return unitRadius * Math.max(Math.abs(scaleX), Math.abs(scaleY), Math.abs(scaleZ));
}

/** Shader form of `scaledEnclosingRadius`; float32 overflow yields an infinite, conservative radius. */
export const SCALED_ENCLOSING_RADIUS_WGSL = /* wgsl */ `
fn nve_scaled_enclosing_radius(unitRadius: f32, scale: vec3f) -> f32 {
  let magnitude = abs(scale);
  return unitRadius * max(magnitude.x, max(magnitude.y, magnitude.z));
}
`;

/** Accumulates geometry without rounding frame translations to GPU precision. */
export class BoundsAccumulator {
  readonly #minimum: Vec3 = [Infinity, Infinity, Infinity];
  readonly #maximum: Vec3 = [-Infinity, -Infinity, -Infinity];

  include(point: Readonly<Vec3>, radius = 0): void {
    for (let axis = 0; axis < 3; axis++) {
      const value = point[axis]!;
      const minimum = value - radius;
      const maximum = value + radius;
      if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) {
        throw new RangeError('Bounds arithmetic must remain finite.');
      }
      this.#minimum[axis] = Math.min(this.#minimum[axis]!, minimum);
      this.#maximum[axis] = Math.max(this.#maximum[axis]!, maximum);
    }
  }

  includeBox(bounds: SceneBounds, matrix: Matrix4): void {
    if (matrix[3] !== 0 || matrix[7] !== 0 || matrix[11] !== 0 || matrix[15] !== 1) {
      for (const corner of boundsCorners(bounds)) this.include(transformPointMat4(matrix, corner));
      return;
    }
    extendAffineBounds(bounds, matrix, this.#minimum, this.#maximum);
  }

  get bounds(): SceneBounds | null {
    if (!Number.isFinite(this.#minimum[0])) return null;
    return Object.freeze({
      minimum: Object.freeze([...this.#minimum] as Vec3),
      maximum: Object.freeze([...this.#maximum] as Vec3)
    });
  }
}

/** Iterates the eight corners, including repeated corners of degenerate boxes. */
export function* boundsCorners(bounds: SceneBounds): Generator<Vec3> {
  for (const x of [bounds.minimum[0], bounds.maximum[0]]) {
    for (const y of [bounds.minimum[1], bounds.maximum[1]]) {
      for (const z of [bounds.minimum[2], bounds.maximum[2]]) yield [x, y, z];
    }
  }
}
