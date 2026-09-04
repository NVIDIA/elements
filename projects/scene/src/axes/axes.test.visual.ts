// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene axes visual runtime', () => {
  test('renders the fixed RGB basis at the independently derived asymmetric-camera positions', async () => {
    const tips = await visualRunner.inspect('scene-axes-orientation-t2', orientationTemplate(), page =>
      page.evaluate(async () => {
        const scene = document.querySelector('nve-scene');
        if (!(scene instanceof HTMLElement)) throw new Error('Expected an axes scene.');
        await (scene as unknown as { ready: Promise<void> }).ready;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const canvas = scene.shadowRoot?.querySelector('canvas');
        if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Expected an axes canvas.');
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
        if (!blob) throw new Error('Expected an axes canvas image.');
        const bitmap = await createImageBitmap(blob);
        const probe = document.createElement('canvas');
        probe.width = bitmap.width;
        probe.height = bitmap.height;
        const context = probe.getContext('2d');
        context?.drawImage(bitmap, 0, 0);
        bitmap.close();
        if (!context) throw new Error('Expected a 2D axes probe context.');
        const pixels = context.getImageData(0, 0, probe.width, probe.height).data;
        return {
          blue: locateTipCluster(pixels, probe.width, { color: 'blue', x: 256, y: 117 }),
          green: locateTipCluster(pixels, probe.width, { color: 'green', x: 336, y: 187 }),
          red: locateTipCluster(pixels, probe.width, { color: 'red', x: 395, y: 296 })
        };

        function locateTipCluster(
          data: Uint8ClampedArray,
          width: number,
          expected: { readonly color: 'blue' | 'green' | 'red'; readonly x: number; readonly y: number }
        ) {
          const points: { readonly x: number; readonly y: number }[] = [];
          for (let y = expected.y - 6; y <= expected.y + 6; y += 1) {
            for (let x = expected.x - 6; x <= expected.x + 6; x += 1) {
              if (isDominant(data, (y * width + x) * 4, expected.color)) points.push({ x, y });
            }
          }
          return {
            count: points.length,
            x: points.reduce((sum, point) => sum + point.x, 0) / Math.max(points.length, 1),
            y: points.reduce((sum, point) => sum + point.y, 0) / Math.max(points.length, 1)
          };
        }

        function isDominant(data: Uint8ClampedArray, index: number, color: 'blue' | 'green' | 'red') {
          const red = data[index] ?? 0;
          const green = data[index + 1] ?? 0;
          const blue = data[index + 2] ?? 0;
          const channels: [number, number, number] =
            color === 'red' ? [red, green, blue] : color === 'green' ? [green, red, blue] : [blue, red, green];
          const [primary, first, second] = channels;
          return (data[index + 3] ?? 0) === 255 && primary >= 20 && primary > first * 1.2 && primary > second * 1.2;
        }
      })
    );

    // Hand-derived for an orthographic 512 x 512 viewport, phi=pi/3 and theta=-pi/3.
    // The view basis is right=(sqrt(3)/2, 1/2, 0) and up=(-1/4, sqrt(3)/4, sqrt(3)/2).
    // With an 8-unit frustum, a point p maps to (256 + 64 * dot(right,p),
    // 256 - 64 * dot(up,p)); tips at 2.5 units are +X=(395,296), +Y=(336,187),
    // +Z=(256,117). These values deliberately do not import or invoke production camera
    // math, so coordinate-system regressions cannot update the expected answer with it.
    expect(tips.red.count).toBeGreaterThan(8);
    expect(Math.abs(tips.red.x - 395)).toBeLessThanOrEqual(7);
    expect(Math.abs(tips.red.y - 296)).toBeLessThanOrEqual(7);
    expect(tips.green.count).toBeGreaterThan(8);
    expect(Math.abs(tips.green.x - 336)).toBeLessThanOrEqual(7);
    expect(Math.abs(tips.green.y - 187)).toBeLessThanOrEqual(7);
    expect(tips.blue.count).toBeGreaterThan(8);
    expect(Math.abs(tips.blue.x - 256)).toBeLessThanOrEqual(7);
    expect(Math.abs(tips.blue.y - 117)).toBeLessThanOrEqual(7);
  });

  test('keeps axes and grids transparent to the WebGPU ID pass and scene click events', async () => {
    const result = await visualRunner.inspect('scene-axes-pick-transparency-t2', pickTemplate(), page =>
      page.evaluate(async () => {
        const scene = document.querySelector('nve-scene');
        const axes = document.querySelector('nve-scene-axes');
        const grid = document.querySelector('nve-scene-gridlines');
        const axesCube = document.querySelector('#axes-cube');
        const gridCube = document.querySelector('#grid-cube');
        if (
          !(scene instanceof HTMLElement) ||
          !(axes instanceof HTMLElement) ||
          !(grid instanceof HTMLElement) ||
          !(axesCube instanceof HTMLElement) ||
          !(gridCube instanceof HTMLElement)
        ) {
          throw new Error('Expected a scene, reference axes, reference grid, and two cube layers.');
        }
        await (scene as unknown as { ready: Promise<void> }).ready;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const canvas = scene.shadowRoot?.querySelector('canvas');
        if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Expected a pick canvas.');
        const rect = canvas.getBoundingClientRect();
        const scale = rect.width / 200;
        const pick = (x: number, y: number) =>
          (scene as unknown as { pick(clientX: number, clientY: number): Promise<unknown> }).pick(
            rect.left + x * scale,
            rect.top + y * scale
          );
        let axesClickEvents = 0;
        let gridClickEvents = 0;
        axes.addEventListener('nve-scene-click', () => (axesClickEvents += 1));
        grid.addEventListener('nve-scene-click', () => (gridClickEvents += 1));
        const axesHit = await pick(151, 116);
        const gridHit = await pick(85, 88);
        axesCube.hidden = true;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const axesHiddenMiss = await pick(151, 116);
        gridCube.remove();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const gridRemovedMiss = await pick(85, 88);
        return {
          axesClickEvents,
          axesHiddenMiss: summarize(axesHiddenMiss),
          axesHit: summarize(axesHit),
          gridClickEvents,
          gridHit: summarize(gridHit),
          gridRemovedMiss: summarize(gridRemovedMiss),
          referenceLayers: [axes.id, grid.id]
        };

        function summarize(value: unknown) {
          if (value === null) return null;
          const candidate = value as { readonly element: HTMLElement; readonly layer: HTMLElement };
          return { elementId: candidate.element.id, layerId: candidate.layer.id };
        }
      })
    );

    expect(result.axesHit).toEqual({ elementId: 'axes-cube-marker', layerId: 'axes-cube' });
    expect(result.gridHit).toEqual({ elementId: 'grid-cube-marker', layerId: 'grid-cube' });
    expect(result.axesHiddenMiss).toBeNull();
    expect(result.gridRemovedMiss).toBeNull();
    expect(result.axesClickEvents).toBe(0);
    expect(result.gridClickEvents).toBe(0);
    expect(result.referenceLayers).toEqual(['axes', 'grid']);
  });
});

