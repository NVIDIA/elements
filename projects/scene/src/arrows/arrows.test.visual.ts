// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value -- This file exercises scene-owned composition. */

import { describe, expect, test } from 'vitest';
import { webgpuVisualRunner } from '@internals/vite';

describe('scene arrows visual runtime', () => {
  test('should render known geometry in the real WebGPU profile', async () => {
    const result = await webgpuVisualRunner.inspect(
      'scene-arrows-marker',
      /* html */ `
        <nve-scene aria-label="arrows scene" style="width: 32px; height: 32px">
          <nve-scene-frame position="[0,0,0]"><nve-scene-arrows>
            <nve-scene-marker
              from="0 0 0"
              to="0 0 4"
              color="#76b900"
              style="--visual-marker-scale: 4"
            ></nve-scene-marker>
          </nve-scene-arrows></nve-scene-frame>
        </nve-scene>
        <script type="module">
          import '@nvidia-elements/scene/arrows/define.js';
          import '@nvidia-elements/scene/frame/define.js';
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected a scene fixture.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(resolve));
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
          if (!context) return null;
          const pixels = context.getImageData(0, 0, probe.width, probe.height).data;
          return Array.from({ length: pixels.length / 4 }, (_, index) => index * 4).filter(
            index => (pixels[index + 1] ?? 0) > (pixels[index] ?? 0)
          ).length;
        })
    );
    expect(result).toBeGreaterThan(0);
  });
});
