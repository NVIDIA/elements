// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Matrix4, Vec3 } from './types.js';
import { transformPointMat4 } from './mat4.js';

/** A conservative world-space axis-aligned box at JavaScript numeric precision. */
export interface SceneBounds {
  readonly minimum: Readonly<Vec3>;
  readonly maximum: Readonly<Vec3>;
}

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
    for (const corner of boundsCorners(bounds)) this.include(transformPointMat4(matrix, corner));
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
