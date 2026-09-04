// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('camera visual contract', () => {
  test('applies configured orbit limits to user camera input', async () => {
    const state = await inspectCameraState(
      'scene-camera-orbit',
      '<nve-scene-camera behavior="orbit" distance="20" min-distance="20" max-distance="21"></nve-scene-camera>',
      { wheel: true }
    );
    expect(Math.hypot(...state.pose.position)).toBeCloseTo(20);
  });

  test('resolves a followed frame into the scene camera target', async () => {
    const state = await inspectCameraState(
      'scene-camera-follow',
      '<nve-scene-frame name="robot" position="[2,3,4]"></nve-scene-frame><nve-scene-camera behavior="follow" frame="robot"></nve-scene-camera>'
    );
    expect(state.pose.position).toEqual([expect.closeTo(2), expect.closeTo(-5.485281), expect.closeTo(12.485281)]);
  });

  test('applies orthographic top-camera projection before rendering', async () => {
    const state = await inspectCameraState(
      'scene-camera-top',
      '<nve-scene-camera behavior="top" height="30"></nve-scene-camera>'
    );
    expect(state.pose.position).toEqual([0, 0, 30]);
    expect(state.projection).toEqual({ mode: 'ortho', frustumHeight: 30, near: 0.01, far: 10_000 });
  });

  test('preserves roll in a direct optical pose', async () => {
    const state = await inspectCameraState(
      'scene-camera-pose-roll',
      '<nve-scene-camera position="[0,0,-8]" orientation="[0,0,0.70710678,0.70710678]"></nve-scene-camera>'
    );
    expect(state.pose.orientation).toEqual([
      expect.closeTo(0),
      expect.closeTo(0),
      expect.closeTo(Math.SQRT1_2),
      expect.closeTo(Math.SQRT1_2)
    ]);
  });

  test('resolves a frame-relative pose before rendering', async () => {
    const state = await inspectCameraState(
      'scene-camera-pose-frame',
      '<nve-scene-frame name="sensor" position="[2,3,4]"></nve-scene-frame><nve-scene-camera behavior="pose" frame="sensor" position="[1,0,0]"></nve-scene-camera>',
      {
        content:
          '<nve-scene-cubes><nve-scene-marker position="[3,3,10]" scale="[2,2,2]" color="magenta"></nve-scene-marker></nve-scene-cubes>'
      }
    );
    expect(state.pose.position).toEqual([3, 3, 4]);
  });

  test('applies explicit near and far clipping planes', async () => {
    const state = await inspectCameraState(
      'scene-camera-pose-clipping',
      '<nve-scene-camera behavior="pose" near="2" far="25"></nve-scene-camera>',
      {
        content:
          '<nve-scene-cubes><nve-scene-marker position="[-0.5,0,1]" scale="[0.4,0.4,0.4]" color="cyan"></nve-scene-marker><nve-scene-marker position="[0,0,5]" scale="[2,2,2]" color="magenta"></nve-scene-marker><nve-scene-marker position="[15,0,30]" scale="[12,12,12]" color="yellow"></nve-scene-marker></nve-scene-cubes>'
      }
    );
    expect(state.projection).toMatchObject({ near: 2, far: 25 });
  });

  test('recovers rendering after invalid clipping input', async () => {
    const state = await inspectCameraState(
      'scene-camera-pose-clipping-recovery',
      '<nve-scene-camera behavior="pose" near="20" far="10" data-recover="true"></nve-scene-camera>',
      {
        content:
          '<nve-scene-cubes><nve-scene-marker position="[0,0,5]" scale="[2,2,2]" color="magenta"></nve-scene-marker></nve-scene-cubes>'
      }
    );
    expect(state.projection).toMatchObject({ near: 1, far: 10 });
  });
});

async function inspectCameraState(
  name: string,
  camera: string,
  options: { readonly content?: string; readonly wheel?: boolean } = {}
) {
  const { content = '<nve-scene-axes length="6" width="4"></nve-scene-axes>', wheel = false } = options;
  return visualRunner.inspect(
    name,
    `<nve-scene aria-label="Camera behavior" data-wheel="${wheel}" style="width: 512px;height:512px;background:rgb(0 0 0)">${camera}${content}</nve-scene><script type="module">import '@nvidia-elements/scene/camera/define.js'; import '@nvidia-elements/scene/axes/define.js'; import '@nvidia-elements/scene/cubes/define.js'; import '@nvidia-elements/scene/frame/define.js';</script>`,
    page =>
      page.evaluate(async () => {
        const scene = document.querySelector('nve-scene');
        if (!scene) throw new Error('Expected scene.');
        await scene.ready;
        const cameraElement = scene.querySelector('nve-scene-camera');
        if (cameraElement?.dataset.recover === 'true') {
          cameraElement.near = 1;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        }
        if (scene.dataset.wheel === 'true') {
          const canvas = scene.shadowRoot?.querySelector('canvas');
          canvas?.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -10_000 }));
        }
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return scene.cameraState;
      })
  );
}
