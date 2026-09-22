// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';
import type { Scene, SceneBounds } from './scene.js';
import type { SceneCamera } from '../camera/camera.js';
import type { SceneFrame } from '../frame/frame.js';
import type { Vec3 } from '../index.js';

interface FitFixture {
  readonly scene: Scene;
  readonly camera: SceneCamera;
  readonly frame: SceneFrame;
  readonly bounds: SceneBounds;
  readonly centers: readonly Vec3[];
  readonly errors: readonly string[];
  settle(): Promise<void>;
}

declare global {
  interface Window {
    fitFixture: FitFixture;
  }
}

describe('bounds fitting through the real renderer', () => {
  for (const projection of ['perspective', 'orthographic'] as const) {
    test.each([0.5, 1, 2])(`contains selected transformed geometry in ${projection} at aspect %s`, async aspect => {
      const result = await visualRunner.inspect(
        `scene-fit-${projection}-${aspect}`,
        fitTemplate(projection, aspect),
        async page => {
          await page.waitForFunction(() => Boolean(window.fitFixture));
          return page.evaluate(async () => {
            const { scene, camera, frame, bounds, centers, settle, errors } = window.fitFixture;
            await scene.ready;
            await settle();
            const rect = scene.getBoundingClientRect();
            const corners = [];
            for (const x of [bounds.minimum[0], bounds.maximum[0]])
              for (const y of [bounds.minimum[1], bounds.maximum[1]])
                for (const z of [bounds.minimum[2], bounds.maximum[2]]) corners.push([x, y, z] as Vec3);
            const projected = corners.map(corner => scene.getClientPoint(corner));
            const { canvas, context } = await pixelContext();
            async function pixelContext() {
              const renderCanvas = scene.shadowRoot?.querySelector('canvas');
              if (!renderCanvas) throw new Error('Missing rendered canvas.');
              const blob = await new Promise<Blob | null>(resolve => renderCanvas.toBlob(resolve));
              if (!blob) throw new Error('Missing rendered pixels.');
              const bitmap = await createImageBitmap(blob);
              const probe = document.createElement('canvas');
              probe.width = bitmap.width;
              probe.height = bitmap.height;
              const sampleContext = probe.getContext('2d');
              if (!sampleContext) throw new Error('Missing pixel context.');
              sampleContext.drawImage(bitmap, 0, 0);
              bitmap.close();
              return { canvas: renderCanvas, context: sampleContext };
            }
            const hits = [];
            const pixels = [];
            for (const center of centers) {
              const point = scene.getClientPoint(center);
              if (!point) throw new Error('Missing submitted center.');
              hits.push((await scene.pick(point.clientX, point.clientY))?.layer.id);
              pixels.push([
                ...context.getImageData(
                  Math.floor(((point.clientX - rect.left) * canvas.width) / rect.width) - 1,
                  Math.floor(((point.clientY - rect.top) * canvas.height) / rect.height) - 1,
                  3,
                  3
                ).data
              ]);
            }
            const fitted = scene.cameraState;
            frame.setPose({ position: [1e12 + 50, 1e12, 1e12], orientation: [0, 0, 0, 1] });
            await settle();
            const unchanged = JSON.stringify(fitted) === JSON.stringify(scene.cameraState);
            // Query and refit the new publication explicitly, then finish with the original view.
            scene.fitCamera(camera, scene.getBounds({ content: [frame] }));
            const refitted = JSON.stringify(fitted) !== JSON.stringify(scene.cameraState);
            frame.setPose({ position: [1e12, 1e12, 1e12], orientation: [0, 0, 0, 1] });
            scene.fitCamera(camera, bounds);
            await settle();
            return {
              projected: projected.map(
                point =>
                  point && {
                    x: (point.clientX - rect.left) / rect.width,
                    y: (point.clientY - rect.top) / rect.height,
                    depth: point.depth,
                    visibility: point.visibility
                  }
              ),
              pixels,
              hits,
              errors,
              unchanged,
              refitted
            };
          });
        }
      );
      for (const point of result.projected) {
        expect(point).not.toBeNull();
        expect(point?.visibility).toBe('visible');
        expect(point?.x).toBeGreaterThanOrEqual(0.099);
        expect(point?.x).toBeLessThanOrEqual(0.901);
        expect(point?.y).toBeGreaterThanOrEqual(0.099);
        expect(point?.y).toBeLessThanOrEqual(0.901);
        expect(point?.depth).toBeGreaterThan(0);
        expect(point?.depth).toBeLessThan(1);
      }
      expect(result.hits).toEqual(['content', 'content', 'content']);
      for (const pixels of result.pixels)
        expect(Math.max(...pixels.filter((_, index) => index % 4 !== 3))).toBeGreaterThan(50);
      expect(result.errors).toEqual([]);
      expect(result.unchanged).toBe(true);
      expect(result.refitted).toBe(true);
    });
  }
});

function fitTemplate(projection: string, aspect: number): string {
  return /* html */ `
    <div id="fit-host"></div>
    <script type="module">
      import { CubeBuffer } from '@nvidia-elements/scene/cubes';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/frame/define.js';
      import '@nvidia-elements/scene/cubes/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      const scene = document.createElement('nve-scene');
      scene.setAttribute('aria-label', 'Fit unfamiliar transformed geometry');
      scene.style.cssText = 'width:${320 * aspect}px;height:320px;background:rgb(0 0 0)';
      const camera = document.createElement('nve-scene-camera');
      camera.behavior = 'orbit'; camera.projection = '${projection}';
      camera.polarAngle = 0.85; camera.azimuth = -1.2;
      const frame = document.createElement('nve-scene-frame');
      frame.setPose({position:[1e12,1e12,1e12], orientation:[0,0,0,1]});
      const inner = document.createElement('nve-scene-frame');
      inner.setPose({position:[17,23,5], orientation:[0,0,Math.sin(0.3),Math.cos(0.3)]});
      const layer = document.createElement('nve-scene-cubes');
      layer.id = 'content';
      const positions = [[-20,-5,0], [0,0,0], [25,8,3]];
      layer.source = new CubeBuffer({records:positions.map((position,index) => ({
        position, size:[5,5,5], color:['#ff3300','#00ff33','#3366ff'][index]
      }))});
      inner.append(layer); frame.append(inner);
      const grid = document.createElement('nve-scene-gridlines');
      scene.append(camera, grid, frame);
      const errors = [];
      scene.addEventListener('nve-scene-error', event => errors.push(event.detail.code));
      document.querySelector('#fit-host').append(scene);
      await Promise.all([scene.updateComplete, grid.updateComplete]);
      const selected = scene.getBounds({content:[scene],exclude:[grid]});
      if (!selected) throw new Error('Missing published box.');
      scene.fitCamera(camera, selected);
      const centers = positions.map(position => inner.getWorldPoint(position));
      const settle = async () => {
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      };
      window.fitFixture = {scene, camera, frame, bounds:selected, centers, errors, settle};
    </script>
  `;
}
