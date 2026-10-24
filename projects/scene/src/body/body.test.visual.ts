// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';
import type { SceneBody } from './body.js';

describe('scene body visual runtime', () => {
  test('renders, instances, recompiles, matches mesh pixels, and picks compound bodies through WebGPU', async () => {
    const result = await visualRunner.inspect('scene-body-p2', template(), page =>
      page.evaluate(async () => {
        const bodyScene = document.querySelector('#body-scene');
        const meshScene = document.querySelector('#mesh-scene');
        const instanceScene = document.querySelector('#instance-scene');
        const chassis = document.querySelector('#chassis');
        if (
          !(bodyScene instanceof HTMLElement) ||
          !(meshScene instanceof HTMLElement) ||
          !(instanceScene instanceof HTMLElement) ||
          !(chassis instanceof HTMLElement)
        ) {
          throw new Error('Expected body, mesh, instance scenes and a declarative chassis shape.');
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
            if (isForeground(red, green, blue)) foreground += 1;
            const tint = classifyTint(red, green, blue);
            if (tint) tintCounts[tint] += 1;
          }
          return { foreground, tintCounts };
        };
        const isForeground = (red: number, green: number, blue: number) => red + green + blue > 45;
        const classifyTint = (red: number, green: number, blue: number): 'blue' | 'green' | 'red' | undefined => {
          if (red > green * 1.35 && red > blue * 1.35) return 'red';
          if (green > red * 1.35 && green > blue * 1.35) return 'green';
          return blue > red * 1.35 && blue > green * 1.35 ? 'blue' : undefined;
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
          // For the fixed top camera, world (x, y) maps to screen using the
          // eleven-unit square frustum used by the instance scene.
          // Only the center instance wheel at world (1.15, 1.2) occupies this region.
          const expected = {
            x: image.width / 2 - (image.width * 1.2) / 11,
            y: image.height / 2 - (image.height * 1.15) / 11
          };
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

        await Promise.all([...document.querySelectorAll<SceneBody>('nve-scene-body')].map(body => body.loadComplete));
        await Promise.all(
          [bodyScene, meshScene, instanceScene].map(scene => (scene as unknown as { ready: Promise<void> }).ready)
        );
        await waitForFrames();
        const bodyBefore = await readImage(bodyScene);
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
            ): Promise<{
              element: HTMLElement;
              layer: HTMLElement;
              target: { index: number; kind: 'instance' };
            } | null>;
          }
        ).pick(
          rect.left + ((wheel.pixel.x + 0.5) / instances.width) * rect.width,
          rect.top + ((wheel.pixel.y + 0.5) / instances.height) * rect.height
        );

        chassis.setAttribute('scale', '[4.1,1.5,0.5]');
        await waitForFrames();
        const bodyAfter = await readImage(bodyScene);
        return {
          changedPixels: differenceCount(bodyBefore.data, bodyAfter.data),
          instance: analyze(instances),
          meshEqualsBody: mesh.data.every((value, index) => value === bodyBefore.data[index]),
          body: analyze(bodyBefore),
          pick:
            hit?.target.kind === 'instance'
              ? {
                  index: hit.target.index,
                  layerId: hit.layer.id,
                  layerTag: hit.layer.localName,
                  marker: hit.element === hit.layer ? null : hit.element.id
                }
              : null,
          wheel
        };
      })
    );

    expect(result.body.foreground).toBeGreaterThan(900);
    expect(result.meshEqualsBody).toBe(true);
    expect(result.instance.foreground).toBeGreaterThan(result.body.foreground * 1.2);
    expect(result.instance.tintCounts.red).toBeGreaterThan(50);
    expect(result.instance.tintCounts.green).toBeGreaterThan(50);
    expect(result.instance.tintCounts.blue).toBeGreaterThan(50);
    expect(result.changedPixels).toBeGreaterThan(180);
    expect(result.wheel.pixel.distance).toBeLessThanOrEqual(8);
    expect(result.pick).toEqual({
      index: 1,
      layerId: 'instance-body',
      layerTag: 'nve-scene-body',
      marker: null
    });
  });
});

