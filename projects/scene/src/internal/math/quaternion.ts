// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Quaternion } from '../types.js';

export const IDENTITY_QUATERNION: Readonly<Quaternion> = Object.freeze([0, 0, 0, 1]);

export function normalizeQuaternion(quaternion: Readonly<Quaternion>): Quaternion {
  const [x, y, z, w] = quaternion;
  assertFiniteQuaternion(quaternion);

  const length = Math.hypot(x, y, z, w);
  if (length === 0) {
    throw new RangeError('Quaternion length must be greater than zero.');
  }

  return [x / length, y / length, z / length, w / length];
}

export function multiplyQuaternions(left: Readonly<Quaternion>, right: Readonly<Quaternion>): Quaternion {
  const [lx, ly, lz, lw] = normalizeQuaternion(left);
  const [rx, ry, rz, rw] = normalizeQuaternion(right);

  return normalizeQuaternion([
    lw * rx + lx * rw + ly * rz - lz * ry,
    lw * ry - lx * rz + ly * rw + lz * rx,
    lw * rz + lx * ry - ly * rx + lz * rw,
    lw * rw - lx * rx - ly * ry - lz * rz
  ]);
}

export function slerpQuaternions(
  startQuaternion: Readonly<Quaternion>,
  endQuaternion: Readonly<Quaternion>,
  amount: number
): Quaternion {
  if (!Number.isFinite(amount)) {
    throw new RangeError('Interpolation amount must be finite.');
  }

  const start = normalizeQuaternion(startQuaternion);
  let end = normalizeQuaternion(endQuaternion);
  let dot = dotQuaternion(start, end);

  if (dot < 0) {
    end = [-end[0], -end[1], -end[2], -end[3]];
    dot = -dot;
  }

  if (dot > 0.9995) {
    return normalizeQuaternion([
      start[0] + amount * (end[0] - start[0]),
      start[1] + amount * (end[1] - start[1]),
      start[2] + amount * (end[2] - start[2]),
      start[3] + amount * (end[3] - start[3])
    ]);
  }

  const theta = Math.acos(Math.min(1, Math.max(-1, dot)));
  const sinTheta = Math.sin(theta);
  const startWeight = Math.sin((1 - amount) * theta) / sinTheta;
  const endWeight = Math.sin(amount * theta) / sinTheta;

  return normalizeQuaternion([
    start[0] * startWeight + end[0] * endWeight,
    start[1] * startWeight + end[1] * endWeight,
    start[2] * startWeight + end[2] * endWeight,
    start[3] * startWeight + end[3] * endWeight
  ]);
}

function dotQuaternion(left: Readonly<Quaternion>, right: Readonly<Quaternion>): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2] + left[3] * right[3];
}

function assertFiniteQuaternion(quaternion: Readonly<Quaternion>): void {
  if (quaternion.length !== 4 || quaternion.some(value => !Number.isFinite(value))) {
    throw new RangeError('Quaternion must contain 4 finite components.');
  }
}
