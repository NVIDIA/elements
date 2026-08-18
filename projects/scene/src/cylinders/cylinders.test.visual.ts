// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value -- These files exercise scene-owned composition and components introduced together. */

import { describe, expect, test } from 'vitest';
import { webgpuVisualRunner } from '@internals/vite';

describe('scene cylinders visual runtime', () => {
  test('should render known geometry in the real WebGPU profile', async () => {
    const result = await webgpuVisualRunner.inspect(
      'scene-cylinders-marker',
      /* html */ `
        <nve-scene aria-label="cylinders scene" style="width: 32px; height: 32px">
          <nve-scene-frame position="[0,0,0]"><nve-scene-cylinders>
            <nve-scene-marker position="[0,0,0]" color="#76b900"></nve-scene-marker>
          </nve-scene-cylinders></nve-scene-frame>
        </nve-scene>
        <script type="module">
          import '@nvidia-elements/scene/cylinders/define.js';
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
          return context
            ? [...context.getImageData(Math.floor(probe.width / 2), Math.floor(probe.height / 2), 1, 1).data]
            : null;
        })
    );
    expect(result?.[1]).toBeGreaterThan(result?.[0] ?? 255);
    expect(result?.[3]).toBe(255);
  });
});
