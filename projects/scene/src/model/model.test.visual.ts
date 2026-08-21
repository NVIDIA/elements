// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuVisualRunner } from '@internals/vite';

/* eslint-disable complexity -- This is an intentionally integrated source-defined WebGPU fixture. */

describe('scene model visual runtime', () => {
  test('renders, instances, recompiles, matches mesh pixels, and picks compound models through WebGPU', async () => {
    const result = await webgpuVisualRunner.inspect('scene-model-p2', template(), page =>
      page.evaluate(async () => {
        const modelScene = document.querySelector('#model-scene');
        const meshScene = document.querySelector('#mesh-scene');
        const instanceScene = document.querySelector('#instance-scene');
        const chassis = document.querySelector('#chassis');
        if (
          !(modelScene instanceof HTMLElement) ||
          !(meshScene instanceof HTMLElement) ||
          !(instanceScene instanceof HTMLElement) ||
          !(chassis instanceof HTMLElement)
        ) {
          throw new Error('Expected model, mesh, instance scenes and a declarative chassis part.');
        }

        const waitForFrames = async () => {
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        };
        const readImage = async (scene: HTMLElement) => {
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
          return {
            data: [...context.getImageData(0, 0, probe.width, probe.height).data],
            height: probe.height,
            width: probe.width
          };
        };
        const analyze = (image: { data: number[]; height: number; width: number }) => {
          const tintCounts = { blue: 0, green: 0, red: 0 };
          let foreground = 0;
          for (let offset = 0; offset < image.data.length; offset += 4) {
            const red = image.data[offset] ?? 0;
            const green = image.data[offset + 1] ?? 0;
            const blue = image.data[offset + 2] ?? 0;
            if (red + green + blue > 45) foreground += 1;
            if (red > green * 1.35 && red > blue * 1.35) tintCounts.red += 1;
            if (green > red * 1.35 && green > blue * 1.35) tintCounts.green += 1;
            if (blue > red * 1.35 && blue > green * 1.35) tintCounts.blue += 1;
          }
          return { foreground, tintCounts };
        };
        const differenceCount = (left: readonly number[], right: readonly number[]) => {
          let changed = 0;
          for (let index = 0; index < left.length; index += 4) {
            const delta =
              Math.abs((left[index] ?? 0) - (right[index] ?? 0)) +
              Math.abs((left[index + 1] ?? 0) - (right[index + 1] ?? 0)) +
              Math.abs((left[index + 2] ?? 0) - (right[index + 2] ?? 0));
            if (delta > 25) changed += 1;
          }
          return changed;
        };
        const findTargetWheel = (image: { data: number[]; height: number; width: number }) => {
          // For the fixed top camera, world (x, y) maps to screen
          // (width / 2 - y * width / 12, height / 2 - x * height / 9).
          // Only the center instance wheel at world (1.15, 1.2) occupies this region.
          const expected = { x: image.width / 2 - image.width / 10, y: image.height / 2 - (image.height * 1.15) / 9 };
          const candidates: Array<{ distance: number; x: number; y: number }> = [];
          for (let y = Math.floor(expected.y - 10); y <= Math.ceil(expected.y + 10); y += 1) {
            for (let x = Math.floor(expected.x - 7); x <= Math.ceil(expected.x + 7); x += 1) {
              const isWheelGreen = (probeX: number, probeY: number) => {
                if (probeX < 0 || probeY < 0 || probeX >= image.width || probeY >= image.height) return false;
                const offset = (probeY * image.width + probeX) * 4;
                const red = image.data[offset] ?? 0;
                const green = image.data[offset + 1] ?? 0;
                const blue = image.data[offset + 2] ?? 0;
                return green > red * 1.5 && green > blue * 1.5 && red + green + blue > 80;
              };
              if (
                !isWheelGreen(x, y) ||
                !isWheelGreen(x - 1, y) ||
                !isWheelGreen(x + 1, y) ||
                !isWheelGreen(x, y - 1) ||
                !isWheelGreen(x, y + 1)
              ) {
                continue;
              }
              candidates.push({ distance: Math.hypot(x - expected.x, y - expected.y), x, y });
            }
          }
          const candidate = candidates.sort((left, right) => left.distance - right.distance)[0];
          if (!candidate) throw new Error('Expected an interior pixel on the isolated center-instance wheel.');
          return { expected, pixel: candidate };
        };

        await Promise.all(
          [modelScene, meshScene, instanceScene].map(scene => (scene as unknown as { ready: Promise<void> }).ready)
        );
        await waitForFrames();
        const modelBefore = await readImage(modelScene);
        const mesh = await readImage(meshScene);
        const instances = await readImage(instanceScene);
        const wheel = findTargetWheel(instances);
        const canvas = instanceScene.shadowRoot?.querySelector('canvas');
        if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Expected an instance-scene canvas.');
        const rect = canvas.getBoundingClientRect();
        const hit = await (
          instanceScene as unknown as {
            pick(
              clientX: number,
              clientY: number
            ): Promise<{ instanceIndex: number; layer: HTMLElement; marker?: HTMLElement } | null>;
          }
        ).pick(
          rect.left + ((wheel.pixel.x + 0.5) / instances.width) * rect.width,
          rect.top + ((wheel.pixel.y + 0.5) / instances.height) * rect.height
        );

        chassis.setAttribute('scale', '[4.1,1.5,0.5]');
        await waitForFrames();
        const modelAfter = await readImage(modelScene);
        return {
          changedPixels: differenceCount(modelBefore.data, modelAfter.data),
          instance: analyze(instances),
          meshEqualsModel: mesh.data.every((value, index) => value === modelBefore.data[index]),
          model: analyze(modelBefore),
          pick: hit
            ? {
                instanceIndex: hit.instanceIndex,
                layerId: hit.layer.id,
                layerTag: hit.layer.localName,
                marker: hit.marker ?? null
              }
            : null,
          wheel
        };
      })
    );

    expect(result.model.foreground).toBeGreaterThan(900);
    expect(result.meshEqualsModel).toBe(true);
    expect(result.instance.foreground).toBeGreaterThan(result.model.foreground * 1.2);
    expect(result.instance.tintCounts.red).toBeGreaterThan(50);
    expect(result.instance.tintCounts.green).toBeGreaterThan(50);
    expect(result.instance.tintCounts.blue).toBeGreaterThan(50);
    expect(result.changedPixels).toBeGreaterThan(180);
    expect(result.wheel.pixel.distance).toBeLessThanOrEqual(8);
    expect(result.pick).toEqual({
      instanceIndex: 1,
      layerId: 'instance-model',
      layerTag: 'nve-scene-model',
      marker: null
    });
  });
});

