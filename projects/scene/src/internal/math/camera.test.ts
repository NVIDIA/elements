// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  applyOrbitDrag,
  applyOrbitKey,
  applyOrbitWheel,
  assertCameraState,
  assertOrbitCameraState,
  cameraEye,
  clampOrbit,
  copyCameraState,
  copyOrbitCameraState,
  createCameraViewMatrix,
  createCameraViewProjection,
  createOrthographicMatrix,
  createPerspectiveMatrix,
  DEFAULT_CAMERA_STATE,
  DEFAULT_FAR,
  DEFAULT_NEAR,
  DEFAULT_ORBIT_CAMERA_STATE,
  orbitCameraStateToCameraState,
  pinchDistance,
  type SceneCameraState
} from './camera.js';
import { transformPointMat4 } from './mat4.js';
import type { Quaternion, Vec3 } from '../types.js';

describe('camera math', () => {
  it('provides canonical defaults and independent deep copies', () => {
    const copy = copyCameraState(DEFAULT_CAMERA_STATE);
    expect(copy).toEqual({
      pose: {
        position: [expect.closeTo(0), expect.closeTo(-8.485281), expect.closeTo(8.485281)],
        orientation: [expect.closeTo(0.92388), expect.closeTo(0), expect.closeTo(0), expect.closeTo(-0.382683)]
      },
      projection: { mode: 'perspective', verticalFieldOfView: Math.PI / 4, near: DEFAULT_NEAR, far: DEFAULT_FAR }
    });
    (copy.pose.position as Vec3)[0] = 4;
    (copy.pose.orientation as Quaternion)[0] = 0;
    expect(DEFAULT_CAMERA_STATE.pose.position[0]).toBeCloseTo(0);
    expect(DEFAULT_CAMERA_STATE.pose.orientation[0]).not.toBe(0);
  });

  it('converts orbit authoring state to a canonical optical pose', () => {
    const orbit = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    orbit.target.heading = Math.PI / 2;
    orbit.offset.azimuth = 0;
    orbit.offset.polarAngle = Math.PI / 2;
    expect(cameraEye(orbit)[0]).toBeCloseTo(0);
    expect(cameraEye(orbit)[1]).toBeCloseTo(12);
    const canonical = orbitCameraStateToCameraState(orbit);
    expect(canonical.pose.position).toEqual([expect.closeTo(0), expect.closeTo(12), expect.closeTo(0)]);
    expect(createCameraViewProjection(canonical, 1).every(Number.isFinite)).toBe(true);
  });

  it('applies heading to top-down screen axes', () => {
    const top = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    top.target.heading = -0.75;
    top.offset.azimuth = 0;
    top.offset.polarAngle = 0;
    const view = createCameraViewMatrix(orbitCameraStateToCameraState(top).pose);
    const screenRight = transformPointMat4(view, [Math.sin(top.target.heading), -Math.cos(top.target.heading), 0]);
    const screenDown = transformPointMat4(view, [-Math.cos(top.target.heading), -Math.sin(top.target.heading), 0]);

    expect(screenRight[0]).toBeCloseTo(1);
    expect(screenRight[1]).toBeCloseTo(0);
    expect(screenDown[0]).toBeCloseTo(0);
    expect(screenDown[1]).toBeCloseTo(-1);
  });

  it('maps identity optical axes and preserves roll', () => {
    const identityView = createCameraViewMatrix({ position: [0, 0, 0], orientation: [0, 0, 0, 1] });
    expect(transformPointMat4(identityView, [1, 2, 3])).toEqual([1, -2, -3]);

    const roll = Math.PI / 2;
    const rolledView = createCameraViewMatrix({
      position: [0, 0, 0],
      orientation: [0, 0, Math.sin(roll / 2), Math.cos(roll / 2)]
    });
    const worldRight = transformPointMat4(rolledView, [0, 1, 0]);
    expect(worldRight[0]).toBeCloseTo(1);
    expect(worldRight[1]).toBeCloseTo(0);
    expect(worldRight[2]).toBeCloseTo(0);
  });

  it('uses explicit clipping in perspective and orthographic zero-to-one depth matrices', () => {
    const perspective = createPerspectiveMatrix(Math.PI / 2, 2, 2, 10);
    expect(perspective[10]).toBeCloseTo(-1.25);
    expect(perspective[14]).toBeCloseTo(-2.5);
    const orthographic = createOrthographicMatrix(4, 2, 2, 10);
    expect(orthographic[10]).toBeCloseTo(-0.125);
    expect(orthographic[14]).toBeCloseTo(-0.25);
  });

  it('clamps interactive orbit limits and applies fixed input constants', () => {
    const state = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    const dragged = applyOrbitDrag(state, { movementX: 10, movementY: 10 }, { maxDistance: 8, minDistance: 4 });
    expect(dragged.offset.azimuth).toBeCloseTo(state.offset.azimuth - 0.05);
    expect(dragged.offset.polarAngle).toBeCloseTo(state.offset.polarAngle + 0.05);
    expect(dragged.offset.distance).toBe(8);
    expect(applyOrbitWheel(state, 100, { maxDistance: 8, minDistance: 4 }).offset.distance).toBeCloseTo(8);
    expect(applyOrbitKey(state, '+', { maxDistance: 8, minDistance: 4 })?.offset.distance).toBe(8);
    expect(pinchDistance(12, 2)).toBe(6);
  });

  it('scales an orthographic frustum with wheel and keyboard zoom', () => {
    const state = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    state.projection = { mode: 'orthographic', frustumHeight: 10, near: DEFAULT_NEAR, far: DEFAULT_FAR };

    const wheeled = applyOrbitWheel(state, 100);
    expect(wheeled.offset.distance).toBeCloseTo(12 * Math.exp(0.1));
    expect(wheeled.projection).toMatchObject({ frustumHeight: 10 * Math.exp(0.1) });

    const keyed = applyOrbitKey(state, '+');
    expect(keyed?.offset.distance).toBeCloseTo(12 / 1.1);
    expect(keyed?.projection).toMatchObject({ frustumHeight: 10 / 1.1 });
  });

  it('retains orbit pitch when pointer or keyboard input would cross a pole', () => {
    const nearTop = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    nearTop.offset.polarAngle = 0.05;
    expect(applyOrbitDrag(nearTop, { movementX: 0, movementY: -20 }).offset.polarAngle).toBe(nearTop.offset.polarAngle);
    expect(applyOrbitKey(nearTop, 'ArrowUp')?.offset.polarAngle).toBe(nearTop.offset.polarAngle);

    const nearBottom = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    nearBottom.offset.polarAngle = Math.PI - 0.05;
    expect(applyOrbitDrag(nearBottom, { movementX: 0, movementY: 20 }).offset.polarAngle).toBe(
      nearBottom.offset.polarAngle
    );
    expect(applyOrbitKey(nearBottom, 'ArrowDown')?.offset.polarAngle).toBe(nearBottom.offset.polarAngle);
  });

  it('validates canonical state, pose, projection, and clipping boundaries', () => {
    const base = copyCameraState(DEFAULT_CAMERA_STATE);
    const invalidStates: unknown[] = [
      null,
      { ...base, pose: null },
      { ...base, pose: { ...base.pose, position: [0, 0] } },
      { ...base, pose: { ...base.pose, position: [0, Number.NaN, 0] } },
      { ...base, pose: { ...base.pose, orientation: [0, 0, 0, 0] } },
      { ...base, pose: { ...base.pose, orientation: [0, 0, Number.NaN, 1] } },
      { ...base, projection: null },
      { ...base, projection: { mode: 'perspective', verticalFieldOfView: 0, near: 0.1, far: 10 } },
      { ...base, projection: { mode: 'perspective', verticalFieldOfView: Math.PI, near: 0.1, far: 10 } },
      { ...base, projection: { mode: 'perspective', verticalFieldOfView: 1, near: 0, far: 10 } },
      { ...base, projection: { mode: 'perspective', verticalFieldOfView: 1, near: 10, far: 10 } },
      { ...base, projection: { mode: 'perspective', verticalFieldOfView: 1, near: 10, far: 1 } },
      { ...base, projection: { mode: 'orthographic', frustumHeight: 0, near: 0.1, far: 10 } },
      { ...base, projection: { mode: 'unknown', near: 0.1, far: 10 } }
    ];
    invalidStates.forEach(state => expect(() => assertCameraState(state as SceneCameraState)).toThrow());
  });

  it('validates orbit state containers and numeric limits', () => {
    const base = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    const invalidStates: unknown[] = [
      null,
      { ...base, target: null },
      { ...base, offset: null },
      { ...base, offset: { ...base.offset, distance: 0 } },
      { ...base, offset: { ...base.offset, polarAngle: -1 } },
      { ...base, offset: { ...base.offset, polarAngle: Math.PI + 1 } },
      { ...base, offset: { ...base.offset, azimuth: Number.NaN } }
    ];
    invalidStates.forEach(state => expect(() => assertOrbitCameraState(state as never)).toThrow());
  });

  it('rejects invalid aspects, clipping, and gesture inputs', () => {
    expect(() => createCameraViewProjection(DEFAULT_CAMERA_STATE, 0)).toThrow(RangeError);
    expect(() => createPerspectiveMatrix(Number.NaN, 1, 0.1, 10)).toThrow(RangeError);
    expect(() => createPerspectiveMatrix(0, 1, 0.1, 10)).toThrow(RangeError);
    expect(() => createPerspectiveMatrix(Math.PI, 1, 0.1, 10)).toThrow(RangeError);
    expect(() => createPerspectiveMatrix(1, 0, 0.1, 10)).toThrow(RangeError);
    expect(() => createPerspectiveMatrix(1, 1, 0, 10)).toThrow(RangeError);
    expect(() => createPerspectiveMatrix(1, 1, 10, 10)).toThrow(RangeError);
    expect(() => createOrthographicMatrix(0, 1, 0.1, 10)).toThrow(RangeError);
    expect(() => createOrthographicMatrix(1, 0, 0.1, 10)).toThrow(RangeError);
    expect(() => createOrthographicMatrix(1, 1, 10, 1)).toThrow(RangeError);
    expect(clampOrbit(2, 0, 1)).toBe(1);
    expect(() => clampOrbit(1, 2, 0)).toThrow(RangeError);
    expect(() => applyOrbitDrag(DEFAULT_ORBIT_CAMERA_STATE, { movementX: Number.NaN, movementY: 0 })).toThrow(
      RangeError
    );
    expect(() => applyOrbitWheel(DEFAULT_ORBIT_CAMERA_STATE, Number.NaN)).toThrow(RangeError);
    expect(() => pinchDistance(0, 1)).toThrow(RangeError);
  });

  it('maps every supported orbit key and ignores unrelated keys', () => {
    const state = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    expect(applyOrbitKey(state, 'ArrowLeft')?.offset.azimuth).toBeCloseTo(state.offset.azimuth - Math.PI / 36);
    expect(applyOrbitKey(state, 'ArrowRight')?.offset.azimuth).toBeCloseTo(state.offset.azimuth + Math.PI / 36);
    expect(applyOrbitKey(state, 'ArrowUp')?.offset.polarAngle).toBeCloseTo(state.offset.polarAngle - Math.PI / 36);
    expect(applyOrbitKey(state, 'ArrowDown')?.offset.polarAngle).toBeCloseTo(state.offset.polarAngle + Math.PI / 36);
    expect(applyOrbitKey(state, '=')?.offset.distance).toBeCloseTo(state.offset.distance / 1.1);
    expect(applyOrbitKey(state, '-')?.offset.distance).toBeCloseTo(state.offset.distance * 1.1);
    expect(applyOrbitKey(state, 'Home')).toBeNull();
  });
});
