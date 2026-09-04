// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene mesh visual runtime', () => {
  test('renders a basic opaque mesh', async () => {
    const result = await visualRunner.inspect(
      'scene-mesh-instances',
      /* html */ `
        <nve-scene aria-label="Mesh scene" style="width: 512px; height: 512px">
          <nve-scene-camera behavior="top" target="[0,0,0]" height="2"></nve-scene-camera>
          <nve-scene-mesh id="mesh" color="#76b900"></nve-scene-mesh>
        </nve-scene>
        <script type="module">
          import { define } from '@nvidia-elements/core/internal';
          import { SceneCamera } from '../../src/camera/camera.ts';
          import { Scene } from '../../src/scene/scene.ts';
          import { SceneMesh } from '../../src/mesh/mesh.ts';
          define(Scene);
          define(SceneCamera);
          define(SceneMesh);
          const mesh = document.querySelector('#mesh');
          mesh.positions = new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0, 0.5, 0]);
          mesh.normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected mesh scene.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          const blob = await new Promise<Blob | null>(resolve => canvas?.toBlob(resolve));
          if (!blob) throw new Error('Expected a mesh canvas image.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          return {
            pixel: context ? [...context.getImageData(probe.width / 2, probe.height / 2, 1, 1).data] : null
          };
        })
    );
    expect(result.pixel?.[1]).toBeGreaterThan(result.pixel?.[0] ?? 255);
  });
});