function orientationTemplate(): string {
  return sceneTemplate('<nve-scene-axes length="2.5" width="4"></nve-scene-axes>');
}

function pickTemplate(): string {
  // Each cube is 0.8 units farther along the hand-derived camera forward ray
  // (-sqrt(3)/4, 3/4, -1/2) than its target reference point. The first shares
  // the +X axis tip; the second shares the grid intersection (-1, 0.5, 0).
  return sceneTemplate(/* html */ `
    <nve-scene-axes id="axes" length="2.5" width="4"></nve-scene-axes>
    <nve-scene-gridlines id="grid" spacing="0.5" count="4" width="4"></nve-scene-gridlines>
    <nve-scene-cubes id="axes-cube"><nve-scene-marker id="axes-cube-marker" position="[2.154,0.6,-0.4]" scale="[1,1,1]" color="#ffffff"></nve-scene-marker></nve-scene-cubes>
    <nve-scene-cubes id="grid-cube"><nve-scene-marker id="grid-cube-marker" position="[-1.346,1.1,-0.4]" scale="[1,1,1]" color="#ffffff"></nve-scene-marker></nve-scene-cubes>
  `);
}

function sceneTemplate(layers: string): string {
  return /* html */ `
    <nve-scene aria-label="Axes orientation scene" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" phi="${Math.PI / 3}" theta="${-Math.PI / 3}" projection="ortho" frustum-height="8"></nve-scene-camera>
      ${layers}
    </nve-scene>
    <script type="module">
      import { define } from '@nvidia-elements/core/internal';
      import { Scene } from '../../src/scene/scene.ts';
      import { SceneCamera } from '../../src/camera/camera.ts';
      import { SceneAxes } from '../../src/axes/axes.ts';
      import { SceneGridlines } from '../../src/gridlines/gridlines.ts';
      import { SceneCubes } from '../../src/cubes/cubes.ts';
      import { SceneMarker } from '../../src/marker/marker.ts';
      define(Scene); define(SceneCamera); define(SceneAxes); define(SceneGridlines); define(SceneCubes); define(SceneMarker);
    </script>
  `;
}
