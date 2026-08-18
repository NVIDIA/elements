// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuVisualRunner } from '@internals/vite';

describe('scene points visual runtime', () => {
  test('preserves sRGB point colors through the canvas output pipeline', async () => {
    const pixel = await webgpuVisualRunner.inspect(
      'scene-points-srgb-output',
      `<nve-scene aria-label="sRGB point" style="width:32px;height:32px;background:rgb(0 0 0)"><nve-scene-points id="points" size="16" size-unit="pixel"></nve-scene-points></nve-scene><script type="module">
        import { POINT, writePoint } from '@nvidia-elements/scene';
        import '@nvidia-elements/scene/points/define.js';
        const bytes = new Uint8Array(POINT.stride);
        writePoint(bytes, 0, { position: [0, 0, 0], color: [116 / 255, 184 / 255, 0, 1] });
        document.querySelector('#points').instances = bytes;
      </script>`,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected sRGB points scene.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          const blob = await new Promise<Blob | null>(resolve => canvas?.toBlob(resolve));
          if (!blob) throw new Error('Expected points canvas.');
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

    expect(pixel?.[0]).toBeCloseTo(116, 0);
    expect(pixel?.[1]).toBeCloseTo(184, 0);
    expect(pixel?.[2]).toBe(0);
    expect(pixel?.[3]).toBe(255);
  });

  test('draws the deterministic count prefix with alpha', async () => {
    const pixels = await webgpuVisualRunner.inspect(
      'scene-points-layer',
      `<nve-scene aria-label="points" style="width: 32px;height:32px;background:rgb(0 0 0)"><nve-scene-points id="points" size="6"></nve-scene-points></nve-scene><script type="module">
        import { POINT, writePoint } from '@nvidia-elements/scene';
        import '@nvidia-elements/scene/points/define.js';
        const bytes = new Uint8Array(POINT.stride * 2);
        writePoint(bytes, 0, { position: [0, 0, 0], color: [1, 0, 0, 0.5] });
        writePoint(bytes, 1, { position: [0.8, 0, 0], color: [0, 1, 0, 1] });
        const layer = document.querySelector('#points');
        layer.instances = bytes;
        layer.count = 1;
      </script>`,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected points scene.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          const blob = await new Promise<Blob | null>(resolve => canvas?.toBlob(resolve));
          if (!blob) throw new Error('Expected points canvas.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          if (!context) return null;
          const data = context.getImageData(0, 0, probe.width, probe.height).data;
          let colored = 0;
          for (let index = 0; index < data.length; index += 4) {
            if (data[index] > 20 || data[index + 1] > 20) colored += 1;
          }
          return { center: [...context.getImageData(probe.width / 2, probe.height / 2, 1, 1).data], colored };
        })
    );
    expect(pixels?.colored).toBeGreaterThan(1);
    expect(pixels?.center[0]).toBeGreaterThan(pixels?.center[1] ?? 255);
  });

  test('projects world-sized points in scene units while preserving pixel-sized points', async () => {
    const bounds = await webgpuVisualRunner.inspect(
      'scene-point-size-units',
      `<nve-scene aria-label="point size units" style="width:64px;height:64px;background:rgb(0 0 0)"><nve-scene-camera behavior="top" target="[0,0,0]" height="4"></nve-scene-camera><nve-scene-points id="world" size="1" size-unit="world"></nve-scene-points><nve-scene-points id="pixel" size="8"></nve-scene-points></nve-scene><script type="module">
        import { POINT, writePoint } from '@nvidia-elements/scene';
        import '@nvidia-elements/scene/camera/define.js';
        import '@nvidia-elements/scene/points/define.js';
        const setPoint = (id, position, color) => {
          const bytes = new Uint8Array(POINT.stride);
          writePoint(bytes, 0, { position, color });
          document.querySelector(id).instances = bytes;
        };
        setPoint('#world', [-1, 0, 0], [1, 0, 0, 1]);
        setPoint('#pixel', [1, 0, 0], [0, 1, 0, 1]);
      </script>`,
      page =>
        page.evaluate(async () => {
          const required = <Value>(value: Value | null | undefined, message: string): Value => {
            if (value === null || value === undefined) throw new Error(message);
            return value;
          };
          const scene = required(document.querySelector('nve-scene'), 'Expected point size scene.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = required(scene.shadowRoot?.querySelector('canvas'), 'Expected points canvas.');
          const blob = required(await new Promise<Blob | null>(resolve => canvas.toBlob(resolve)), 'Expected blob.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = required(probe.getContext('2d'), 'Expected 2D context.');
          context.drawImage(bitmap, 0, 0);
          bitmap.close();
          const data = context.getImageData(0, 0, probe.width, probe.height).data;
          const ranges = {
            pixel: { maximumX: -Infinity, maximumY: -Infinity, minimumX: Infinity, minimumY: Infinity },
            world: { maximumX: -Infinity, maximumY: -Infinity, minimumX: Infinity, minimumY: Infinity }
          };
          for (let y = 0; y < probe.height; y += 1) {
            for (let x = 0; x < probe.width; x += 1) {
              const offset = (y * probe.width + x) * 4;
              const key = data[offset] > data[offset + 1] ? 'world' : data[offset + 1] > 20 ? 'pixel' : undefined;
              if (key) {
                ranges[key].minimumX = Math.min(ranges[key].minimumX, x);
                ranges[key].maximumX = Math.max(ranges[key].maximumX, x);
                ranges[key].minimumY = Math.min(ranges[key].minimumY, y);
                ranges[key].maximumY = Math.max(ranges[key].maximumY, y);
              }
            }
          }
          const rect = canvas.getBoundingClientRect();
          const worldHit = await scene.pick(
            rect.left + (((ranges.world.minimumX + ranges.world.maximumX) * 0.5 + 0.5) / canvas.width) * rect.width,
            rect.top + (((ranges.world.minimumY + ranges.world.maximumY) * 0.5 + 0.5) / canvas.height) * rect.height
          );
          return {
            pixel: ranges.pixel.maximumX - ranges.pixel.minimumX + 1,
            world: ranges.world.maximumX - ranges.world.minimumX + 1,
            worldHit: worldHit ? { index: worldHit.instanceIndex, layer: worldHit.layer.id } : null
          };
        })
    );

    expect(bounds?.pixel).toBeGreaterThanOrEqual(7);
    expect(bounds?.pixel).toBeLessThanOrEqual(9);
    expect(bounds?.world).toBeGreaterThanOrEqual(15);
    expect(bounds?.world).toBeLessThanOrEqual(17);
    expect(bounds?.worldHit).toEqual({ index: 0, layer: 'world' });
  });
});
