// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable complexity -- This test exercises an integrated scene-owned WebGPU composition. */

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene pyramids visual runtime', () => {
  test('should render flat square-pyramid faces and pick its marker through the real WebGPU profile', async () => {
    const result = await visualRunner.inspect(
      'scene-pyramids-flat-faces',
      /* html */ `
        <nve-scene aria-label="Square pyramid scene" style="width: 512px; height: 512px; background: rgb(0 0 0)">
          <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="8" phi="0.9" theta="-0.75" projection="ortho" frustum-height="4.8"></nve-scene-camera>
          <nve-scene-pyramids id="pyramids">
            <nve-scene-marker id="pyramid" scale="[2.4,2.4,2.4]" color="#76b900"></nve-scene-marker>
          </nve-scene-pyramids>
        </nve-scene>
        <script type="module">
          import '@nvidia-elements/scene/pyramids/define.js';
          import '@nvidia-elements/scene/camera/define.js';
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!(scene instanceof HTMLElement)) throw new Error('Expected a pyramid scene.');
          await (scene as unknown as { ready: Promise<void> }).ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Expected a scene canvas.');
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
          if (!blob) throw new Error('Expected a scene canvas image.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          if (!context) throw new Error('Expected a 2D canvas probe context.');

          const image = context.getImageData(0, 0, probe.width, probe.height).data;
          const rows = new Map<number, number[]>();
          const brightness: number[] = [];
          for (let y = 0; y < probe.height; y += 1) {
            for (let x = 0; x < probe.width; x += 1) {
              const offset = (y * probe.width + x) * 4;
              const red = image[offset] ?? 0;
              const green = image[offset + 1] ?? 0;
              const blue = image[offset + 2] ?? 0;
              if (green <= 25 || green <= red * 1.25 || green <= blue * 1.25) continue;
              rows.get(y)?.push(x) ?? rows.set(y, [x]);
              brightness.push(green);
            }
          }
          const occupiedRows = [...rows.keys()].sort((left, right) => left - right);
          if (occupiedRows.length < 10) throw new Error('Expected a substantial square-pyramid silhouette.');
          const averageWidth = (start: number, end: number) => {
            const sample = occupiedRows.slice(start, end);
            return sample.reduce((total, y) => total + (rows.get(y)?.length ?? 0), 0) / sample.length;
          };
          const apexWidth = averageWidth(Math.floor(occupiedRows.length * 0.1), Math.ceil(occupiedRows.length * 0.3));
          const baseWidth = averageWidth(Math.floor(occupiedRows.length * 0.7), Math.ceil(occupiedRows.length * 0.9));
          const left = Math.min(...[...rows.values()].flat().map(x => x));
          const right = Math.max(...[...rows.values()].flat().map(x => x));
          const middleX = (left + right) / 2;
          const middleY = (occupiedRows[0]! + occupiedRows.at(-1)!) / 2;
          const candidates: Array<{ distance: number; x: number; y: number }> = [];
          for (const [y, xs] of rows) {
            for (const x of xs) {
              const offset = (y * probe.width + x) * 4;
              const green = image[offset + 1] ?? 0;
              if (green < 65) continue;
              candidates.push({ distance: Math.hypot(x - middleX, y - middleY), x, y });
            }
          }
          const pixel = candidates.sort(
            (leftCandidate, rightCandidate) => leftCandidate.distance - rightCandidate.distance
          )[0];
          if (!pixel) throw new Error('Expected an interior square-pyramid pixel.');
          const rect = canvas.getBoundingClientRect();
          const hit = await (
            scene as unknown as {
              pick(
                clientX: number,
                clientY: number
              ): Promise<{ element: HTMLElement; instanceIndex: number; layer: HTMLElement } | null>;
            }
          ).pick(
            rect.left + ((pixel.x + 0.5) / probe.width) * rect.width,
            rect.top + ((pixel.y + 0.5) / probe.height) * rect.height
          );
          return {
            apexWidth,
            baseWidth,
            brightnessRange: Math.max(...brightness) - Math.min(...brightness),
            foreground: brightness.length,
            pick: hit
              ? {
                  instanceIndex: hit.instanceIndex,
                  layerTag: hit.layer.localName,
                  markerId: hit.element.id
                }
              : null
          };
        })
    );

    expect(result.foreground).toBeGreaterThan(700);
    expect(result.baseWidth).toBeGreaterThan(result.apexWidth * 1.7);
    expect(result.brightnessRange).toBeGreaterThan(25);
    expect(result.pick).toEqual({
      instanceIndex: 0,
      layerTag: 'nve-scene-pyramids',
      markerId: 'pyramid'
    });
  });
});
