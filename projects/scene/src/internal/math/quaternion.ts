// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Quaternion } from '../types.js';

export const IDENTITY_QUATERNION: Readonly<Quaternion> = Object.freeze([0, 0, 0, 1]);

export function normalizeQuaternion(quaternion: Readonly<Quaternion>): Quaternion {
  const squaredLength = quaternionSquaredLength(quaternion);
  if (squaredLength === 0 || !Number.isFinite(squaredLength)) return normalizeExtremeQuaternion(quaternion);

  const inverseLength = squaredLength === 1 ? 1 : 1 / Math.sqrt(squaredLength);
  return inverseLength === 1
    ? [quaternion[0], quaternion[1], quaternion[2], quaternion[3]]
    : [
        quaternion[0] * inverseLength,
        quaternion[1] * inverseLength,
        quaternion[2] * inverseLength,
        quaternion[3] * inverseLength
      ];
}

// eslint-disable-next-line max-statements -- Scalar normalization avoids intermediate tuples in this hot path.
export function multiplyQuaternions(left: Readonly<Quaternion>, right: Readonly<Quaternion>): Quaternion {
  const leftSquaredLength = quaternionSquaredLength(left),
    rightSquaredLength = quaternionSquaredLength(right);
  let lx = left[0],
    ly = left[1],
    lz = left[2],
    lw = left[3],
    rx = right[0],
    ry = right[1],
    rz = right[2],
    rw = right[3];

  if (leftSquaredLength === 0 || !Number.isFinite(leftSquaredLength)) {
    [lx, ly, lz, lw] = normalizeExtremeQuaternion(left);
  } else if (leftSquaredLength !== 1) {
    const inverseLength = 1 / Math.sqrt(leftSquaredLength);
    lx *= inverseLength;
    ly *= inverseLength;
    lz *= inverseLength;
    lw *= inverseLength;
  }

  if (rightSquaredLength === 0 || !Number.isFinite(rightSquaredLength)) {
    [rx, ry, rz, rw] = normalizeExtremeQuaternion(right);
  } else if (rightSquaredLength !== 1) {
    const inverseLength = 1 / Math.sqrt(rightSquaredLength);
    rx *= inverseLength;
    ry *= inverseLength;
    rz *= inverseLength;
    rw *= inverseLength;
  }

  const x = lw * rx + lx * rw + ly * rz - lz * ry,
    y = lw * ry - lx * rz + ly * rw + lz * rx,
    z = lw * rz + lx * ry - ly * rx + lz * rw,
    w = lw * rw - lx * rx - ly * ry - lz * rz,
    squaredLength = x * x + y * y + z * z + w * w,
    inverseLength = squaredLength === 1 ? 1 : 1 / Math.sqrt(squaredLength);

  return inverseLength === 1
    ? [x, y, z, w]
    : [x * inverseLength, y * inverseLength, z * inverseLength, w * inverseLength];
}

function quaternionSquaredLength(quaternion: Readonly<Quaternion>): number {
  if (
    quaternion.length !== 4 ||
    !Number.isFinite(quaternion[0]) ||
    !Number.isFinite(quaternion[1]) ||
    !Number.isFinite(quaternion[2]) ||
    !Number.isFinite(quaternion[3])
  ) {
    throw new RangeError('Quaternion must contain 4 finite components.');
  }

  return (
    quaternion[0] * quaternion[0] +
    quaternion[1] * quaternion[1] +
    quaternion[2] * quaternion[2] +
    quaternion[3] * quaternion[3]
  );
}

function normalizeExtremeQuaternion(quaternion: Readonly<Quaternion>): Quaternion {
  const maximumComponent = Math.max(
    Math.abs(quaternion[0]),
    Math.abs(quaternion[1]),
    Math.abs(quaternion[2]),
    Math.abs(quaternion[3])
  );
  if (maximumComponent === 0) {
    throw new RangeError('Quaternion length must be greater than zero.');
  }

  const x = quaternion[0] / maximumComponent,
    y = quaternion[1] / maximumComponent,
    z = quaternion[2] / maximumComponent,
    w = quaternion[3] / maximumComponent,
    inverseLength = 1 / Math.sqrt(x * x + y * y + z * z + w * w);

  return [x * inverseLength, y * inverseLength, z * inverseLength, w * inverseLength];
}
