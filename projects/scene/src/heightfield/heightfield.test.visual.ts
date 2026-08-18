// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuVisualRunner } from '@internals/vite';

/* eslint-disable complexity */

describe('scene heightfield visual runtime', () => {
  test('renders a smooth, colored terrain, updates it without rebuilding topology, and picks its surface', async () => {
    const result = await webgpuVisualRunner.inspect('scene-heightfield-h2', template(), page =>
      page.evaluate(async () => {
        const scene = document.querySelector('nve-scene');
        const terrain = document.querySelector('#terrain');
        const canvas = scene?.shadowRoot?.querySelector('canvas');
        if (
          !(scene instanceof HTMLElement) ||
          !(terrain instanceof HTMLElement) ||
          !(canvas instanceof HTMLCanvasElement)
        ) {
          throw new Error('Expected the heightfield scene, terrain, and canvas.');
        }

        const waitForFrames = async () => {
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        };
        const readImage = async () => {
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
          if (!blob) throw new Error('Expected a terrain canvas image.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          if (!context) throw new Error('Expected a 2D terrain probe context.');
          return {
            data: context.getImageData(0, 0, probe.width, probe.height).data,
            height: probe.height,
            width: probe.width
          };
        };
        const analyze = (image: { data: Uint8ClampedArray; height: number; width: number }) => {
          const active: Array<{ x: number; y: number; luminance: number }> = [];
          let red = 0;
          let green = 0;
          let blue = 0;
          for (let y = 0; y < image.height; y += 1) {
            for (let x = 0; x < image.width; x += 1) {
              const offset = (y * image.width + x) * 4;
              const r = image.data[offset] ?? 0;
              const g = image.data[offset + 1] ?? 0;
              const b = image.data[offset + 2] ?? 0;
              if (r + g + b < 40) continue;
              active.push({ x, y, luminance: 0.2126 * r + 0.7152 * g + 0.0722 * b });
              if (r > g + 18 && r > b + 18) red += 1;
              if (g > r + 12 && g > b + 12) green += 1;
              if (b > r + 12 && b > g + 12) blue += 1;
            }
          }
          if (active.length === 0) throw new Error('Expected visible heightfield pixels.');
          const bounds = active.reduce(
            (current, pixel) => ({
              maxX: Math.max(current.maxX, pixel.x),
              maxY: Math.max(current.maxY, pixel.y),
              minX: Math.min(current.minX, pixel.x),
              minY: Math.min(current.minY, pixel.y)
            }),
            { maxX: -Infinity, maxY: -Infinity, minX: Infinity, minY: Infinity }
          );
          const luminance = new Map(active.map(pixel => [`${pixel.x},${pixel.y}`, pixel.luminance]));
          const diagonalDeltas: number[] = [];
          const axialDeltas: number[] = [];
          for (const pixel of active) {
            for (const [dx, dy, target] of [
              [1, 0, axialDeltas],
              [0, 1, axialDeltas],
              [1, 1, diagonalDeltas],
              [1, -1, diagonalDeltas]
            ] as const) {
              const neighbor = luminance.get(`${pixel.x + dx},${pixel.y + dy}`);
              if (neighbor !== undefined) target.push(Math.abs(pixel.luminance - neighbor));
            }
          }
          diagonalDeltas.sort((left, right) => left - right);
          axialDeltas.sort((left, right) => left - right);
          const percentile = (values: readonly number[], percent: number) =>
            values[Math.floor(values.length * percent)] ?? 0;
          const centerX = (bounds.minX + bounds.maxX) / 2;
          const centerY = (bounds.minY + bounds.maxY) / 2;
          const pickPixel = active
            .filter(pixel => {
              const neighbors = [
                `${pixel.x - 1},${pixel.y}`,
                `${pixel.x + 1},${pixel.y}`,
                `${pixel.x},${pixel.y - 1}`,
                `${pixel.x},${pixel.y + 1}`
              ];
              return neighbors.every(neighbor => luminance.has(neighbor));
            })
            .sort(
              (left, right) =>
                Math.hypot(left.x - centerX, left.y - centerY) - Math.hypot(right.x - centerX, right.y - centerY)
            )[0];
          if (!pickPixel) throw new Error('Expected an interior terrain pixel for picking.');
          return {
            activeCount: active.length,
            axialP95: percentile(axialDeltas, 0.95),
            blue,
            bounds,
            diagonalP95: percentile(diagonalDeltas, 0.95),
            green,
            pickPixel,
            red
          };
        };

        await (scene as unknown as { ready: Promise<void> }).ready;
        await waitForFrames();
        const before = analyze(await readImage());
        const initialCounters = (
          globalThis as typeof globalThis & {
            getSceneMeshUploadSnapshotForTesting(scene: HTMLElement): { rebuilds: number; uploads: number };
          }
        ).getSceneMeshUploadSnapshotForTesting(scene);

        const grid = (globalThis as typeof globalThis & { terrainGrid: { heights: Float32Array; colors: Uint8Array } })
          .terrainGrid;
        for (let index = 0; index < grid.heights.length; index += 1) {
          grid.heights[index] = (grid.heights[index] ?? 0) * -0.65 + 0.5;
          const offset = index * 4;
          grid.colors[offset] = 20;
          grid.colors[offset + 1] = 80 + ((index * 23) % 150);
          grid.colors[offset + 2] = 255 - ((index * 11) % 140);
        }
        (terrain as unknown as { grid: unknown }).grid = grid;
        await waitForFrames();
        const after = analyze(await readImage());
        const updatedCounters = (
          globalThis as typeof globalThis & {
            getSceneMeshUploadSnapshotForTesting(scene: HTMLElement): { rebuilds: number; uploads: number };
          }
        ).getSceneMeshUploadSnapshotForTesting(scene);

        const rect = canvas.getBoundingClientRect();
        const clientX = rect.left + ((after.pickPixel.x + 0.5) / canvas.width) * rect.width;
        const clientY = rect.top + ((after.pickPixel.y + 0.5) / canvas.height) * rect.height;
        const hit = await (
          scene as unknown as {
            pick(
              x: number,
              y: number
            ): Promise<{
              instanceIndex: number;
              layer: HTMLElement;
              marker?: HTMLElement;
              worldPosition: [number, number, number];
            } | null>;
          }
        ).pick(clientX, clientY);
        const world = hit?.worldPosition;
        const bilinear = world
          ? (terrain as unknown as { heightAt(x: number, y: number): number | undefined }).heightAt(world[0], world[1])
          : undefined;
        const deviationBound = world ? triangulatedBilinearDeviationBound(grid, world[0], world[1]) : null;
        return {
          after,
          before,
          counters: { initial: initialCounters, updated: updatedCounters },
          hit: hit
            ? {
                instanceIndex: hit.instanceIndex,
                layerId: hit.layer.id,
                marker: hit.marker ?? null,
                worldPosition: hit.worldPosition
              }
            : null,
          heightDifference: world && bilinear !== undefined ? Math.abs(world[2] - bilinear) : null,
          heightDeviationBound: deviationBound
        };

        function triangulatedBilinearDeviationBound(
          source: { colors: Uint8Array; heights: Float32Array },
          x: number,
          y: number
        ): number {
          const columns = 7;
          const rows = 7;
          const spacing = 1;
          const origin = -3;
          const column = Math.min(columns - 2, Math.max(0, Math.floor((x - origin) / spacing)));
          const row = Math.min(rows - 2, Math.max(0, Math.floor((y - origin) / spacing)));
          const h00 = source.heights[row * columns + column] ?? 0;
          const h10 = source.heights[row * columns + column + 1] ?? 0;
          const h01 = source.heights[(row + 1) * columns + column] ?? 0;
          const h11 = source.heights[(row + 1) * columns + column + 1] ?? 0;
          // The fixed diagonal's linear-vs-bilinear maximum is |twist| / 4.
          return Math.abs(h00 - h10 - h01 + h11) / 4 + 0.015;
        }
      })
    );

    expect(result.before.activeCount).toBeGreaterThan(1_000);
    expect(result.before.bounds.maxX - result.before.bounds.minX).toBeGreaterThan(90);
    expect(result.before.bounds.maxY - result.before.bounds.minY).toBeGreaterThan(55);
    expect(result.before.red).toBeGreaterThan(75);
    expect(result.before.green).toBeGreaterThan(75);
    expect(result.before.blue).toBeGreaterThan(75);
    // Independent image-neighborhood check: a smooth-normal surface has no
    // diagonal-specific luminance jump beyond ordinary local variation.
    expect(result.before.diagonalP95).toBeLessThan(result.before.axialP95 * 1.8 + 8);
    expect(result.after.blue).toBeGreaterThan(result.after.red * 1.5);
    expect(result.after.activeCount).toBeGreaterThan(1_000);
    expect(result.counters.initial.rebuilds).toBe(1);
    expect(result.counters.initial.uploads).toBe(0);
    expect(result.counters.updated.rebuilds).toBe(1);
    expect(result.counters.updated.uploads).toBe(1);
    expect(result.hit).toMatchObject({ instanceIndex: 0, layerId: 'terrain', marker: null });
    expect(result.heightDifference).not.toBeNull();
    expect(result.heightDeviationBound).not.toBeNull();
    expect(result.heightDifference ?? Infinity).toBeLessThanOrEqual(result.heightDeviationBound ?? -Infinity);
  });
});

function template(): string {
  return /* html */ `
    <nve-scene aria-label="Heightfield visual test" style="width: 240px; height: 220px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="10" phi="0.8" theta="0.65" projection="perspective" fovy="${Math.PI / 4}"></nve-scene-camera>
      <nve-scene-heightfield id="terrain" color="#ffffff"></nve-scene-heightfield>
    </nve-scene>
    <script type="module">
      import { define } from '@nvidia-elements/core/internal';
      import { Scene } from '../../src/scene/scene.ts';
      import { SceneCamera } from '../../src/camera/camera.ts';
      import { SceneHeightfield } from '../../src/heightfield/heightfield.ts';
      import { getSceneMeshUploadSnapshotForTesting } from '../../src/internal/testing.ts';
      define(Scene);
      define(SceneCamera);
      define(SceneHeightfield);
      globalThis.getSceneMeshUploadSnapshotForTesting = getSceneMeshUploadSnapshotForTesting;
      const rows = 7;
      const columns = 7;
      const heights = new Float32Array(rows * columns);
      const colors = new Uint8Array(rows * columns * 4);
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column;
          heights[index] = Math.sin(column * 0.9) * Math.cos(row * 0.72) * 0.8 + column * 0.06 - row * 0.035;
          const offset = index * 4;
          colors[offset] = Math.round((column / (columns - 1)) * 255);
          colors[offset + 1] = Math.round((row / (rows - 1)) * 255);
          colors[offset + 2] = Math.round((1 - column / (columns - 1)) * 255);
          colors[offset + 3] = 255;
        }
      }
      globalThis.terrainGrid = { origin: [-3, -3], spacing: 1, columns, rows, heights, colors };
      document.querySelector('#terrain').grid = globalThis.terrainGrid;
    </script>
  `;
}
