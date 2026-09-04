// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { DEFAULT_ORBIT_CAMERA_STATE, copyOrbitCameraState } from '../math/camera.js';
import { applyCameraPatch, resolveCameraState } from './state.js';

describe('camera state resolution', () => {
  it('applies behavior contributions over prior state', () => {
    const resolved = resolveCameraState({
      prior: DEFAULT_ORBIT_CAMERA_STATE,
      contributions: [
        {
          fields: ['target.position', 'offset.distance', 'projection'],
          patch: {
            target: { position: [2, 3, 4] },
            offset: { distance: 8 },
            projection: { mode: 'ortho', frustumHeight: 10, near: 0.01, far: 10_000 }
          }
        }
      ]
    });
    expect(resolved.target.position).toEqual([2, 3, 4]);
    expect(resolved.offset).toEqual({ distance: 8, phi: Math.PI / 4, theta: -Math.PI / 2 });
    expect(resolved.projection).toEqual({ mode: 'ortho', frustumHeight: 10, near: 0.01, far: 10_000 });
  });

  it('returns independent state snapshots', () => {
    const prior = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    const resolved = resolveCameraState({ prior });
    resolved.target.position[1] = 9;
    expect(prior.target.position[1]).toBe(0);
  });

  it('resolves defaults and applies partial patches without changing omitted fields', () => {
    const resolved = resolveCameraState();
    expect(resolved).toEqual(DEFAULT_ORBIT_CAMERA_STATE);
    applyCameraPatch(resolved, {
      target: { position: [1, 2, 3], heading: 0.25 },
      offset: { distance: 6, phi: 0.75, theta: 0.5 },
      projection: { mode: 'ortho', frustumHeight: 20, near: 0.1, far: 200 }
    });
    expect(resolved).toEqual({
      target: { position: [1, 2, 3], heading: 0.25 },
      offset: { distance: 6, phi: 0.75, theta: 0.5 },
      projection: { mode: 'ortho', frustumHeight: 20, near: 0.1, far: 200 }
    });
    applyCameraPatch(resolved, undefined);
    applyCameraPatch(resolved, { target: {}, offset: {} });
    expect(resolved.target.position).toEqual([1, 2, 3]);
  });

  it('applies multiple contribution patches in order', () => {
    const resolved = resolveCameraState({
      contributions: [
        { fields: ['target.position'], patch: { target: { position: [1, 0, 0] } } },
        { fields: ['target.heading'], patch: { target: { heading: 1 } } },
        { fields: ['offset.distance'], patch: { offset: { distance: 9 } } },
        { fields: ['offset.phi'], patch: { offset: { phi: 1 } } },
        { fields: ['offset.theta'], patch: { offset: { theta: 2 } } },
        {
          fields: ['projection'],
          patch: { projection: { mode: 'ortho', frustumHeight: 30, near: 0.01, far: 10_000 } }
        }
      ]
    });
    expect(resolved).toEqual({
      target: { position: [1, 0, 0], heading: 1 },
      offset: { distance: 9, phi: 1, theta: 2 },
      projection: { mode: 'ortho', frustumHeight: 30, near: 0.01, far: 10_000 }
    });
  });
});
