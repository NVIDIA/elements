// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { MarkerFields } from '../layouts/helpers.js';
import { normalizeQuaternion } from '../math/quaternion.js';
import type { Quaternion, Vec3 } from '../types.js';

export function parseVector(source: string, length: 3): Vec3 | null;
export function parseVector(source: string, length: 4): Quaternion | null;
export function parseVector(source: string, length: 3 | 4): Vec3 | Quaternion | null {
  const values = source.trim().split(/\s+/).map(Number);
  if (values.length !== length || values.some(value => !Number.isFinite(value))) {
    return null;
  }
  return length === 3 ? toVec3(values) : toQuaternion(values);
}

export function markerFromPointPair(from: Vec3, to: Vec3, color: MarkerFields['color']): MarkerFields {
  const direction: Vec3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
  const length = Math.hypot(...direction);
  if (length === 0) {
    throw new RangeError('Arrow endpoints must not be equal.');
  }
  const unit: Vec3 = [direction[0] / length, direction[1] / length, direction[2] / length];
  return {
    position: [...from],
    orientation: quaternionFromPositiveZ(unit),
    scale: [length, length, length],
    color
  };
}

function quaternionFromPositiveZ(direction: Vec3): Quaternion {
  if (direction[0] === 0 && direction[1] === 0 && direction[2] === 1) {
    return [0, 0, 0, 1];
  }
  if (direction[2] === -1) {
    return [1, 0, 0, 0];
  }
  const [x, y, z, w] = normalizeQuaternion([-direction[1], direction[0], 0, 1 + direction[2]]);
  return [canonicalZero(x), canonicalZero(y), canonicalZero(z), canonicalZero(w)];
}

function canonicalZero(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}

function toVec3(values: number[]): Vec3 | null {
  const [x, y, z] = values;
  return x === undefined || y === undefined || z === undefined ? null : [x, y, z];
}

function toQuaternion(values: number[]): Quaternion | null {
  const [x, y, z, w] = values;
  return x === undefined || y === undefined || z === undefined || w === undefined ? null : [x, y, z, w];
}
