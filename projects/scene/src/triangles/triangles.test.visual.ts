// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuVisualRunner } from '@internals/vite';

describe('scene triangles visual runtime', () => {
  test('draws the selected triangle prefix with per-vertex alpha', async () => {
    const pixel = await webgpuVisualRunner.inspect(
      'scene-triangles-layer',
      `<nve-scene aria-label="triangles" style="width:32px;height:32px;background:rgb(0 0 0)"><nve-scene-triangles id="triangles"></nve-scene-triangles></nve-scene><script type="module">
        import { TRI_VERTEX, writeTriVertex } from '@nvidia-elements/scene';
        import '@nvidia-elements/scene/triangles/define.js';
        const bytes = new Uint8Array(TRI_VERTEX.stride * 6);
        writeTriVertex(bytes, 0, { position: [-0.6, -0.5, 0], color: [0, 1, 0, 0.5] });
        writeTriVertex(bytes, 1, { position: [0.6, -0.5, 0], color: [0, 1, 0, 0.5] });
        writeTriVertex(bytes, 2, { position: [0, 0.7, 0], color: [0, 1, 0, 0.5] });
        writeTriVertex(bytes, 3, { position: [-0.9, 0.8, 0], color: [1, 0, 0, 1] });
        writeTriVertex(bytes, 4, { position: [-0.7, 0.9, 0], color: [1, 0, 0, 1] });
        writeTriVertex(bytes, 5, { position: [-0.8, 0.6, 0], color: [1, 0, 0, 1] });
        const layer = document.querySelector('#triangles');
        layer.vertices = bytes;
        layer.count = 3;
      </script>`,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected triangles scene.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          const blob = await new Promise<Blob | null>(resolve => canvas?.toBlob(resolve));
          if (!blob) throw new Error('Expected triangles canvas.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          return context ? [...context.getImageData(probe.width / 2, probe.height / 2, 1, 1).data] : null;
        })
    );
    expect(pixel?.[1]).toBeGreaterThan(pixel?.[0] ?? 255);
  });
});