function template(): string {
  return /* html */ `
    <nve-scene id="body-scene" aria-label="Declarative compound body" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" polar-angle="0" azimuth="0" projection="orthographic" frustum-height="8"></nve-scene-camera>
      <nve-scene-body id="body">
        ${shapesHtml()}
      </nve-scene-body>
    </nve-scene>
    <nve-scene id="mesh-scene" aria-label="Raw compound mesh" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" polar-angle="0" azimuth="0" projection="orthographic" frustum-height="8"></nve-scene-camera>
      <nve-scene-mesh id="mesh"></nve-scene-mesh>
    </nve-scene>
    <nve-scene id="instance-scene" aria-label="Instanced compound bodies" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" polar-angle="0" azimuth="0" projection="orthographic" frustum-height="11"></nve-scene-camera>
      <nve-scene-body id="instance-body"></nve-scene-body>
    </nve-scene>
    <script type="module">
      import { define } from '@nvidia-elements/core/internal';
      import { Scene } from '../../src/scene/scene.ts';
      import { SceneCamera } from '../../src/camera/camera.ts';
      import { SceneMesh } from '../../src/mesh/mesh.ts';
      import { SceneBody } from '../../src/body/body.ts';
      import { SceneShape } from '../../src/body/shape.ts';
      import { compileShapes } from '../../src/internal/layers/body/compile.ts';
      import { MARKER } from '../../src/internal/records/layouts/built-ins.ts';
      import { writeMarker } from '../../src/internal/records/layouts/codecs.ts';
      import { createMarkerSource } from '../../src/internal/layers/sources/external-record-sources.ts';

      define(Scene); define(SceneCamera); define(SceneMesh); define(SceneShape); define(SceneBody);
      const shapes = () => [
        { type: 'cube', position: [0, 0, 0], scale: [2.8, 1.5, 0.5], color: [242 / 255, 158 / 255, 20 / 255, 1] },
        { type: 'pyramid', position: [-0.75, -0.15, 0.7], scale: [0.7, 0.7, 0.55], color: [75 / 255, 86 / 255, 104 / 255, 1] },
        { type: 'cylinder', position: [0, 0, 0.72], scale: [0.24, 0.24, 1.15], color: [89 / 255, 217 / 255, 115 / 255, 1] },
        { type: 'cone', position: [0, 0, 1.7], scale: [0.55, 0.55, 0.55], color: [242 / 255, 89 / 255, 26 / 255, 1] },
        { type: 'sphere', position: [0, 0.3, 1.85], scale: [0.27, 0.27, 0.27], color: [89 / 255, 191 / 255, 1, 1] },
        { type: 'cylinder', position: [-1.15, -1.2, 0], orientation: [0.70710678, 0, 0, 0.70710678], scale: [0.55, 0.55, 0.32], color: [230 / 255, 230 / 255, 230 / 255, 1] },
        { type: 'cylinder', position: [1.15, -1.2, 0], orientation: [0.70710678, 0, 0, 0.70710678], scale: [0.55, 0.55, 0.32], color: [230 / 255, 230 / 255, 230 / 255, 1] },
        { type: 'cylinder', position: [-1.15, 1.2, 0], orientation: [0.70710678, 0, 0, 0.70710678], scale: [0.55, 0.55, 0.32], color: [230 / 255, 230 / 255, 230 / 255, 1] },
        { type: 'cylinder', position: [1.15, 1.2, 0], orientation: [0.70710678, 0, 0, 0.70710678], scale: [0.55, 0.55, 0.32], color: [230 / 255, 230 / 255, 230 / 255, 1] }
      ];
      const compiled = compileShapes(shapes());
      const mesh = document.querySelector('#mesh');
      mesh.geometry = {
        positions: compiled.positions,
        normals: compiled.normals,
        colors: compiled.colors,
        indices: compiled.indices
      };
      const instanceBody = document.querySelector('#instance-body');
      instanceBody.geometry = shapes();
      await instanceBody.loadComplete;
      const records = new Uint8Array(MARKER.stride * 3);
      writeMarker(records, 0, { position: [-3.5, 0, 0], color: [1, 0.25, 0.25, 1] });
      writeMarker(records, 1, { position: [0, 0, 0], color: [0.25, 1, 0.25, 1] });
      writeMarker(records, 2, { position: [3.5, 0, 0], color: [0.25, 0.25, 1, 1] });
      const source = createMarkerSource({ bytes: records, count: 3 });
      instanceBody.source = source;
    </script>
  `;
}

function shapesHtml(): string {
  return /* html */ `
    <nve-scene-shape id="chassis" type="cube" position="[0,0,0]" scale="[2.8,1.5,0.5]" color="#f29e14"></nve-scene-shape>
    <nve-scene-shape type="pyramid" position="[-0.75,-0.15,0.7]" scale="[0.7,0.7,0.55]" color="#4b5668"></nve-scene-shape>
    <nve-scene-shape type="cylinder" position="[0,0,0.72]" scale="[0.24,0.24,1.15]" color="#59d973"></nve-scene-shape>
    <nve-scene-shape type="cone" position="[0,0,1.7]" scale="[0.55,0.55,0.55]" color="#f2591a"></nve-scene-shape>
    <nve-scene-shape type="sphere" position="[0,0.3,1.85]" scale="[0.27,0.27,0.27]" color="#59bfff"></nve-scene-shape>
    ${wheelHtml('-1.15', '-1.2')}
    ${wheelHtml('1.15', '-1.2')}
    ${wheelHtml('-1.15', '1.2')}
    ${wheelHtml('1.15', '1.2')}
  `;
}

function wheelHtml(x: string, y: string): string {
  return `<nve-scene-shape type="cylinder" position="[${x},${y},0]" orientation="[0.70710678,0,0,0.70710678]" scale="[0.55,0.55,0.32]" color="#e6e6e6"></nve-scene-shape>`;
}
