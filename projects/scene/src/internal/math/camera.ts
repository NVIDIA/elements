// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PreciseMat4, Quaternion, ScenePose, Vec3 } from '../types.js';
import { composePreciseMat4, multiplyPreciseMat4 } from './mat4.js';
import { normalizeQuaternion } from './quaternion.js';

export const DEFAULT_NEAR = 0.01;
export const DEFAULT_FAR = 10_000;

export type SceneCameraProjection =
  | { readonly mode: 'perspective'; readonly verticalFieldOfView: number; readonly near: number; readonly far: number }
  | { readonly mode: 'orthographic'; readonly frustumHeight: number; readonly near: number; readonly far: number };

export interface SceneCameraState {
  readonly pose: ScenePose;
  readonly projection: SceneCameraProjection;
}

/** Orbit-specific authoring state retained by the interactive camera runtime. */
export interface OrbitCameraState {
  target: CameraTarget;
  offset: CameraOffset;
  projection: SceneCameraProjection;
}

export interface CameraTarget {
  position: Vec3;
  heading: number;
}

interface CameraOffset {
  distance: number;
  polarAngle: number;
  azimuth: number;
}

export type SceneCameraChangeSource = 'pointer' | 'keyboard' | 'wheel' | 'touch';

export interface SceneCameraChangeDetail {
  readonly cameraState: SceneCameraState;
  readonly source: SceneCameraChangeSource;
}

export const DEFAULT_ORBIT_CAMERA_STATE: OrbitCameraState = Object.freeze({
  target: Object.freeze({ position: Object.freeze([0, 0, 0] as Vec3) as Vec3, heading: 0 }),
  offset: Object.freeze({ distance: 12, polarAngle: Math.PI / 4, azimuth: -Math.PI / 2 }),
  projection: Object.freeze({
    mode: 'perspective' as const,
    verticalFieldOfView: Math.PI / 4,
    near: DEFAULT_NEAR,
    far: DEFAULT_FAR
  })
});

export const DEFAULT_CAMERA_STATE: SceneCameraState = freezeCameraState(
  orbitCameraStateToCameraState(DEFAULT_ORBIT_CAMERA_STATE)
);

export function copyCameraState(state: SceneCameraState): SceneCameraState {
  assertCameraState(state);
  return {
    pose: {
      position: [...state.pose.position],
      orientation: [...state.pose.orientation]
    },
    projection: copyCameraProjection(state.projection)
  };
}

export function copyOrbitCameraState(state: OrbitCameraState): OrbitCameraState {
  assertOrbitCameraState(state);
  return {
    target: { position: [...state.target.position], heading: state.target.heading },
    offset: { distance: state.offset.distance, polarAngle: state.offset.polarAngle, azimuth: state.offset.azimuth },
    projection: copyCameraProjection(state.projection)
  };
}

function copyCameraProjection(projection: SceneCameraProjection): SceneCameraProjection {
  return projection.mode === 'perspective'
    ? {
        mode: 'perspective',
        verticalFieldOfView: projection.verticalFieldOfView,
        near: projection.near,
        far: projection.far
      }
    : { mode: 'orthographic', frustumHeight: projection.frustumHeight, near: projection.near, far: projection.far };
}

export function assertCameraState(state: SceneCameraState): void {
  if (typeof state !== 'object' || state === null) throw new TypeError('Camera state must be an object.');
  assertCameraPose(state.pose);
  assertProjection(state.projection);
}

function assertCameraPose(pose: ScenePose): void {
  if (typeof pose !== 'object' || pose === null) throw new TypeError('Camera pose must be an object.');
  assertVec3(pose.position, 'pose.position');
  normalizeQuaternion(pose.orientation);
}

function normalizeCameraPose(pose: ScenePose): ScenePose {
  assertCameraPose(pose);
  return {
    position: [...pose.position],
    orientation: normalizeQuaternion(pose.orientation)
  };
}

export function assertOrbitCameraState(state: OrbitCameraState): void {
  if (typeof state !== 'object' || state === null) throw new TypeError('Orbit camera state must be an object.');
  assertTarget(state.target);
  assertOffset(state.offset);
  assertProjection(state.projection);
}

