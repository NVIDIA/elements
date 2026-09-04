// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { SceneCamera, sceneCameraController } from '../../camera/camera.js';
import { Scene } from '../../scene/scene.js';
import { CameraRuntime } from './runtime.js';
import '../../camera/define.js';
import '../../scene/define.js';

describe(CameraRuntime.name, () => {
  const scenes: Scene[] = [];

  afterEach(() => {
    scenes.forEach(scene => scene.remove());
    scenes.length = 0;
    vi.restoreAllMocks();
  });

  it('compares copied orbit contributions and detects an in-place vector edit', () => {
    const { camera, runtime } = createRuntime('orbit');
    camera.target = [1, 2, 3];

    expect(runtime.trackChanges()).toBe(true);
    runtime.resolve();
    expect(runtime.trackChanges()).toBe(false);

    camera.target[1] = 4;
    expect(runtime.trackChanges()).toBe(true);
    runtime.resolve();
    expect(runtime.state.pose.position).not.toEqual([0, 0, 0]);
  });

  it('reuses the prior normalized snapshot without rebuilding contributions while idle', () => {
    const { runtime } = createRuntime('orbit');
    const contribution = vi.spyOn(sceneCameraController, 'getContribution');

    expect(runtime.trackChanges()).toBe(true);
    runtime.resolve();
    contribution.mockClear();

    expect(runtime.trackChanges()).toBe(false);
    expect(contribution).not.toHaveBeenCalled();
  });

  it('reuses a disabled camera snapshot without repeatedly normalizing its null contribution', () => {
    const { camera, runtime } = createRuntime('orbit');
    camera.disabled = true;
    const contribution = vi.spyOn(sceneCameraController, 'getContribution');

    expect(runtime.trackChanges()).toBe(true);
    runtime.resolve();
    contribution.mockClear();

    expect(runtime.trackChanges()).toBe(false);
    expect(contribution).not.toHaveBeenCalled();
  });

  it('tracks each behavior variant and mutable pose inputs while invalidating a pending snapshot after a write', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { camera, runtime } = createRuntime('top');
    camera.target = [2, 0, 1];

    expect(runtime.trackChanges()).toBe(true);
    camera.altitude = 24;
    runtime.resolve();
    expect(runtime.trackChanges()).toBe(true);
    runtime.resolve();
    expect(runtime.trackChanges()).toBe(false);

    camera.behavior = 'follow';
    camera.frame = 'missing';
    camera.followMode = 'pose';
    expect(runtime.trackChanges()).toBe(true);
    runtime.resolve();
    expect(runtime.trackChanges()).toBe(false);

    camera.behavior = 'pose';
    camera.position = [3, 2, 1];
    camera.orientation = [0, 0, 0, 2];
    expect(runtime.trackChanges()).toBe(true);
    runtime.resolve();
    expect(runtime.trackChanges()).toBe(false);

    camera.position[0] = 4;
    expect(runtime.trackChanges()).toBe(true);
    runtime.resolve();

    camera.orientation[1] = 1;
    expect(runtime.trackChanges()).toBe(true);
  });

  it('tracks camera identity and DOM order independently of contribution values', () => {
    const { scene, runtime } = createRuntime('orbit');
    const second = document.createElement(SceneCamera.metadata.tag) as SceneCamera;
    second.behavior = 'orbit';
    scene.append(second);

    expect(runtime.trackChanges()).toBe(true);
    runtime.resolve();
    expect(runtime.trackChanges()).toBe(false);
    scene.prepend(second);
    expect(runtime.trackChanges()).toBe(true);
  });
});

function createRuntime(behavior: SceneCamera['behavior']): {
  camera: SceneCamera;
  runtime: CameraRuntime;
  scene: Scene;
} {
  const scene = document.createElement(Scene.metadata.tag) as Scene;
  const camera = document.createElement(SceneCamera.metadata.tag) as SceneCamera;
  camera.behavior = behavior;
  scene.append(camera);
  const runtime = new CameraRuntime({
    host: scene,
    requestRender: () => undefined,
    shouldIgnoreInput: () => false
  });
  return { camera, runtime, scene };
}
