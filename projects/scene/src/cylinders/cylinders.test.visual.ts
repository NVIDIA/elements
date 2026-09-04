// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene cylinders visual runtime', () => {
  test('should render known geometry in the real WebGPU profile', async () => {
    const result = await visualRunner.inspect(
      'scene-cylinders-marker',
      /* html */ `
        <nve-scene aria-label="cylinders scene" style="width: 512px; height: 512px; background: rgb(0 0 0)">
          <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="8" phi="0.9" theta="-0.75" projection="ortho" frustum-height="3.5"></nve-scene-camera>
          <nve-scene-frame position="[0,0,0]"><nve-scene-cylinders>
            <nve-scene-marker id="cylinder" position="[0,0,0]" color="#76b900"></nve-scene-marker>
          </nve-scene-cylinders></nve-scene-frame>
        </nve-scene>
        <script type="module">
          import '@nvidia-elements/scene/cylinders/define.js';
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
          const rect = canvas.getBoundingClientRect();
          const hit = await scene.pick(rect.left + rect.width / 2, rect.top + rect.height / 2);
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
          if (!blob) throw new Error('Expected a canvas image.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          const pixel = context
            ? [...context.getImageData(Math.floor(probe.width / 2), Math.floor(probe.height / 2), 1, 1).data]
            : null;
          return {
            pick: hit
              ? { instanceIndex: hit.instanceIndex, layerTag: hit.layer.localName, markerId: hit.element.id }
              : null,
            pixel
          };
        })
    );
    expect(result.pick).toEqual({ instanceIndex: 0, layerTag: 'nve-scene-cylinders', markerId: 'cylinder' });
    expect(result.pixel?.[1]).toBeGreaterThan(result.pixel?.[0] ?? 255);
    expect(result.pixel?.[3]).toBe(255);
  });
});