function assertTarget(target: CameraTarget): void {
  if (typeof target !== 'object' || target === null) throw new TypeError('Camera target must be an object.');
  assertVec3(target.position, 'target.position');
  assertFinite(target.heading, 'target.heading');
}

function assertOffset(offset: CameraOffset): void {
  if (typeof offset !== 'object' || offset === null) throw new TypeError('Camera offset must be an object.');
  assertFinite(offset.distance, 'offset.distance');
  assertFinite(offset.polarAngle, 'offset.polarAngle');
  assertFinite(offset.azimuth, 'offset.azimuth');
  if (offset.distance <= 0) throw new RangeError('Camera distance must be greater than zero.');
  if (offset.polarAngle < 0 || offset.polarAngle > Math.PI)
    throw new RangeError('Camera polarAngle must be in [0, π].');
}

function assertProjection(projection: SceneCameraProjection): void {
  if (typeof projection !== 'object' || projection === null)
    throw new TypeError('Camera projection must be an object.');
  assertClipping(projection.near, projection.far);
  if (projection.mode === 'perspective') {
    assertFinite(projection.verticalFieldOfView, 'projection.verticalFieldOfView');
    if (projection.verticalFieldOfView <= 0 || projection.verticalFieldOfView >= Math.PI) {
      throw new RangeError('Perspective verticalFieldOfView must be in (0, π).');
    }
  } else if (projection.mode === 'orthographic') {
    assertFinite(projection.frustumHeight, 'projection.frustumHeight');
    if (projection.frustumHeight <= 0) throw new RangeError('Frustum height must be greater than zero.');
  } else {
    throw new TypeError('Camera projection mode is invalid.');
  }
}

function assertClipping(near: number, far: number): void {
  if (!Number.isFinite(near) || !Number.isFinite(far) || near <= 0 || near >= far) {
    throw new RangeError('Camera clipping distances must be finite and satisfy 0 < near < far.');
  }
}

export function cameraEye(state: OrbitCameraState): Vec3 {
  assertOrbitCameraState(state);
  const azimuth = state.target.heading + state.offset.azimuth;
  const radius = state.offset.distance * Math.sin(state.offset.polarAngle);
  return [
    state.target.position[0] + radius * Math.cos(azimuth),
    state.target.position[1] + radius * Math.sin(azimuth),
    state.target.position[2] + state.offset.distance * Math.cos(state.offset.polarAngle)
  ];
}

export function orbitCameraStateToCameraState(state: OrbitCameraState): SceneCameraState {
  assertOrbitCameraState(state);
  const position = cameraEye(state);
  const azimuth = state.target.heading + state.offset.azimuth;
  const forward = normalize([
    state.target.position[0] - position[0],
    state.target.position[1] - position[1],
    state.target.position[2] - position[2]
  ]);
  const referenceUp: Vec3 =
    Math.abs(Math.sin(state.offset.polarAngle)) < 1e-4 ? [Math.cos(azimuth), Math.sin(azimuth), 0] : [0, 0, 1];
  const right = normalize(cross(forward, referenceUp));
  const up = cross(right, forward);
  const down: Vec3 = [-up[0], -up[1], -up[2]];
  return {
    pose: { position, orientation: quaternionFromBasis(right, down, forward) },
    projection: copyCameraProjection(state.projection)
  };
}

export function createCameraViewProjection(state: SceneCameraState, aspect: number): PreciseMat4 {
  assertCameraState(state);
  if (!Number.isFinite(aspect) || aspect <= 0) throw new RangeError('Camera aspect must be positive and finite.');
  const view = createCameraViewMatrix(state.pose);
  const projection =
    state.projection.mode === 'perspective'
      ? createPerspectiveMatrix(
          state.projection.verticalFieldOfView,
          aspect,
          state.projection.near,
          state.projection.far
        )
      : createOrthographicMatrix(state.projection.frustumHeight, aspect, state.projection.near, state.projection.far);
  return multiplyPreciseMat4(projection, view);
}