function template(): string {
  return /* html */ `
    <nve-scene id="model-scene" aria-label="Declarative compound model" style="width: 192px; height: 144px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" phi="0" theta="0" projection="ortho" frustum-height="8"></nve-scene-camera>
      <nve-scene-model id="model">
        ${partsHtml()}
      </nve-scene-model>
    </nve-scene>
    <nve-scene id="mesh-scene" aria-label="Raw compound mesh" style="width: 192px; height: 144px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" phi="0" theta="0" projection="ortho" frustum-height="8"></nve-scene-camera>
      <nve-scene-mesh id="mesh"></nve-scene-mesh>
    </nve-scene>
    <nve-scene id="instance-scene" aria-label="Instanced compound models" style="width: 192px; height: 144px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" phi="0" theta="0" projection="ortho" frustum-height="9"></nve-scene-camera>
      <nve-scene-model id="instance-model"></nve-scene-model>
    </nve-scene>
    <script type="module">
      import { define } from '@nvidia-elements/core/internal';
      import { Scene } from '../../src/scene/scene.ts';
      import { SceneCamera } from '../../src/camera/camera.ts';
      import { SceneMarker } from '../../src/marker/marker.ts';
      import { SceneMesh } from '../../src/mesh/mesh.ts';
      import { SceneModel } from '../../src/model/model.ts';
      import { ScenePart } from '../../src/model/part.ts';
      import { compileParts } from '../../src/internal/model/compile.ts';
      import { MARKER } from '../../src/internal/layouts/built-ins.ts';
      import { writeMarker } from '../../src/internal/layouts/helpers.ts';

      define(Scene); define(SceneCamera); define(SceneMarker); define(SceneMesh); define(ScenePart); define(SceneModel);
      const parts = () => [
        { shape: 'cube', position: [0, 0, 0], scale: [2.8, 1.5, 0.5], color: [242 / 255, 158 / 255, 20 / 255, 1] },
        { shape: 'pyramid', position: [-0.75, -0.15, 0.7], scale: [0.7, 0.7, 0.55], color: [75 / 255, 86 / 255, 104 / 255, 1] },
        { shape: 'cylinder', position: [0, 0, 0.72], scale: [0.24, 0.24, 1.15], color: [89 / 255, 217 / 255, 115 / 255, 1] },
        { shape: 'cone', position: [0, 0, 1.7], scale: [0.55, 0.55, 0.55], color: [242 / 255, 89 / 255, 26 / 255, 1] },
        { shape: 'sphere', position: [0, 0.3, 1.85], scale: [0.27, 0.27, 0.27], color: [89 / 255, 191 / 255, 1, 1] },
        { shape: 'cylinder', position: [-1.15, -1.2, 0], orientation: [0.70710678, 0, 0, 0.70710678], scale: [0.55, 0.55, 0.32], color: [230 / 255, 230 / 255, 230 / 255, 1] },
        { shape: 'cylinder', position: [1.15, -1.2, 0], orientation: [0.70710678, 0, 0, 0.70710678], scale: [0.55, 0.55, 0.32], color: [230 / 255, 230 / 255, 230 / 255, 1] },
        { shape: 'cylinder', position: [-1.15, 1.2, 0], orientation: [0.70710678, 0, 0, 0.70710678], scale: [0.55, 0.55, 0.32], color: [230 / 255, 230 / 255, 230 / 255, 1] },
        { shape: 'cylinder', position: [1.15, 1.2, 0], orientation: [0.70710678, 0, 0, 0.70710678], scale: [0.55, 0.55, 0.32], color: [230 / 255, 230 / 255, 230 / 255, 1] }
      ];
      const compiled = compileParts(parts());
      const mesh = document.querySelector('#mesh');
      mesh.positions = compiled.positions;
      mesh.normals = compiled.normals;
      mesh.colors = compiled.colors;
      mesh.indices = compiled.indices;
      const instanceModel = document.querySelector('#instance-model');
      instanceModel.parts = parts();
      const records = new Uint8Array(MARKER.stride * 3);
      writeMarker(records, 0, { position: [-3.5, 0, 0], color: [1, 0.25, 0.25, 1] });
      writeMarker(records, 1, { position: [0, 0, 0], color: [0.25, 1, 0.25, 1] });
      writeMarker(records, 2, { position: [3.5, 0, 0], color: [0.25, 0.25, 1, 1] });
      instanceModel.instances = records;
    </script>
  `;
}

