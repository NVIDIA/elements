// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { DEFAULT_ORBIT_CAMERA_STATE, copyOrbitCameraState } from './math.js';
import { resolveCameraState } from './state.js';

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
            projection: { mode: 'orthographic', frustumHeight: 10, near: 0.01, far: 10_000 }
          }
        }
      ]
    });
    expect(resolved.target.position).toEqual([2, 3, 4]);
    expect(resolved.offset).toEqual({ distance: 8, polarAngle: Math.PI / 4, azimuth: -Math.PI / 2 });
    expect(resolved.projection).toEqual({ mode: 'orthographic', frustumHeight: 10, near: 0.01, far: 10_000 });
  });

  it('returns independent state snapshots', () => {
    const prior = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
    const resolved = resolveCameraState({ prior });
    resolved.target.position[1] = 9;
    expect(prior.target.position[1]).toBe(0);
  });

  it('resolves defaults and applies partial patches without changing omitted fields', () => {
    const prior = resolveCameraState();
    expect(prior).toEqual(DEFAULT_ORBIT_CAMERA_STATE);
    const resolved = resolveCameraState({
      prior,
      contributions: [
        {
          fields: [
            'target.position',
            'target.heading',
            'offset.distance',
            'offset.polarAngle',
            'offset.azimuth',
            'projection'
          ],
          patch: {
            target: { position: [1, 2, 3], heading: 0.25 },
            offset: { distance: 6, polarAngle: 0.75, azimuth: 0.5 },
            projection: { mode: 'orthographic', frustumHeight: 20, near: 0.1, far: 200 }
          }
        }
      ]
    });
    expect(resolved).toEqual({
      target: { position: [1, 2, 3], heading: 0.25 },
      offset: { distance: 6, polarAngle: 0.75, azimuth: 0.5 },
      projection: { mode: 'orthographic', frustumHeight: 20, near: 0.1, far: 200 }
    });
    expect(resolveCameraState({ prior: resolved })).toEqual(resolved);
    expect(
      resolveCameraState({ prior: resolved, contributions: [{ fields: [], patch: { target: {}, offset: {} } }] })
    ).toEqual(resolved);
  });

  it('applies multiple contribution patches in order', () => {
    const resolved = resolveCameraState({
      contributions: [
        { fields: ['target.position'], patch: { target: { position: [1, 0, 0] } } },
        { fields: ['target.heading'], patch: { target: { heading: 1 } } },
        { fields: ['offset.distance'], patch: { offset: { distance: 9 } } },
        { fields: ['offset.polarAngle'], patch: { offset: { polarAngle: 1 } } },
        { fields: ['offset.azimuth'], patch: { offset: { azimuth: 2 } } },
        {
          fields: ['projection'],
          patch: { projection: { mode: 'orthographic', frustumHeight: 30, near: 0.01, far: 10_000 } }
        }
      ]
    });
    expect(resolved).toEqual({
      target: { position: [1, 0, 0], heading: 1 },
      offset: { distance: 9, polarAngle: 1, azimuth: 2 },
      projection: { mode: 'orthographic', frustumHeight: 30, near: 0.01, far: 10_000 }
    });
  });
});
