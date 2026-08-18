// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuVisualRunner } from '@internals/vite';

describe('camera visual contract', () => {
  test('applies configured orbit limits to user camera input', async () => {
    const state = await inspectCameraState(
      'scene-camera-orbit',
      '<nve-scene-camera behavior="orbit" distance="20" min-distance="20" max-distance="21"></nve-scene-camera>',
      true
    );
    expect(state.offset.distance).toBe(20);
  });

  test('resolves a followed frame into the scene camera target', async () => {
    const state = await inspectCameraState(
      'scene-camera-follow',
      '<nve-scene-frame name="robot" position="[2,3,4]"></nve-scene-frame><nve-scene-camera behavior="follow" frame="robot"></nve-scene-camera>'
    );
    expect(state.target.position).toEqual([2, 3, 4]);
  });

  test('applies orthographic top-camera projection before rendering', async () => {
    const state = await inspectCameraState(
      'scene-camera-top',
      '<nve-scene-camera behavior="top" height="30"></nve-scene-camera>'
    );
    expect(state.offset.phi).toBe(0);
    expect(state.projection).toEqual({ mode: 'ortho', frustumHeight: 30 });
  });
});

async function inspectCameraState(name: string, camera: string, wheel = false) {
  return webgpuVisualRunner.inspect(
    name,
    `<nve-scene aria-label="Camera behavior" data-wheel="${wheel}" style="width: 64px;height:64px">${camera}</nve-scene><script type="module">import '@nvidia-elements/scene/camera/define.js';</script>`,
    page =>
      page.evaluate(async () => {
        const scene = document.querySelector('nve-scene');
        if (!scene) throw new Error('Expected scene.');
        await scene.ready;
        if (scene.dataset.wheel === 'true') {
          const canvas = scene.shadowRoot?.querySelector('canvas');
          canvas?.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -10_000 }));
        }
        await new Promise(resolve => requestAnimationFrame(resolve));
        return scene.cameraState;
      })
  );
}
