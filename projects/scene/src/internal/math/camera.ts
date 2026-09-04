// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Mat4, Quaternion, Vec3 } from '../types.js';
import { composeMat4, multiplyMat4 } from './mat4.js';
import { normalizeQuaternion } from './quaternion.js';

export const DEFAULT_NEAR = 0.01;
export const DEFAULT_FAR = 10_000;

export type CameraProjection =
  | { readonly mode: 'perspective'; readonly fovy: number; readonly near: number; readonly far: number }
  | { readonly mode: 'ortho'; readonly frustumHeight: number; readonly near: number; readonly far: number };

export interface CameraPose {
  position: Vec3;
  orientation: Quaternion;
}

export interface CameraState {
  pose: CameraPose;
  projection: CameraProjection;
}

/** Orbit-specific authoring state retained by the interactive camera runtime. */
export interface OrbitCameraState {
  target: CameraTarget;
  offset: CameraOffset;
  projection: CameraProjection;
}

export interface CameraTarget {
  position: Vec3;
  heading: number;
}

export interface CameraOffset {
  distance: number;
  phi: number;
  theta: number;
}

export type CameraChangeSource = 'pointer' | 'keyboard' | 'wheel' | 'touch';

export interface SceneCameraChangeDetail {
  readonly cameraState: CameraState;
  readonly source: CameraChangeSource;
}

export const DEFAULT_ORBIT_CAMERA_STATE: OrbitCameraState = Object.freeze({
  target: Object.freeze({ position: Object.freeze([0, 0, 0] as Vec3) as Vec3, heading: 0 }),
  offset: Object.freeze({ distance: 12, phi: Math.PI / 4, theta: -Math.PI / 2 }),
  projection: Object.freeze({
    mode: 'perspective' as const,
    fovy: Math.PI / 4,
    near: DEFAULT_NEAR,
    far: DEFAULT_FAR
  })
});

export const DEFAULT_CAMERA_STATE: CameraState = freezeCameraState(
  orbitCameraStateToCameraState(DEFAULT_ORBIT_CAMERA_STATE)
);

export function copyCameraState(state: CameraState): CameraState {
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
    offset: { distance: state.offset.distance, phi: state.offset.phi, theta: state.offset.theta },
    projection: copyCameraProjection(state.projection)
  };
}

function copyCameraProjection(projection: CameraProjection): CameraProjection {
  return projection.mode === 'perspective'
    ? { mode: 'perspective', fovy: projection.fovy, near: projection.near, far: projection.far }
    : { mode: 'ortho', frustumHeight: projection.frustumHeight, near: projection.near, far: projection.far };
}

export function assertCameraState(state: CameraState): void {
  if (typeof state !== 'object' || state === null) throw new TypeError('Camera state must be an object.');
  assertCameraPose(state.pose);
  assertProjection(state.projection);
}

function assertCameraPose(pose: CameraPose): void {
  if (typeof pose !== 'object' || pose === null) throw new TypeError('Camera pose must be an object.');
  assertVec3(pose.position, 'pose.position');
  normalizeQuaternion(pose.orientation);
}

function normalizeCameraPose(pose: CameraPose): CameraPose {
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
  assertFinite(offset.phi, 'offset.phi');
  assertFinite(offset.theta, 'offset.theta');
  if (offset.distance <= 0) throw new RangeError('Camera distance must be greater than zero.');
  if (offset.phi < 0 || offset.phi > Math.PI) throw new RangeError('Camera phi must be in [0, π].');
}

