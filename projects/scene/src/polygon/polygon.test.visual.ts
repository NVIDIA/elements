// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene polygon visual runtime', () => {
  test('should render and pick unlit filled instances while leaving a hole empty', async () => {
    const result = await visualRunner.inspect(
      'scene-polygon-hole-instances',
      /* html */ `
        <nve-scene aria-label="polygon scene" style="width: 512px; height: 512px; background: black">
          <nve-scene-camera behavior="top" target="[0,0,0]" height="8"></nve-scene-camera>
          <nve-scene-polygon color="#76b900" geometry='{"outer":[[-3,-3],[3,-3],[3,3],[-3,3]],"holes":[[[-1,-1],[-1,1],[1,1],[1,-1]]]}'>
          </nve-scene-polygon>
          <nve-scene-polygon color="white" geometry='{"outer":[[-0.3,-0.8],[0.3,-0.8],[0.3,0.2],[0.7,0.2],[0,0.9],[-0.7,0.2],[-0.3,0.2]]}'>
            <nve-scene-marker position="[-2.2,0,0.02]" color="cyan"></nve-scene-marker>
            <nve-scene-marker position="[2.2,0,0.02]" orientation="[0,0,0.707107,0.707107]" color="magenta"></nve-scene-marker>
          </nve-scene-polygon>
        </nve-scene>
        <script type="module">
          import '@nvidia-elements/scene/camera/define.js';
          import '@nvidia-elements/scene/polygon/define.js';
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected polygon scene.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          if (!canvas) throw new Error('Expected scene canvas.');
          const rectangle = canvas.getBoundingClientRect();
          const center = await scene.pick(rectangle.left + rectangle.width / 2, rectangle.top + rectangle.height / 2);
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
          if (!blob) throw new Error('Expected scene image.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          if (!context) throw new Error('Expected a 2D probe context.');
          const image = context.getImageData(0, 0, probe.width, probe.height);
          const fillPixel = nearestPixel(
            image,
            [probe.width / 2, probe.height * 0.2],
            (red, green, blue) => green > 130 && red > 60 && red < 170 && blue < 80
          );
          const instancePixel = nearestPixel(
            image,
            [probe.width * 0.225, probe.height / 2],
            (red, green, blue) => red < 80 && green > 170 && blue > 170
          );
          if (!fillPixel || !instancePixel) throw new Error('Expected polygon fill and instance pixels.');
          const pickPixel = (pixel: readonly [number, number]) =>
            scene.pick(
              rectangle.left + ((pixel[0] + 0.5) / probe.width) * rectangle.width,
              rectangle.top + ((pixel[1] + 0.5) / probe.height) * rectangle.height
            );
          const fill = await pickPixel(fillPixel);
          const instance = await pickPixel(instancePixel);
          const summarize = (hit: Awaited<ReturnType<typeof scene.pick>>) =>
            hit
              ? {
                  elementTag: hit.element.localName,
                  instanceIndex: hit.instanceIndex,
                  layerTag: hit.layer.localName
                }
              : null;
          const fillOffset = (fillPixel[1] * probe.width + fillPixel[0]) * 4;
          return {
            center: summarize(center),
            centerPixel: [...context.getImageData(probe.width / 2, probe.height / 2, 1, 1).data],
            fill: summarize(fill),
            instance: summarize(instance),
            pixel: [...image.data.slice(fillOffset, fillOffset + 4)]
          };

          function nearestPixel(
            source: ImageData,
            target: readonly [number, number],
            matches: (red: number, green: number, blue: number) => boolean
          ): [number, number] | undefined {
            let nearest: [number, number] | undefined;
            let nearestDistance = Number.POSITIVE_INFINITY;
            for (let y = 0; y < source.height; y += 1) {
              for (let x = 0; x < source.width; x += 1) {
                const offset = (y * source.width + x) * 4;
                if (!matches(source.data[offset] ?? 0, source.data[offset + 1] ?? 0, source.data[offset + 2] ?? 0)) {
                  continue;
                }
                const distance = Math.hypot(x - target[0], y - target[1]);
                if (distance < nearestDistance) {
                  nearest = [x, y];
                  nearestDistance = distance;
                }
              }
            }
            return nearest;
          }
        })
    );
    expect(result.center).toBeNull();
    expect(result.centerPixel.slice(0, 3)).toEqual([0, 0, 0]);
    expect(result.fill).toMatchObject({ elementTag: 'nve-scene-polygon', layerTag: 'nve-scene-polygon' });
    expect(result.instance).toMatchObject({ elementTag: 'nve-scene-marker', layerTag: 'nve-scene-polygon' });
    expect(result.instance?.instanceIndex).toBe(0);
    expect(result.pixel?.[1]).toBeGreaterThan(170);
  });
});
