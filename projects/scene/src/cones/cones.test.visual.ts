// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene cones visual runtime', () => {
  test('should render known geometry in the real WebGPU profile', async () => {
    const result = await visualRunner.inspect(
      'scene-cones-marker',
      /* html */ `
        <nve-scene aria-label="cones scene" style="width: 512px; height: 512px; background: rgb(0 0 0)">
          <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="8" phi="0.9" theta="-0.75" projection="ortho" frustum-height="3.5"></nve-scene-camera>
          <nve-scene-frame position="[0,0,0]"><nve-scene-cones>
            <nve-scene-marker position="[0,0,0]" color="#76b900"></nve-scene-marker>
          </nve-scene-cones></nve-scene-frame>
        </nve-scene>
        <script type="module">
          import '@nvidia-elements/scene/cones/define.js';
          import '@nvidia-elements/scene/camera/define.js';
          import '@nvidia-elements/scene/frame/define.js';
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected a scene fixture.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          if (!canvas) throw new Error('Expected a scene canvas.');
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
          if (!blob) throw new Error('Expected a canvas image.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          return context
            ? [...context.getImageData(Math.floor(probe.width / 2), Math.floor(probe.height / 2), 1, 1).data]
            : null;
        })
    );
    expect(result?.[1]).toBeGreaterThan(result?.[0] ?? 255);
    expect(result?.[3]).toBe(255);
  });
});
