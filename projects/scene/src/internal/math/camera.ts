// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Mat4, Vec3 } from '../types.js';
import { multiplyMat4 } from './mat4.js';

export type CameraProjection =
  | { readonly mode: 'perspective'; readonly fovy: number }
  | { readonly mode: 'ortho'; readonly frustumHeight: number };

export interface CameraTarget {
  position: Vec3;
  heading: number;
}

export interface CameraOffset {
  distance: number;
  phi: number;
  theta: number;
}

export interface CameraState {
  target: CameraTarget;
  offset: CameraOffset;
  projection: CameraProjection;
}

export type CameraChangeSource = 'pointer' | 'keyboard' | 'wheel' | 'touch';

export interface SceneCameraChangeDetail {
  readonly cameraState: CameraState;
  readonly source: CameraChangeSource;
}

export const DEFAULT_CAMERA_STATE: CameraState = Object.freeze({
  target: Object.freeze({ position: Object.freeze([0, 0, 0] as Vec3) as Vec3, heading: 0 }),
  offset: Object.freeze({ distance: 12, phi: Math.PI / 4, theta: -Math.PI / 2 }),
  projection: Object.freeze({ mode: 'perspective' as const, fovy: Math.PI / 4 })
});

export function copyCameraState(state: CameraState): CameraState {
  assertCameraState(state);
  return {
    target: { position: [...state.target.position] as Vec3, heading: state.target.heading },
    offset: { distance: state.offset.distance, phi: state.offset.phi, theta: state.offset.theta },
    projection:
      state.projection.mode === 'perspective'
        ? { mode: 'perspective', fovy: state.projection.fovy }
        : { mode: 'ortho', frustumHeight: state.projection.frustumHeight }
  };
}

export function assertCameraState(state: CameraState): void {
  if (typeof state !== 'object' || state === null) throw new TypeError('Camera state must be an object.');
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

export function cameraEye(state: CameraState): Vec3 {
  assertCameraState(state);
  const azimuth = state.target.heading + state.offset.theta;
  const radius = state.offset.distance * Math.sin(state.offset.phi);
  return [
    state.target.position[0] + radius * Math.cos(azimuth),
    state.target.position[1] + radius * Math.sin(azimuth),
    state.target.position[2] + state.offset.distance * Math.cos(state.offset.phi)
  ];
}

export function createCameraViewProjection(state: CameraState, aspect: number): Mat4 {
  assertCameraState(state);
  if (!Number.isFinite(aspect) || aspect <= 0) throw new RangeError('Camera aspect must be positive and finite.');
  const eye = cameraEye(state);
  const view = createLookAt(eye, state.target.position, state.offset.phi);
  const projection =
    state.projection.mode === 'perspective'
      ? createPerspectiveMatrix(state.projection.fovy, aspect)
      : createOrthographicMatrix(state.projection.frustumHeight, aspect);
  return multiplyMat4(projection, view);
}

export function createPerspectiveMatrix(fovy: number, aspect: number): Mat4 {
  if (!Number.isFinite(fovy) || fovy <= 0 || fovy >= Math.PI)
    throw new RangeError('Perspective fovy must be in (0, π).');
  if (!Number.isFinite(aspect) || aspect <= 0) throw new RangeError('Camera aspect must be positive and finite.');
  const near = 0.01;
  const far = 10_000;
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

export function createOrthographicMatrix(frustumHeight: number, aspect: number): Mat4 {
  if (!Number.isFinite(frustumHeight) || frustumHeight <= 0)
    throw new RangeError('Frustum height must be greater than zero.');
  if (!Number.isFinite(aspect) || aspect <= 0) throw new RangeError('Camera aspect must be positive and finite.');
  const width = frustumHeight * aspect;
  const near = 0.01;
  const far = 10_000;
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
  state: CameraState,
  movementX: number,
  movementY: number,
  minDistance = 0.5,
  maxDistance = 200
): CameraState {
  if (!Number.isFinite(movementX) || !Number.isFinite(movementY))
    throw new RangeError('Pointer movement must be finite.');
  const next = copyCameraState(state);
  next.offset.theta -= movementX * 0.005;
  next.offset.phi = clampOrbit(next.offset.phi + movementY * 0.005, 1e-4, Math.PI - 1e-4);
  next.offset.distance = clampOrbit(next.offset.distance, minDistance, maxDistance);
  return next;
}

// eslint-disable-next-line max-params -- Fixed wheel input and orbit limits.
export function applyOrbitWheel(
  state: CameraState,
  deltaPixels: number,
  minDistance = 0.5,
  maxDistance = 200
): CameraState {
  if (!Number.isFinite(deltaPixels)) throw new RangeError('Wheel delta must be finite.');
  const next = copyCameraState(state);
  next.offset.distance = clampOrbit(next.offset.distance * Math.exp(deltaPixels * 0.001), minDistance, maxDistance);
  return next;
}

// eslint-disable-next-line max-params -- Fixed key input and orbit limits.
export function applyOrbitKey(
  state: CameraState,
  key: string,
  minDistance = 0.5,
  maxDistance = 200
): CameraState | null {
  const next = copyCameraState(state);
  const angle = Math.PI / 36;
  if (key === 'ArrowLeft') next.offset.theta -= angle;
  else if (key === 'ArrowRight') next.offset.theta += angle;
  else if (key === 'ArrowUp') next.offset.phi = clampOrbit(next.offset.phi - angle, 1e-4, Math.PI - 1e-4);
  else if (key === 'ArrowDown') next.offset.phi = clampOrbit(next.offset.phi + angle, 1e-4, Math.PI - 1e-4);
  else if (key === '+' || key === '=') next.offset.distance /= 1.1;
  else if (key === '-') next.offset.distance *= 1.1;
  else return null;
  next.offset.distance = clampOrbit(next.offset.distance, minDistance, maxDistance);
  return next;
}

export function pinchDistance(startDistance: number, relativeScale: number): number {
  if (!Number.isFinite(startDistance) || !Number.isFinite(relativeScale) || startDistance <= 0 || relativeScale <= 0) {
    throw new RangeError('Pinch distance inputs must be positive and finite.');
  }
  return startDistance / relativeScale;
}

function createLookAt(eye: Vec3, target: Vec3, phi: number): Mat4 {
  const forward = normalize([target[0] - eye[0], target[1] - eye[1], target[2] - eye[2]]);
  const up: Vec3 = Math.abs(Math.sin(phi)) < 1e-4 ? [1, 0, 0] : [0, 0, 1];
  const right = normalize(cross(forward, up));
  const actualUp = cross(right, forward);
  return new Float32Array([
    right[0],
    actualUp[0],
    -forward[0],
    0,
    right[1],
    actualUp[1],
    -forward[1],
    0,
    right[2],
    actualUp[2],
    -forward[2],
    0,
    -dot(right, eye),
    -dot(actualUp, eye),
    dot(forward, eye),
    1
  ]);
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
