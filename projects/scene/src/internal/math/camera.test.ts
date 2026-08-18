// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  applyOrbitDrag,
  applyOrbitKey,
  applyOrbitWheel,
  assertCameraState,
  cameraEye,
  copyCameraState,
  clampOrbit,
  createOrthographicMatrix,
  createPerspectiveMatrix,
  createCameraViewProjection,
  DEFAULT_CAMERA_STATE,
  pinchDistance,
  type CameraState
} from './camera.js';

describe('camera math', () => {
  it('provides the exact default and deep copies it', () => {
    const copy = copyCameraState(DEFAULT_CAMERA_STATE);
    expect(copy).toEqual({
      target: { position: [0, 0, 0], heading: 0 },
      offset: { distance: 12, phi: Math.PI / 4, theta: -Math.PI / 2 },
      projection: { mode: 'perspective', fovy: Math.PI / 4 }
    });
    copy.target.position[0] = 4;
    expect(DEFAULT_CAMERA_STATE.target.position[0]).toBe(0);
  });

  it('includes target heading in orbit eye azimuth', () => {
    const state = copyCameraState(DEFAULT_CAMERA_STATE);
    state.target.heading = Math.PI / 2;
    state.offset.theta = 0;
    state.offset.phi = Math.PI / 2;
    expect(cameraEye(state)[0]).toBeCloseTo(0);
    expect(cameraEye(state)[1]).toBeCloseTo(12);
  });

  it('uses a stable +X view-up basis at the top pole', () => {
    const state = copyCameraState(DEFAULT_CAMERA_STATE);
    state.offset.phi = 0;
    const matrix = createCameraViewProjection(state, 1);
    expect(matrix.every(Number.isFinite)).toBe(true);
    expect(matrix[0]).toBeCloseTo(0);
    expect(matrix[1]).toBeGreaterThan(0);
  });

  it('clamps interactive orbit limits and applies fixed input constants', () => {
    const state = copyCameraState(DEFAULT_CAMERA_STATE);
    const dragged = applyOrbitDrag(state, 10, 10, 4, 8);
    expect(dragged.offset.theta).toBeCloseTo(state.offset.theta - 0.05);
    expect(dragged.offset.phi).toBeCloseTo(state.offset.phi + 0.05);
    expect(dragged.offset.distance).toBe(8);
    expect(applyOrbitWheel(state, 100, 4, 8).offset.distance).toBeCloseTo(8);
    expect(applyOrbitKey(state, '+', 4, 8)?.offset.distance).toBe(8);
    expect(pinchDistance(12, 2)).toBe(6);
  });

  it('supports orthographic projection and rejects invalid state values', () => {
    const state: CameraState = {
      ...copyCameraState(DEFAULT_CAMERA_STATE),
      projection: { mode: 'ortho', frustumHeight: 40 }
    };
    expect(createCameraViewProjection(state, 2)).toHaveLength(16);
    expect(() => createCameraViewProjection({ ...state, offset: { ...state.offset, phi: -1 } }, 1)).toThrow(RangeError);
  });

  it('validates every camera state branch', () => {
    const base = copyCameraState(DEFAULT_CAMERA_STATE);
    const invalidStates: unknown[] = [
      null,
      { ...base, target: null },
      { ...base, target: { ...base.target, position: [0, 0] } },
      { ...base, target: { ...base.target, position: [0, Number.NaN, 0] } },
      { ...base, target: { ...base.target, heading: Number.NaN } },
      { ...base, offset: null },
      { ...base, offset: { ...base.offset, distance: Number.NaN } },
      { ...base, offset: { ...base.offset, distance: 0 } },
      { ...base, offset: { ...base.offset, phi: Math.PI + 1 } },
      { ...base, projection: null },
      { ...base, projection: { mode: 'perspective', fovy: Number.NaN } },
      { ...base, projection: { mode: 'perspective', fovy: 0 } },
      { ...base, projection: { mode: 'perspective', fovy: Math.PI } },
      { ...base, projection: { mode: 'ortho', frustumHeight: Number.NaN } },
      { ...base, projection: { mode: 'ortho', frustumHeight: 0 } },
      { ...base, projection: { mode: 'unknown' } }
    ];
    invalidStates.forEach(state => expect(() => assertCameraState(state as CameraState)).toThrow());
  });

  it('rejects invalid projection aspects and matrix inputs', () => {
    expect(() => createCameraViewProjection(DEFAULT_CAMERA_STATE, 0)).toThrow(RangeError);
    expect(() => createCameraViewProjection(DEFAULT_CAMERA_STATE, Number.NaN)).toThrow(RangeError);
    expect(() => createPerspectiveMatrix(0, 1)).toThrow(RangeError);
    expect(() => createPerspectiveMatrix(Math.PI, 1)).toThrow(RangeError);
    expect(() => createPerspectiveMatrix(Number.NaN, 1)).toThrow(RangeError);
    expect(() => createPerspectiveMatrix(1, 0)).toThrow(RangeError);
    expect(() => createOrthographicMatrix(0, 1)).toThrow(RangeError);
    expect(() => createOrthographicMatrix(Number.NaN, 1)).toThrow(RangeError);
    expect(() => createOrthographicMatrix(1, 0)).toThrow(RangeError);
  });

  it('covers orbit limits and invalid gestures', () => {
    const state = copyCameraState(DEFAULT_CAMERA_STATE);
    expect(clampOrbit(2, 0, 1)).toBe(1);
    expect(clampOrbit(-1, 0, 1)).toBe(0);
    expect(() => clampOrbit(1, 2, 0)).toThrow(RangeError);
    expect(() => clampOrbit(Number.NaN, 0, 1)).toThrow(RangeError);
    expect(() => applyOrbitDrag(state, Number.NaN, 0)).toThrow(RangeError);
    expect(() => applyOrbitDrag(state, 0, Number.NaN)).toThrow(RangeError);
    expect(() => applyOrbitWheel(state, Number.NaN)).toThrow(RangeError);
    expect(() => pinchDistance(0, 1)).toThrow(RangeError);
    expect(() => pinchDistance(1, 0)).toThrow(RangeError);
    expect(() => pinchDistance(Number.NaN, 1)).toThrow(RangeError);
  });

  it('maps every supported orbit key and ignores unrelated keys', () => {
    const state = copyCameraState(DEFAULT_CAMERA_STATE);
    expect(applyOrbitKey(state, 'ArrowLeft')?.offset.theta).toBeCloseTo(state.offset.theta - Math.PI / 36);
    expect(applyOrbitKey(state, 'ArrowRight')?.offset.theta).toBeCloseTo(state.offset.theta + Math.PI / 36);
    expect(applyOrbitKey(state, 'ArrowUp')?.offset.phi).toBeCloseTo(state.offset.phi - Math.PI / 36);
    expect(applyOrbitKey(state, 'ArrowDown')?.offset.phi).toBeCloseTo(state.offset.phi + Math.PI / 36);
    expect(applyOrbitKey(state, '=')?.offset.distance).toBeCloseTo(state.offset.distance / 1.1);
    expect(applyOrbitKey(state, '-')?.offset.distance).toBeCloseTo(state.offset.distance * 1.1);
    expect(applyOrbitKey(state, 'Home')).toBeNull();
  });
});
