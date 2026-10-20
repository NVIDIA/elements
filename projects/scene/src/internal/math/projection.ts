// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { composePreciseMat4, multiplyMat4Vec4 } from './mat4.js';
import { normalizeQuaternion } from './quaternion.js';
import type { Matrix4, PreciseMat4, ScenePose, Vec3 } from './types.js';

interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

interface ProjectionRay {
  readonly origin: Vec3;
  readonly direction: Vec3;
}

/** Builds a right-handed view matrix from a world-from-optical-camera pose: right, down, forward. */
export function createCameraViewMatrix(pose: ScenePose): PreciseMat4 {
  const worldFromCamera = composePreciseMat4(pose.position, normalizeQuaternion(pose.orientation));
  const right: Vec3 = [worldFromCamera[0]!, worldFromCamera[1]!, worldFromCamera[2]!];
  const down: Vec3 = [worldFromCamera[4]!, worldFromCamera[5]!, worldFromCamera[6]!];
  const forward: Vec3 = [worldFromCamera[8]!, worldFromCamera[9]!, worldFromCamera[10]!];
  const up: Vec3 = [-down[0], -down[1], -down[2]];
  return new Float64Array([
    right[0],
    up[0],
    -forward[0],
    0,
    right[1],
    up[1],
    -forward[1],
    0,
    right[2],
    up[2],
    -forward[2],
    0,
    -dot(right, pose.position),
    -dot(up, pose.position),
    dot(forward, pose.position),
    1
  ]);
}

/** Builds a right-handed perspective matrix with WebGPU depth from zero at near to one at far. */
// eslint-disable-next-line max-params -- @hotpath Per-frame projection construction avoids allocating an options object.
export function createPerspectiveMatrix(
  verticalFieldOfView: number,
  aspect: number,
  near: number,
  far: number
): PreciseMat4 {
  if (!Number.isFinite(verticalFieldOfView) || verticalFieldOfView <= 0 || verticalFieldOfView >= Math.PI)
    throw new RangeError('Perspective verticalFieldOfView must be in (0, π).');
  assertAspect(aspect);
  assertClippingDistances(near, far);
  const focal = 1 / Math.tan(verticalFieldOfView / 2);
  return new Float64Array([
    focal / aspect,
    0,
    0,
    0,
    0,
    focal,
    0,
    0,
    0,
    0,
    far / (near - far),
    -1,
    0,
    0,
    (near * far) / (near - far),
    0
  ]);
}

/** Builds a right-handed orthographic matrix with WebGPU depth from zero at near to one at far. */
// eslint-disable-next-line max-params -- @hotpath Per-frame projection construction avoids allocating an options object.
export function createOrthographicMatrix(
  frustumHeight: number,
  aspect: number,
  near: number,
  far: number
): PreciseMat4 {
  if (!Number.isFinite(frustumHeight) || frustumHeight <= 0)
    throw new RangeError('Frustum height must be greater than zero.');
  assertAspect(aspect);
  assertClippingDistances(near, far);
  const width = frustumHeight * aspect;
  return new Float64Array([
    2 / width,
    0,
    0,
    0,
    0,
    2 / frustumHeight,
    0,
    0,
    0,
    0,
    1 / (near - far),
    0,
    0,
    0,
    near / (near - far),
    1
  ]);
}

export function assertClippingDistances(near: number, far: number): void {
  if (!Number.isFinite(near) || !Number.isFinite(far) || near <= 0 || near >= far) {
    throw new RangeError('Camera clipping distances must be finite and satisfy 0 < near < far.');
  }
}

function assertAspect(aspect: number): void {
  if (!Number.isFinite(aspect) || aspect <= 0) throw new RangeError('Camera aspect must be positive and finite.');
}

/** Converts top-left viewport coordinates to NDC, preserving zero-to-one depth. Callers supply positive sizes. */
export function viewportToNdc(point: Readonly<Vec3>, size: ViewportSize): Vec3 {
  return [(point[0] / size.width) * 2 - 1, 1 - (point[1] / size.height) * 2, point[2]];
}

/** Converts NDC to top-left viewport coordinates, preserving depth. Callers supply positive sizes. */
export function ndcToViewport(point: Readonly<Vec3>, size: ViewportSize): Vec3 {
  return [((point[0] + 1) / 2) * size.width, ((1 - point[1]) / 2) * size.height, point[2]];
}

/** Projects a point to NDC. Rejects nonfinite clip coordinates and nonpositive w; retains offscreen results. */
export function projectPoint(viewProjection: Matrix4, point: Readonly<Vec3>): Vec3 | null {
  const clip = multiplyMat4Vec4(viewProjection, [...point, 1]);
  if (!clip.every(Number.isFinite) || clip[3] <= 0) return null;
  return divideByW(clip);
}

/** Tests the closed WebGPU NDC volume: -1 <= x,y <= 1 and 0 <= depth <= 1. */
export function isInsideClipVolume(point: Readonly<Vec3>): boolean {
  const [x, y, depth] = point;
  return x >= -1 && x <= 1 && y >= -1 && y <= 1 && depth >= 0 && depth <= 1;
}

/** Unprojects NDC, rejecting nonfinite results and abs(w) below Number.EPSILON. Accepts either sign of w. */
export function unprojectPoint(inverseViewProjection: Matrix4, point: Readonly<Vec3>): Vec3 | null;
/** Divides depth samples by any nonzero w, preserves nonfinite results, and retains undivided xyz at zero w. */
export function unprojectPoint(inverseViewProjection: Matrix4, point: Readonly<Vec3>, policy: 'preserve-zero-w'): Vec3;
export function unprojectPoint(
  inverseViewProjection: Matrix4,
  point: Readonly<Vec3>,
  policy?: 'preserve-zero-w'
): Vec3 | null {
  const transformed = multiplyMat4Vec4(inverseViewProjection, [...point, 1]);
  if (policy === 'preserve-zero-w') return divideByW(transformed);
  if (!transformed.every(Number.isFinite) || Math.abs(transformed[3]) < Number.EPSILON) return null;
  const result = divideByW(transformed);
  return result.every(Number.isFinite) ? result : null;
}

/** Creates a unit world ray from the near plane through NDC xy, without clipping xy to the viewport. */
export function createProjectionRay(
  inverseViewProjection: Matrix4,
  point: readonly [number, number]
): ProjectionRay | null {
  const near = unprojectPoint(inverseViewProjection, [point[0], point[1], 0]);
  const far = unprojectPoint(inverseViewProjection, [point[0], point[1], 1]);
  if (!near || !far) return null;
  const direction: Vec3 = [far[0] - near[0], far[1] - near[1], far[2] - near[2]];
  const length = Math.hypot(...direction);
  if (!Number.isFinite(length) || length === 0) return null;
  return { origin: near, direction: [direction[0] / length, direction[1] / length, direction[2] / length] };
}

function divideByW(point: readonly [number, number, number, number]): Vec3 {
  const inverseW = point[3] === 0 ? 1 : 1 / point[3];
  return [point[0] * inverseW, point[1] * inverseW, point[2] * inverseW];
}

function dot(left: Readonly<Vec3>, right: Readonly<Vec3>): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}
