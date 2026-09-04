// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene pyramids visual runtime', () => {
  test('should render flat square-pyramid faces and pick its marker through the real WebGPU profile', async () => {
    const result = await visualRunner.inspect(
      'scene-pyramids-flat-faces',
      /* html */ `
        <nve-scene aria-label="Square pyramid scene" style="width: 512px; height: 512px; background: rgb(0 0 0)">
          <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="8" polar-angle="0.9" azimuth="-0.75" projection="orthographic" frustum-height="4.8"></nve-scene-camera>
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
          const capture = await readCanvas(scene);
          const analysis = analyzeImage(capture.image, capture.width, capture.height);
          const apexWidth = averageWidth({ ...analysis, end: 0.3, start: 0.1 });
          const baseWidth = averageWidth({ ...analysis, end: 0.9, start: 0.7 });
          const targetPixel = findInteriorPixel({ ...analysis, image: capture.image, width: capture.width });
          const hit = await pickPixel({ ...capture, pixel: targetPixel, target: scene });
          return {
            apexWidth,
            baseWidth,
            brightnessRange: Math.max(...analysis.brightness) - Math.min(...analysis.brightness),
            foreground: analysis.brightness.length,
            pick:
              hit?.target.kind === 'instance'
                ? {
                    index: hit.target.index,
                    layerTag: hit.layer.localName,
                    markerId: hit.element.id
                  }
                : null
          };

          async function readCanvas(target: HTMLElement) {
            const canvas = target.shadowRoot?.querySelector('canvas');
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
            return {
              canvas,
              height: probe.height,
              image: context.getImageData(0, 0, probe.width, probe.height).data,
              width: probe.width
            };
          }

          function analyzeImage(image: Uint8ClampedArray, width: number, height: number) {
            const rows = new Map<number, number[]>();
            const brightness: number[] = [];
            for (let y = 0; y < height; y += 1) {
              for (let x = 0; x < width; x += 1) {
                const offset = (y * width + x) * 4;
                const green = getVisibleGreen(image, offset);
                if (green === undefined) continue;
                addRowPixel(rows, y, x);
                brightness.push(green);
              }
            }
            const occupiedRows = [...rows.keys()].sort((left, right) => left - right);
            if (occupiedRows.length < 10) throw new Error('Expected a substantial square-pyramid silhouette.');
            return { brightness, occupiedRows, rows };
          }

          function getVisibleGreen(image: Uint8ClampedArray, offset: number): number | undefined {
            const red = image[offset] ?? 0;
            const green = image[offset + 1] ?? 0;
            const blue = image[offset + 2] ?? 0;
            return green > 25 && green > red * 1.25 && green > blue * 1.25 ? green : undefined;
          }

          function addRowPixel(rows: Map<number, number[]>, y: number, x: number): void {
            const row = rows.get(y);
            if (row) row.push(x);
            else rows.set(y, [x]);
          }

          function averageWidth(options: {
            readonly end: number;
            readonly occupiedRows: number[];
            readonly rows: ReadonlyMap<number, number[]>;
            readonly start: number;
          }) {
            const { end, occupiedRows, rows, start } = options;
            const sample = occupiedRows.slice(
              Math.floor(occupiedRows.length * start),
              Math.ceil(occupiedRows.length * end)
            );
            return sample.reduce((total, y) => total + (rows.get(y)?.length ?? 0), 0) / sample.length;
          }

          function findInteriorPixel(options: {
            readonly image: Uint8ClampedArray;
            readonly occupiedRows: number[];
            readonly rows: ReadonlyMap<number, number[]>;
            readonly width: number;
          }) {
            const { image, occupiedRows, rows, width } = options;
            const left = Math.min(...[...rows.values()].flat().map(x => x));
            const right = Math.max(...[...rows.values()].flat().map(x => x));
            const middleX = (left + right) / 2;
            const middleY = (occupiedRows[0]! + occupiedRows.at(-1)!) / 2;
            const candidates: Array<{ distance: number; x: number; y: number }> = [];
            for (const [y, xs] of rows) {
              for (const x of xs) {
                const offset = (y * width + x) * 4;
                const green = image[offset + 1] ?? 0;
                if (green < 65) continue;
                candidates.push({ distance: Math.hypot(x - middleX, y - middleY), x, y });
              }
            }
            const pixel = candidates.sort(
              (leftCandidate, rightCandidate) => leftCandidate.distance - rightCandidate.distance
            )[0];
            if (!pixel) throw new Error('Expected an interior square-pyramid pixel.');
            return pixel;
          }

          function pickPixel(options: {
            readonly canvas: HTMLCanvasElement;
            readonly height: number;
            readonly pixel: { x: number; y: number };
            readonly target: HTMLElement;
            readonly width: number;
          }) {
            const { canvas, height, pixel, target, width } = options;
            const rect = canvas.getBoundingClientRect();
            return (
              target as unknown as {
                pick(
                  clientX: number,
                  clientY: number
                ): Promise<{
                  element: HTMLElement;
                  layer: HTMLElement;
                  target: { index: number; kind: 'instance' };
                } | null>;
              }
            ).pick(
              rect.left + ((pixel.x + 0.5) / width) * rect.width,
              rect.top + ((pixel.y + 0.5) / height) * rect.height
            );
          }
        })
    );

    expect(result.foreground).toBeGreaterThan(700);
    expect(result.baseWidth).toBeGreaterThan(result.apexWidth * 1.7);
    expect(result.brightnessRange).toBeGreaterThan(25);
    expect(result.pick).toEqual({
      index: 0,
      layerTag: 'nve-scene-pyramids',
      markerId: 'pyramid'
    });
  });
});