/** Builds a right-handed view matrix from a world-from-optical-camera pose. */
export function createCameraViewMatrix(pose: ScenePose): PreciseMat4 {
  const normalized = normalizeCameraPose(pose);
  const worldFromCamera = composePreciseMat4(normalized.position, normalized.orientation);
  const right: Vec3 = [worldFromCamera[0]!, worldFromCamera[1]!, worldFromCamera[2]!];
  const down: Vec3 = [worldFromCamera[4]!, worldFromCamera[5]!, worldFromCamera[6]!];
  const forward: Vec3 = [worldFromCamera[8]!, worldFromCamera[9]!, worldFromCamera[10]!];
  const up: Vec3 = [-down[0], -down[1], -down[2]];
  const { position } = normalized;
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
    -dot(right, position),
    -dot(up, position),
    dot(forward, position),
    1
  ]);
}

// eslint-disable-next-line max-params -- @hotpath Per-frame projection construction avoids allocating an options object.
export function createPerspectiveMatrix(
  verticalFieldOfView: number,
  aspect: number,
  near: number,
  far: number
): PreciseMat4 {
  if (!Number.isFinite(verticalFieldOfView) || verticalFieldOfView <= 0 || verticalFieldOfView >= Math.PI)
    throw new RangeError('Perspective verticalFieldOfView must be in (0, π).');
  if (!Number.isFinite(aspect) || aspect <= 0) throw new RangeError('Camera aspect must be positive and finite.');
  assertClipping(near, far);
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

// eslint-disable-next-line max-params -- @hotpath Per-frame projection construction avoids allocating an options object.
export function createOrthographicMatrix(
  frustumHeight: number,
  aspect: number,
  near: number,
  far: number
): PreciseMat4 {
  if (!Number.isFinite(frustumHeight) || frustumHeight <= 0)
    throw new RangeError('Frustum height must be greater than zero.');
  if (!Number.isFinite(aspect) || aspect <= 0) throw new RangeError('Camera aspect must be positive and finite.');
  assertClipping(near, far);
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

export function clampOrbit(value: number, minimum: number, maximum: number): number {
  if (![value, minimum, maximum].every(Number.isFinite) || minimum > maximum)
    throw new RangeError('Invalid orbit limits.');
  return Math.min(maximum, Math.max(minimum, value));
}

interface OrbitDistanceLimits {
  readonly maxDistance: number;
  readonly minDistance: number;
}

const DEFAULT_ORBIT_DISTANCE_LIMITS: OrbitDistanceLimits = { maxDistance: 200, minDistance: 0.5 };

export function applyOrbitDrag(
  state: OrbitCameraState,
  movement: { readonly movementX: number; readonly movementY: number },
  limits: OrbitDistanceLimits = DEFAULT_ORBIT_DISTANCE_LIMITS
): OrbitCameraState {
  const { movementX, movementY } = movement;
  if (!Number.isFinite(movementX) || !Number.isFinite(movementY))
    throw new RangeError('Pointer movement must be finite.');
  const next = copyOrbitCameraState(state);
  next.offset.azimuth -= movementX * 0.005;
  next.offset.polarAngle = applyInteractiveOrbitPitch(next.offset.polarAngle, movementY * 0.005);
  next.offset.distance = clampOrbit(next.offset.distance, limits.minDistance, limits.maxDistance);
  return next;
}

export function applyOrbitWheel(
  state: OrbitCameraState,
  deltaPixels: number,
  limits: OrbitDistanceLimits = DEFAULT_ORBIT_DISTANCE_LIMITS
): OrbitCameraState {
  if (!Number.isFinite(deltaPixels)) throw new RangeError('Wheel delta must be finite.');
  return applyOrbitZoom(state, state.offset.distance * Math.exp(deltaPixels * 0.001), limits);
}

export function applyOrbitZoom(
  state: OrbitCameraState,
  distance: number,
  limits: OrbitDistanceLimits = DEFAULT_ORBIT_DISTANCE_LIMITS
): OrbitCameraState {
  if (!Number.isFinite(distance)) throw new RangeError('Orbit distance must be finite.');
  const next = copyOrbitCameraState(state);
  next.offset.distance = clampOrbit(distance, limits.minDistance, limits.maxDistance);
  if (next.projection.mode === 'orthographic') {
    next.projection = {
      ...next.projection,
      frustumHeight: next.projection.frustumHeight * (next.offset.distance / state.offset.distance)
    };
  }
  return next;
}

export function applyOrbitKey(
  state: OrbitCameraState,
  key: string,
  limits: OrbitDistanceLimits = DEFAULT_ORBIT_DISTANCE_LIMITS
): OrbitCameraState | null {
  if (key === '+' || key === '=') return applyOrbitZoom(state, state.offset.distance / 1.1, limits);
  if (key === '-') return applyOrbitZoom(state, state.offset.distance * 1.1, limits);
  const next = copyOrbitCameraState(state);
  const angle = Math.PI / 36;
  if (key === 'ArrowLeft') next.offset.azimuth -= angle;
  else if (key === 'ArrowRight') next.offset.azimuth += angle;
  else if (key === 'ArrowUp') next.offset.polarAngle = applyInteractiveOrbitPitch(next.offset.polarAngle, -angle);
  else if (key === 'ArrowDown') next.offset.polarAngle = applyInteractiveOrbitPitch(next.offset.polarAngle, angle);
  else return null;
  next.offset.distance = clampOrbit(next.offset.distance, limits.minDistance, limits.maxDistance);
  return next;
}

function applyInteractiveOrbitPitch(polarAngle: number, delta: number): number {
  const next = polarAngle + delta;
  return next > 1e-4 && next < Math.PI - 1e-4 ? next : polarAngle;
}

export function pinchDistance(startDistance: number, relativeScale: number): number {
  if (!Number.isFinite(startDistance) || !Number.isFinite(relativeScale) || startDistance <= 0 || relativeScale <= 0) {
    throw new RangeError('Pinch distance inputs must be positive and finite.');
  }
  return startDistance / relativeScale;
}

export function quaternionFromBasis(right: Vec3, down: Vec3, forward: Vec3): Quaternion {
  const [m00, m10, m20] = right;
  const [m01, m11, m21] = down;
  const [m02, m12, m22] = forward;
  const trace = m00 + m11 + m22;
  let quaternion: Quaternion;
  if (trace > 0) {
    const scale = Math.sqrt(trace + 1) * 2;
    quaternion = [(m21 - m12) / scale, (m02 - m20) / scale, (m10 - m01) / scale, scale / 4];
  } else if (m00 > m11 && m00 > m22) {
    const scale = Math.sqrt(1 + m00 - m11 - m22) * 2;
    quaternion = [scale / 4, (m01 + m10) / scale, (m02 + m20) / scale, (m21 - m12) / scale];
  } else if (m11 > m22) {
    const scale = Math.sqrt(1 + m11 - m00 - m22) * 2;
    quaternion = [(m01 + m10) / scale, scale / 4, (m12 + m21) / scale, (m02 - m20) / scale];
  } else {
    const scale = Math.sqrt(1 + m22 - m00 - m11) * 2;
    quaternion = [(m02 + m20) / scale, (m12 + m21) / scale, scale / 4, (m10 - m01) / scale];
  }
  return normalizeQuaternion(quaternion);
}

function cross(left: Readonly<Vec3>, right: Readonly<Vec3>): Vec3 {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0]
  ];
}

function dot(left: Readonly<Vec3>, right: Readonly<Vec3>): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

function normalize(vector: Vec3): Vec3 {
  const length = Math.hypot(...vector);
  if (!Number.isFinite(length) || length === 0) throw new RangeError('Camera basis is degenerate.');
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite.`);
}

function assertVec3(value: unknown, name: string): asserts value is Vec3 {
  if (
    !Array.isArray(value) ||
    value.length !== 3 ||
    value.some(component => typeof component !== 'number' || !Number.isFinite(component))
  ) {
    throw new RangeError(`${name} must contain three finite values.`);
  }
}

function freezeCameraState(state: SceneCameraState): SceneCameraState {
  Object.freeze(state.pose.position);
  Object.freeze(state.pose.orientation);
  Object.freeze(state.pose);
  Object.freeze(state.projection);
  return Object.freeze(state);
}