function assertProjection(projection: CameraProjection): void {
  if (typeof projection !== 'object' || projection === null)
    throw new TypeError('Camera projection must be an object.');
  assertClipping(projection.near, projection.far);
  if (projection.mode === 'perspective') {
    assertFinite(projection.fovy, 'projection.fovy');
    if (projection.fovy <= 0 || projection.fovy >= Math.PI) {
      throw new RangeError('Perspective fovy must be in (0, π).');
    }
  } else if (projection.mode === 'ortho') {
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
  const azimuth = state.target.heading + state.offset.theta;
  const radius = state.offset.distance * Math.sin(state.offset.phi);
  return [
    state.target.position[0] + radius * Math.cos(azimuth),
    state.target.position[1] + radius * Math.sin(azimuth),
    state.target.position[2] + state.offset.distance * Math.cos(state.offset.phi)
  ];
}

export function orbitCameraStateToCameraState(state: OrbitCameraState): CameraState {
  assertOrbitCameraState(state);
  const position = cameraEye(state);
  const forward = normalize([
    state.target.position[0] - position[0],
    state.target.position[1] - position[1],
    state.target.position[2] - position[2]
  ]);
  const referenceUp: Vec3 = Math.abs(Math.sin(state.offset.phi)) < 1e-4 ? [1, 0, 0] : [0, 0, 1];
  const right = normalize(cross(forward, referenceUp));
  const up = cross(right, forward);
  const down: Vec3 = [-up[0], -up[1], -up[2]];
  return {
    pose: { position, orientation: quaternionFromBasis(right, down, forward) },
    projection: copyCameraProjection(state.projection)
  };
}

export function createCameraViewProjection(state: CameraState, aspect: number): Mat4 {
  assertCameraState(state);
  if (!Number.isFinite(aspect) || aspect <= 0) throw new RangeError('Camera aspect must be positive and finite.');
  const view = createCameraViewMatrix(state.pose);
  const projection =
    state.projection.mode === 'perspective'
      ? createPerspectiveMatrix(state.projection.fovy, aspect, state.projection.near, state.projection.far)
      : createOrthographicMatrix(state.projection.frustumHeight, aspect, state.projection.near, state.projection.far);
  return multiplyMat4(projection, view);
}

/** Builds a right-handed view matrix from a world-from-optical-camera pose. */
export function createCameraViewMatrix(pose: CameraPose): Mat4 {
  const normalized = normalizeCameraPose(pose);
  const worldFromCamera = composeMat4(normalized.position, normalized.orientation);
  const right: Vec3 = [worldFromCamera[0] ?? 1, worldFromCamera[1] ?? 0, worldFromCamera[2] ?? 0];
  const down: Vec3 = [worldFromCamera[4] ?? 0, worldFromCamera[5] ?? 1, worldFromCamera[6] ?? 0];
  const forward: Vec3 = [worldFromCamera[8] ?? 0, worldFromCamera[9] ?? 0, worldFromCamera[10] ?? 1];
  const up: Vec3 = [-down[0], -down[1], -down[2]];
  const { position } = normalized;
  return new Float32Array([
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

// eslint-disable-next-line max-params -- Projection construction requires each independently validated scalar.
export function createPerspectiveMatrix(fovy: number, aspect: number, near: number, far: number): Mat4 {
  if (!Number.isFinite(fovy) || fovy <= 0 || fovy >= Math.PI)
    throw new RangeError('Perspective fovy must be in (0, π).');
  if (!Number.isFinite(aspect) || aspect <= 0) throw new RangeError('Camera aspect must be positive and finite.');
  assertClipping(near, far);
  const focal = 1 / Math.tan(fovy / 2);
  return new Float32Array([
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

// eslint-disable-next-line max-params -- Projection construction requires each independently validated scalar.
export function createOrthographicMatrix(frustumHeight: number, aspect: number, near: number, far: number): Mat4 {
  if (!Number.isFinite(frustumHeight) || frustumHeight <= 0)
    throw new RangeError('Frustum height must be greater than zero.');
  if (!Number.isFinite(aspect) || aspect <= 0) throw new RangeError('Camera aspect must be positive and finite.');
  assertClipping(near, far);
  const width = frustumHeight * aspect;
  return new Float32Array([
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

// eslint-disable-next-line max-params -- Fixed pointer gesture inputs and orbit limits.
export function applyOrbitDrag(
  state: OrbitCameraState,
  movementX: number,
  movementY: number,
  minDistance = 0.5,
  maxDistance = 200
): OrbitCameraState {
  if (!Number.isFinite(movementX) || !Number.isFinite(movementY))
    throw new RangeError('Pointer movement must be finite.');
  const next = copyOrbitCameraState(state);
  next.offset.theta -= movementX * 0.005;
  next.offset.phi = applyInteractiveOrbitPitch(next.offset.phi, movementY * 0.005);
  next.offset.distance = clampOrbit(next.offset.distance, minDistance, maxDistance);
  return next;
}

// eslint-disable-next-line max-params -- Fixed wheel input and orbit limits.
export function applyOrbitWheel(
  state: OrbitCameraState,
  deltaPixels: number,
  minDistance = 0.5,
  maxDistance = 200
): OrbitCameraState {
  if (!Number.isFinite(deltaPixels)) throw new RangeError('Wheel delta must be finite.');
  return applyOrbitZoom(state, state.offset.distance * Math.exp(deltaPixels * 0.001), minDistance, maxDistance);
}

// eslint-disable-next-line max-params -- Fixed orbit distance input and limits.
export function applyOrbitZoom(
  state: OrbitCameraState,
  distance: number,
  minDistance = 0.5,
  maxDistance = 200
): OrbitCameraState {
  if (!Number.isFinite(distance)) throw new RangeError('Orbit distance must be finite.');
  const next = copyOrbitCameraState(state);
  next.offset.distance = clampOrbit(distance, minDistance, maxDistance);
  if (next.projection.mode === 'ortho') {
    next.projection = {
      ...next.projection,
      frustumHeight: next.projection.frustumHeight * (next.offset.distance / state.offset.distance)
    };
  }
  return next;
}

// eslint-disable-next-line max-params -- Fixed key input and orbit limits.
export function applyOrbitKey(
  state: OrbitCameraState,
  key: string,
  minDistance = 0.5,
  maxDistance = 200
): OrbitCameraState | null {
  if (key === '+' || key === '=') return applyOrbitZoom(state, state.offset.distance / 1.1, minDistance, maxDistance);
  if (key === '-') return applyOrbitZoom(state, state.offset.distance * 1.1, minDistance, maxDistance);
  const next = copyOrbitCameraState(state);
  const angle = Math.PI / 36;
  if (key === 'ArrowLeft') next.offset.theta -= angle;
  else if (key === 'ArrowRight') next.offset.theta += angle;
  else if (key === 'ArrowUp') next.offset.phi = applyInteractiveOrbitPitch(next.offset.phi, -angle);
  else if (key === 'ArrowDown') next.offset.phi = applyInteractiveOrbitPitch(next.offset.phi, angle);
  else return null;
  next.offset.distance = clampOrbit(next.offset.distance, minDistance, maxDistance);
  return next;
}

function applyInteractiveOrbitPitch(phi: number, delta: number): number {
  const next = phi + delta;
  return next > 1e-4 && next < Math.PI - 1e-4 ? next : phi;
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

function cross(left: Vec3, right: Vec3): Vec3 {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0]
  ];
}

function dot(left: Vec3, right: Vec3): number {
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

function freezeCameraState(state: CameraState): CameraState {
  Object.freeze(state.pose.position);
  Object.freeze(state.pose.orientation);
  Object.freeze(state.pose);
  Object.freeze(state.projection);
  return Object.freeze(state);
}
