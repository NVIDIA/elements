// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { SceneCamera } from '../../../camera/camera.js';
import '../../../camera/define.js';
import { cameraInputIsExplicit } from './input.js';
import { sceneCameraController, setCameraRuntimeProperty } from './behavior.js';

describe('camera behavior contributions', () => {
  it('validates orbit ranges and allows recovery after a disabled contribution', () => {
    const camera = new SceneCamera();
    camera.behavior = 'orbit';
    expect(sceneCameraController.getContribution(camera)).toMatchObject({ kind: 'orbit' });
    camera.distance = -1;
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    expect(sceneCameraController.isActive(camera)).toBe(false);
    camera.distance = 10;
    camera.disabled = true;
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    camera.disabled = false;
    expect(sceneCameraController.getContribution(camera)?.kind).toBe('orbit');
  });

  it('resolves follow frames and separates conflict from frame availability', () => {
    const camera = new SceneCamera();
    camera.behavior = 'follow';
    camera.frame = ' arm ';
    expect(sceneCameraController.getContribution(camera)).toMatchObject({ kind: 'follow', frame: 'arm' });
    sceneCameraController.setConflict(camera, true);
    expect(sceneCameraController.isActive(camera)).toBe(false);
    expect(sceneCameraController.isResolvable(camera)).toBe(true);
    sceneCameraController.setFrameResolved(camera, false);
    expect(sceneCameraController.isResolvable(camera)).toBe(false);
    sceneCameraController.setFrameResolved(camera, true);
    sceneCameraController.setConflict(camera, false);
    expect(sceneCameraController.isActive(camera)).toBe(true);
  });

  it('keeps navigation writes from becoming authored input overrides', () => {
    const camera = new SceneCamera();
    setCameraRuntimeProperty(camera, 'distance', 12);
    expect(camera.distance).toBe(12);
    expect(cameraInputIsExplicit(camera, 'distance')).toBe(false);
    camera.distance = 13;
    expect(cameraInputIsExplicit(camera, 'distance')).toBe(true);
  });
});
