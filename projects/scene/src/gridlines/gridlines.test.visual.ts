// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene gridlines visual runtime', () => {
  test('keeps opaque coplanar and front triangles ahead of the positively biased grid', async () => {
    const samples = await visualRunner.inspect('scene-gridlines-depth-bias-t2', depthTemplate(), page =>
      page.evaluate(async () => {
        const scenes = [...document.querySelectorAll('nve-scene')];
        if (scenes.length !== 4 || scenes.some(scene => !(scene instanceof HTMLElement))) {
          throw new Error('Expected four grid depth scenes.');
        }
        await Promise.all(scenes.map(scene => (scene as HTMLElement & { ready: Promise<void> }).ready));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return Promise.all(scenes.map(readScene));

        async function readScene(scene: Element): Promise<{ inside: ColorCounts; outside: ColorCounts }> {
          const canvas = scene.shadowRoot?.querySelector('canvas');
          if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Expected a grid depth canvas.');
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
          if (!blob) throw new Error('Expected a grid depth canvas image.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          if (!context) throw new Error('Expected a 2D grid depth probe context.');
          const scale = probe.width / 200;
          return {
            // These are hand-derived pixels for the single vertical grid lines at
            // (-1, 0.25, 0) and (1, 0.25, 0), scaled from the original 200px
            // reference viewport rather than values from production camera helpers.
            inside: countColors(context, Math.round(81 * scale), Math.round(83 * scale)),
            outside: countColors(context, Math.round(125 * scale), Math.round(107 * scale))
          };
        }

        function countColors(context: CanvasRenderingContext2D, centerX: number, centerY: number): ColorCounts {
          let green = 0;
          let magenta = 0;
          for (let y = centerY - 1; y <= centerY + 1; y += 1) {
            for (let x = centerX - 1; x <= centerX + 1; x += 1) {
              const [red = 0, greenChannel = 0, blue = 0] = context.getImageData(x, y, 1, 1).data;
              if (greenChannel > red * 1.5 && greenChannel > blue * 1.5) green += 1;
              if (red > greenChannel * 1.5 && blue > greenChannel * 1.5) magenta += 1;
            }
          }
          return { green, magenta };
        }

        interface ColorCounts {
          readonly green: number;
          readonly magenta: number;
        }
      })
    );

    const [coplanar, front, behind, farFront] = samples;
    if (!coplanar || !front || !behind || !farFront) throw new Error('Expected all four depth samples.');

    // Camera: phi=pi/12, theta=-pi/3, orthographic frustum height 8. Its independently
    // derived screen basis is right=(sqrt(3)/2, 1/2, 0),
    // up=(-0.482963, 0.836516, 0.258819).
    // The selected single vertical grid lines map from (81, 83) and (125, 107) in the
    // original 200 CSS px reference viewport. The opaque magenta quad covers only the
    // first point; the second proves the grid remains visible outside its footprint.
    for (const sample of [coplanar, front]) {
      expect(sample.inside.magenta, JSON.stringify(samples)).toBeGreaterThan(4);
      expect(sample.inside.green, JSON.stringify(samples)).toBe(0);
      expect(sample.outside.green).toBeGreaterThan(0);
      expect(sample.outside.magenta).toBe(0);
    }
    expect(behind.inside.green).toBeGreaterThan(0);
    expect(behind.inside.magenta).toBeGreaterThan(0);
    expect(behind.outside.green).toBeGreaterThan(0);
    expect(behind.outside.magenta).toBe(0);
    expect(farFront.inside.magenta).toBeGreaterThan(8);
    // This larger positive-Z control confirms the camera direction independently:
    // geometry translated toward +Z is in front of the reference grid.
    expect(farFront.inside.magenta).toBeGreaterThan(farFront.inside.green * 4);
  });
});

function depthTemplate(): string {
  return /* html */ `
    <nve-scene aria-label="Coplanar grid" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" phi="${Math.PI / 12}" theta="${-Math.PI / 3}" projection="ortho" frustum-height="8"></nve-scene-camera>
      <nve-scene-gridlines spacing="0.5" count="4" color="#00ff00"></nve-scene-gridlines>
      <nve-scene-triangles data-height="0"></nve-scene-triangles>
    </nve-scene>
    <nve-scene aria-label="Front grid" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" phi="${Math.PI / 12}" theta="${-Math.PI / 3}" projection="ortho" frustum-height="8"></nve-scene-camera>
      <nve-scene-gridlines spacing="0.5" count="4" color="#00ff00"></nve-scene-gridlines>
      <nve-scene-triangles data-height="0.01"></nve-scene-triangles>
    </nve-scene>
    <nve-scene aria-label="Behind grid" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" phi="${Math.PI / 12}" theta="${-Math.PI / 3}" projection="ortho" frustum-height="8"></nve-scene-camera>
      <nve-scene-gridlines spacing="0.5" count="4" color="#00ff00"></nve-scene-gridlines>
      <nve-scene-triangles data-height="-0.01"></nve-scene-triangles>
    </nve-scene>
    <nve-scene aria-label="Far-front grid control" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" phi="${Math.PI / 12}" theta="${-Math.PI / 3}" projection="ortho" frustum-height="8"></nve-scene-camera>
      <nve-scene-gridlines spacing="0.5" count="4" color="#00ff00"></nve-scene-gridlines>
      <nve-scene-triangles data-height="1"></nve-scene-triangles>
    </nve-scene>
    <script type="module">
      import { define } from '@nvidia-elements/core/internal';
      import { Scene } from '../../src/scene/scene.ts';
      import { SceneCamera } from '../../src/camera/camera.ts';
      import { SceneGridlines } from '../../src/gridlines/gridlines.ts';
      import { SceneTriangles } from '../../src/triangles/triangles.ts';
      import { TRI_VERTEX } from '../../src/internal/layouts/built-ins.ts';
      import { writeTriVertex } from '../../src/internal/layouts/helpers.ts';
      define(Scene); define(SceneCamera); define(SceneGridlines); define(SceneTriangles);
      for (const layer of document.querySelectorAll('nve-scene-triangles')) {
        const height = Number(layer.dataset.height);
        const bytes = new Uint8Array(TRI_VERTEX.stride * 6);
        const color = [1, 0, 1, 1];
        const vertices = [[-2, -2, height], [0, -2, height], [0, 2, height], [-2, -2, height], [0, 2, height], [-2, 2, height]];
        vertices.forEach((position, index) => writeTriVertex(bytes, index, { position, color }));
        layer.vertices = bytes;
      }
    </script>
  `;
}
