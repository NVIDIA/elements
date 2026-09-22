// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { Scene } from './scene.js';
import { SceneCamera } from '../camera/camera.js';
import { SceneFrame } from '../frame/frame.js';
import { SceneCubes, CubeBuffer } from '../cubes/cubes.js';
import { boundsCorners, type SceneBounds } from '../internal/math/bounds.js';
import { transformPointMat4 } from '../internal/math/mat4.js';
import { createCameraViewProjection } from '../internal/composition/camera/math.js';
import './define.js';
import '../camera/define.js';
import '../frame/define.js';
import '../cubes/define.js';

const box: SceneBounds = { minimum: [80, -20, -4], maximum: [350, 30, 15] };

function expectContained(scene: Scene, bounds: SceneBounds, aspect: number): void {
  const matrix = createCameraViewProjection(scene.cameraState, aspect);
  for (const corner of boundsCorners(bounds)) {
    const projected = transformPointMat4(matrix, corner);
    expect(Math.abs(projected[0])).toBeLessThanOrEqual(0.801);
    expect(Math.abs(projected[1])).toBeLessThanOrEqual(0.801);
    expect(projected[2]).toBeGreaterThan(0);
    expect(projected[2]).toBeLessThan(1);
  }
}

describe('explicit public camera fitting', () => {
  it('keeps existing orbit limits when fitting a point and bounds the effective minimum distance', () => {
    const scene = new Scene();
    const camera = new SceneCamera();
    camera.behavior = 'orbit';
    camera.distance = 50;
    camera.minDistance = 50;
    camera.maxDistance = 1000;
    scene.append(camera);
    expect(scene.fitCamera(camera, { minimum: [1, 2, 3], maximum: [1, 2, 3] }, { aspect: 1 })).toBe(true);
    expect(camera.distance).toBeGreaterThanOrEqual(50);
    expect(camera.maxDistance).toBe(1000);
    expect(camera.minDistance).toBe(50);
  });

  it('rejects overflowing local pose conversion before changing any camera inputs', () => {
    const scene = new Scene();
    const frame = new SceneFrame();
    frame.name = 'remote';
    frame.setPose({ position: [-1e308, 0, 0], orientation: [0, 0, 0, 1] });
    const camera = new SceneCamera();
    camera.frame = 'remote';
    camera.orientation = [0, 0, 0, 1];
    scene.append(frame, camera);
    const before = [camera.position, camera.near, camera.far];
    expect(() => scene.fitCamera(camera, { minimum: [1e308, 0, 0], maximum: [1e308, 0, 0] }, { aspect: 1 })).toThrow(
      RangeError
    );
    expect([camera.position, camera.near, camera.far]).toEqual(before);
  });

  it.each(['pose', 'orbit', 'top'] as const)('fits the %s behavior without a GPU or navigation event', behavior => {
    const scene = new Scene();
    const camera = new SceneCamera();
    camera.behavior = behavior;
    if (behavior === 'orbit') {
      camera.polarAngle = 0.85;
      camera.azimuth = -1.2;
      camera.minDistance = 5;
      camera.maxDistance = 20;
    }
    scene.append(camera);
    const listener = vi.fn();
    scene.addEventListener('nve-scene-camera-change', listener);
    expect(scene.fitCamera(camera, box, { aspect: 0.5 })).toBe(true);
    expectContained(scene, box, 0.5);
    if (behavior === 'orbit') {
      expect(camera.target).toEqual([215, 5, 5.5]);
      expect(camera.maxDistance).toBe(camera.distance);
      expect(camera.minDistance).toBe(5);
      expect(camera.polarAngle).toBe(0.85);
      expect(camera.azimuth).toBe(-1.2);
    }
    if (behavior === 'top') expect(camera.frustumHeight).toBeGreaterThan(100);
    expect(listener).not.toHaveBeenCalled();
  });

  it.each(['perspective', 'orthographic'] as const)('fits a rolled framed pose in %s at a large origin', projection => {
    const scene = new Scene();
    const camera = new SceneCamera();
    const frame = new SceneFrame();
    frame.name = 'survey';
    frame.setPose({ position: [1e12, 1e12, 1e12], orientation: [0, 0, Math.SQRT1_2, Math.SQRT1_2] });
    camera.frame = 'survey';
    camera.orientation = [Math.sin(0.3), 0, 0, Math.cos(0.3)];
    camera.projection = projection;
    scene.append(camera, frame);
    const bounds: SceneBounds = { minimum: [1e12 - 2, 1e12 - 4, 1e12 - 3], maximum: [1e12 + 12, 1e12 + 5, 1e12 + 8] };
    expect(scene.fitCamera(camera, bounds, { aspect: 4 })).toBe(true);
    expectContained(scene, bounds, 4);
    expect(camera.frame).toBe('survey');
    expect(camera.orientation).toEqual([Math.sin(0.3), 0, 0, Math.cos(0.3)]);
    expect(Math.hypot(...camera.position)).toBeLessThan(100);
  });

  it.each(['perspective', 'orthographic'] as const)(
    'preserves follow position and heading while fitting an orbit in %s',
    projection => {
      const scene = new Scene();
      const frame = new SceneFrame();
      frame.name = 'tracked';
      frame.setPose({ position: [5, 6, 7], orientation: [0, 0, Math.sin(0.25), Math.cos(0.25)] });
      const follow = new SceneCamera();
      follow.behavior = 'follow';
      follow.frame = 'tracked';
      follow.followMode = 'pose';
      const orbit = new SceneCamera();
      orbit.behavior = 'orbit';
      orbit.projection = projection;
      scene.append(frame, follow, orbit);
      const previousTarget = [...orbit.target];
      expect(scene.fitCamera(orbit, box, { aspect: 0.25 })).toBe(true);
      expectContained(scene, box, 0.25);
      expect(orbit.target).toEqual(previousTarget);
      expect(follow.frame).toBe('tracked');
      expect(follow.followMode).toBe('pose');
      const before = scene.cameraState.pose.orientation;
      frame.setPose({ position: [5, 6, 7], orientation: [0, 0, 0, 1] });
      scene.fitCamera(orbit, box, { aspect: 0.25 });
      expect(scene.cameraState.pose.orientation).not.toEqual(before);
    }
  );

  it('returns false for null bounds and rejects invalid requests without changing camera inputs', () => {
    const scene = new Scene();
    const camera = new SceneCamera();
    camera.behavior = 'orbit';
    scene.append(camera);
    const inputs = () => [camera.distance, camera.maxDistance, camera.target, camera.near, camera.far];
    const before = inputs();
    expect(scene.fitCamera(camera, null)).toBe(false);
    expect(() => scene.fitCamera(camera, box)).toThrow(RangeError);
    expect(() => scene.fitCamera(camera, box, { aspect: 1, padding: 0.5 })).toThrow(RangeError);
    camera.disabled = true;
    expect(() => scene.fitCamera(camera, box, { aspect: 1 })).toThrow(/Fit requires/);
    camera.disabled = false;
    expect(() => scene.fitCamera(new SceneCamera(), box, { aspect: 1 })).toThrow(TypeError);
    expect(inputs()).toEqual(before);
    const conflict = new SceneCamera();
    conflict.behavior = 'orbit';
    scene.append(conflict);
    expect(() => scene.fitCamera(camera, box, { aspect: 1 })).toThrow(/Fit requires/);
    expect(inputs()).toEqual(before);
  });

  it('rejects unresolved, duplicate-frame, and follow-only cameras', () => {
    const scene = new Scene();
    const camera = new SceneCamera();
    camera.frame = 'missing';
    scene.append(camera);
    expect(() => scene.fitCamera(camera, box, { aspect: 1 })).toThrow(/Fit requires/);
    const first = new SceneFrame();
    const second = new SceneFrame();
    first.name = second.name = 'missing';
    scene.append(first, second);
    expect(() => scene.fitCamera(camera, box, { aspect: 1 })).toThrow(/Fit requires/);
    second.remove();
    camera.behavior = 'follow';
    expect(() => scene.fitCamera(camera, box, { aspect: 1 })).toThrow(/Fit requires/);
  });

  it('leaves the fitted view unchanged after subsequent publications and bounds queries', () => {
    const scene = new Scene();
    const camera = new SceneCamera();
    camera.behavior = 'orbit';
    const cubes = new SceneCubes();
    const source = new CubeBuffer({ records: [{ position: [30, 40, 50] }] });
    cubes.source = source;
    scene.append(camera, cubes);
    const first = scene.getBounds({ content: [cubes] });
    scene.fitCamera(camera, first, { aspect: 1 });
    const fitted = scene.cameraState;
    source.at(0).position.x = 1000;
    cubes.publish();
    const later = scene.getBounds({ content: [cubes] });
    expect(later).not.toEqual(first);
    expect(scene.cameraState).toEqual(fitted);
    expect(scene.fitCamera(camera, later, { aspect: 1 })).toBe(true);
    expect(scene.cameraState).not.toEqual(fitted);
  });
});
