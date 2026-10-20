// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Quaternion, Vec3 } from './types.js';

export const IDENTITY_QUATERNION: Readonly<Quaternion> = Object.freeze([0, 0, 0, 1]);

/**
 * Converts URDF fixed-axis roll, pitch, and yaw radians, applied about parent X, then Y, then Z,
 * to the XYZW quaternion that Scene orientation properties accept. Throws a TypeError unless the
 * input holds exactly three finite numbers.
 */
export function quaternionFromRpy(rpy: Readonly<Vec3>): Quaternion {
  if (
    !Array.isArray(rpy) ||
    rpy.length !== 3 ||
    !rpy.every(value => typeof value === 'number' && Number.isFinite(value))
  )
    throw new TypeError('rpy must contain three finite numbers.');
  const [roll, pitch, yaw] = rpy;
  const sr = Math.sin(roll / 2),
    cr = Math.cos(roll / 2),
    sp = Math.sin(pitch / 2),
    cp = Math.cos(pitch / 2),
    sy = Math.sin(yaw / 2),
    cy = Math.cos(yaw / 2);
  return [
    sr * cp * cy - cr * sp * sy,
    cr * sp * cy + sr * cp * sy,
    cr * cp * sy - sr * sp * cy,
    cr * cp * cy + sr * sp * sy
  ];
}

/** Rotates a finite vector with an already normalized quaternion, without validating or normalizing it. */
export function rotateVectorByQuaternion(vector: Readonly<Vec3>, quaternion: Readonly<Quaternion>): Vec3 {
  const [x, y, z] = vector;
  const [qx, qy, qz, qw] = quaternion;
  const tx = 2 * (qy * z - qz * y);
  const ty = 2 * (qz * x - qx * z);
  const tz = 2 * (qx * y - qy * x);
  return [x + qw * tx + qy * tz - qz * ty, y + qw * ty + qz * tx - qx * tz, z + qw * tz + qx * ty - qy * tx];
}

/** Shader rotation with the same normalized-quaternion precondition as the CPU kernel. */
export const ROTATE_BY_QUATERNION_WGSL = /* wgsl */ `
fn rotateByQuaternion(q: vec4f, value: vec3f) -> vec3f {
  return value + 2.0 * cross(q.xyz, cross(q.xyz, value) + q.w * value);
}
`;

export function normalizeQuaternion(quaternion: Readonly<Quaternion>): Quaternion {
  return normalizeQuaternionInto(quaternion, [0, 0, 0, 0]);
}

/**
 * Writes `normalizeQuaternion` into caller-owned storage and returns that storage. Reads every component before
 * writing, so the result may alias the input. Squared lengths that neither overflow nor underflow allocate nothing.
 */
export function normalizeQuaternionInto<T extends Quaternion | Float64Array>(
  quaternion: Readonly<Quaternion>,
  result: T
): T {
  const squaredLength = quaternionSquaredLength(quaternion);
  const source =
    squaredLength === 0 || !Number.isFinite(squaredLength) ? normalizeExtremeQuaternion(quaternion) : quaternion;
  const inverseLength = source !== quaternion || squaredLength === 1 ? 1 : 1 / Math.sqrt(squaredLength);
  const x = source[0],
    y = source[1],
    z = source[2],
    w = source[3];
  result[0] = x * inverseLength;
  result[1] = y * inverseLength;
  result[2] = z * inverseLength;
  result[3] = w * inverseLength;
  return result;
}

// eslint-disable-next-line max-statements -- @hotpath Scalar normalization avoids intermediate tuples in this hot path.
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
