// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { boundsCorners, type SceneBounds } from '../../math/bounds.js';
import { transformPointMat4 } from '../../math/mat4.js';
import { fitCameraToBounds } from './fit.js';
import {
  copyOrbitCameraState,
  createCameraViewProjection,
  DEFAULT_ORBIT_CAMERA_STATE,
  orbitCameraStateToCameraState,
  type SceneCameraState
} from './math.js';

describe('camera box fitting', () => {
  for (const mode of ['perspective', 'orthographic'] as const) {
    for (const aspect of [0.25, 1, 4]) {
      it.each([0, 1e9, 1e12])(`contains all corners in ${mode} at aspect ${aspect} and origin %s`, origin => {
        const orbit = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
        orbit.offset.azimuth = -1.2;
        orbit.offset.polarAngle = 0.85;
        const base = orbitCameraStateToCameraState(orbit);
        const state: SceneCameraState = {
          ...base,
          projection: mode === 'orthographic' ? { mode, frustumHeight: 10, near: 0.1, far: 100 } : base.projection
        };
        const bounds: SceneBounds = {
          minimum: [origin - 160, origin - 20, origin - 4],
          maximum: [origin + 75, origin + 35, origin + 16]
        };
        const fit = fitCameraToBounds({ state, bounds, aspect });
        const matrix = createCameraViewProjection(fit.state, aspect);
        for (const corner of boundsCorners(bounds)) {
          const clip = transformPointMat4(matrix, corner);
          expect(Math.abs(clip[0])).toBeLessThanOrEqual(0.801);
          expect(Math.abs(clip[1])).toBeLessThanOrEqual(0.801);
          expect(clip[2]).toBeGreaterThan(0);
          expect(clip[2]).toBeLessThan(1);
        }
        expect(fit.state.pose.orientation).toEqual(state.pose.orientation);
        expect(state.pose.position).toEqual(orbitCameraStateToCameraState(orbit).pose.position);
        if (fit.state.projection.mode === 'perspective')
          expect(fit.state.projection.verticalFieldOfView).toBe(Math.PI / 4);
      });
    }
  }

  it.each(['perspective', 'orthographic'] as const)('keeps an off-centre followed target in %s', mode => {
    const base = orbitCameraStateToCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    const state: SceneCameraState = {
      ...base,
      projection: mode === 'orthographic' ? { mode, frustumHeight: 10, near: 0.1, far: 100 } : base.projection
    };
    const bounds: SceneBounds = { minimum: [100, 20, -2], maximum: [120, 30, 2] };
    const fit = fitCameraToBounds({ state, bounds, target: [0, 0, 0], aspect: 0.5, minimumDistance: 400 });
    expect(fit.target).toEqual([0, 0, 0]);
    expect(fit.distance).toBeGreaterThanOrEqual(400);
    for (const corner of boundsCorners(bounds)) {
      const clip = transformPointMat4(createCameraViewProjection(fit.state, 0.5), corner);
      expect(Math.abs(clip[0])).toBeLessThanOrEqual(0.8);
      expect(Math.abs(clip[1])).toBeLessThanOrEqual(0.8);
      expect(clip[2]).toBeGreaterThan(0);
      expect(clip[2]).toBeLessThan(1);
    }
  });

  it.each(['perspective', 'orthographic'] as const)('fits planar and point-like content in %s', mode => {
    const base = orbitCameraStateToCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    const state: SceneCameraState = {
      ...base,
      projection: mode === 'orthographic' ? { mode, frustumHeight: 10, near: 0.1, far: 100 } : base.projection
    };
    for (const bounds of [
      { minimum: [3, 4, 5], maximum: [3, 4, 5] },
      { minimum: [-5, -3, 0], maximum: [5, 3, 0] }
    ] satisfies SceneBounds[]) {
      const fit = fitCameraToBounds({ state, bounds, aspect: 1, padding: 0 });
      expect(fit.distance).toBeGreaterThan(0);
      expect(fit.state.projection.near).toBeGreaterThan(0);
      expect(fit.state.projection.far).toBeGreaterThan(fit.state.projection.near);
      if (fit.state.projection.mode === 'orthographic') expect(fit.state.projection.frustumHeight).toBeGreaterThan(0);
    }
  });

  it('rejects invalid bounds, viewports, padding, and arithmetic before returning a fit', () => {
    const state = orbitCameraStateToCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    const bounds: SceneBounds = { minimum: [-1, -1, -1], maximum: [1, 1, 1] };
    const inputs = { state, bounds, aspect: 1 };
    for (const padding of [-1, 0.5, Infinity, NaN])
      expect(() => fitCameraToBounds({ ...inputs, padding })).toThrow(RangeError);
    for (const aspect of [0, -1, Infinity, NaN])
      expect(() => fitCameraToBounds({ ...inputs, aspect })).toThrow(RangeError);
    for (const invalid of [
      { minimum: [2, 0, 0], maximum: [1, 1, 1] },
      { minimum: [NaN, 0, 0], maximum: [1, 1, 1] },
      { minimum: [-1e308, 0, 0], maximum: [1e308, 1, 1] }
    ] satisfies SceneBounds[])
      expect(() => fitCameraToBounds({ ...inputs, bounds: invalid })).toThrow();
  });

  it('derives orbit orientation from angles even when eye subtraction loses precision', () => {
    const local = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    local.offset.distance = 0.001;
    const remote = copyOrbitCameraState(local);
    remote.target.position = [1e12, 1e12, 1e12];
    expect(orbitCameraStateToCameraState(remote).pose.orientation).toEqual(
      orbitCameraStateToCameraState(local).pose.orientation
    );
  });
});