function partsHtml(): string {
  return /* html */ `
    <nve-scene-part id="chassis" shape="cube" position="[0,0,0]" scale="[2.8,1.5,0.5]" color="#f29e14"></nve-scene-part>
    <nve-scene-part shape="pyramid" position="[-0.75,-0.15,0.7]" scale="[0.7,0.7,0.55]" color="#4b5668"></nve-scene-part>
    <nve-scene-part shape="cylinder" position="[0,0,0.72]" scale="[0.24,0.24,1.15]" color="#59d973"></nve-scene-part>
    <nve-scene-part shape="cone" position="[0,0,1.7]" scale="[0.55,0.55,0.55]" color="#f2591a"></nve-scene-part>
    <nve-scene-part shape="sphere" position="[0,0.3,1.85]" scale="[0.27,0.27,0.27]" color="#59bfff"></nve-scene-part>
    ${wheelHtml('-1.15', '-1.2')}
    ${wheelHtml('1.15', '-1.2')}
    ${wheelHtml('-1.15', '1.2')}
    ${wheelHtml('1.15', '1.2')}
  `;
}

function wheelHtml(x: string, y: string): string {
  return `<nve-scene-part shape="cylinder" position="[${x},${y},0]" orientation="[0.70710678,0,0,0.70710678]" scale="[0.55,0.55,0.32]" color="#e6e6e6"></nve-scene-part>`;
}
