// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene frame visual runtime', () => {
  test('should resolve the current frame transform in the real WebGPU scene profile', async () => {
    const result = await visualRunner.inspect(
      'scene-frame-transform',
      /* html */ `
        <nve-scene aria-label="Scene" style="width: 512px; height: 512px; background: rgb(0 0 0)">
          <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="8" phi="0.9" theta="0.7" projection="ortho" frustum-height="8"></nve-scene-camera>
          <nve-scene-axes length="3" width="4"></nve-scene-axes>
          <nve-scene-frame></nve-scene-frame>
        </nve-scene>
        <script type="module">
          import '@nvidia-elements/scene/frame/define.js';
          import '@nvidia-elements/scene/camera/define.js';
          import '@nvidia-elements/scene/axes/define.js';
          const frame = document.querySelector('nve-scene-frame');
          frame.setTransform({ position: [5, 0, 0], orientation: [0, 0, 0, 1] });
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          const frame = document.querySelector('nve-scene-frame');
          if (!scene || !frame) {
            throw new Error('Expected scene frame fixture.');
          }
          await scene.ready;
          const matrix = frame.getWorldMatrix();
          return {
            position: [matrix[12], matrix[13], matrix[14]],
            transform: frame.transform
          };
        })
    );

    expect(result).toEqual({
      position: [5, 0, 0],
      transform: { position: [5, 0, 0], orientation: [0, 0, 0, 1] }
    });
  });

  test('should suppress invalid frame content instead of moving it to the origin', async () => {
    const result = await visualRunner.inspect(
      'scene-frame-invalid-subtree',
      /* html */ `
        <nve-scene aria-label="Invalid frame recovery" style="width: 512px; height: 512px; background: rgb(0 0 0)">
          <nve-scene-camera behavior="top" height="10"></nve-scene-camera>
          <nve-scene-frame id="moving-frame" position="[3,0,0]">
            <nve-scene-cubes>
              <nve-scene-marker scale="[2,2,2]" color="rgb(118 185 0)"></nve-scene-marker>
            </nve-scene-cubes>
          </nve-scene-frame>
        </nve-scene>
        <script type="module">
          import '@nvidia-elements/scene/frame/define.js';
          import '@nvidia-elements/scene/camera/define.js';
          import '@nvidia-elements/scene/cubes/define.js';
          import '@nvidia-elements/scene/marker/define.js';
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          const frame = document.querySelector('nve-scene-frame');
          if (!scene || !frame) throw new Error('Expected invalid frame fixture.');
          await scene.ready;
          const sample = async () => {
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const canvas = scene.shadowRoot?.querySelector('canvas');
            const blob = await new Promise<Blob | null>(resolve => canvas?.toBlob(resolve));
            if (!blob) throw new Error('Expected Scene pixels.');
            const bitmap = await createImageBitmap(blob);
            const probe = document.createElement('canvas');
            probe.width = bitmap.width;
            probe.height = bitmap.height;
            const context = probe.getContext('2d');
            context?.drawImage(bitmap, 0, 0);
            bitmap.close();
            const pixels = context?.getImageData(0, 0, probe.width, probe.height).data ?? [];
            let visible = 0;
            for (let offset = 0; offset < pixels.length; offset += 4) {
              if ((pixels[offset + 1] ?? 0) > (pixels[offset] ?? 0) * 1.2) visible += 1;
            }
            return visible;
          };
          const valid = await sample();
          frame.setAttribute('position', '[3,0]');
          const invalid = await sample();
          frame.setAttribute('position', '[3,0,0]');
          const recovered = await sample();
          return { invalid, recovered, valid };
        })
    );

    expect(result.valid).toBeGreaterThan(0);
    expect(result.invalid).toBe(0);
    expect(result.recovered).toBe(result.valid);
  });
});
