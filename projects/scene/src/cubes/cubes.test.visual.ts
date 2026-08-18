// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuVisualRunner } from '@internals/vite';
import type { getSceneInstanceUploadCountForTesting } from '../internal/testing.js';

describe('scene cubes visual runtime', () => {
  test('should render a known cube in the real WebGPU profile', async () => {
    const result = await webgpuVisualRunner.inspect(
      'scene-cubes-marker',
      /* html */ `
        <nve-scene aria-label="cubes scene" style="width: 32px; height: 32px">
          <nve-scene-frame position="[0,0,0]"><nve-scene-cubes>
            <nve-scene-marker position="[0,0,0]" color="#76b900"></nve-scene-marker>
          </nve-scene-cubes></nve-scene-frame>
        </nve-scene>
        <script type="module">
          import '@nvidia-elements/scene/cubes/define.js';
          import '@nvidia-elements/scene/frame/define.js';
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected a scene fixture.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(resolve));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          if (!canvas) throw new Error('Expected a scene canvas.');
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
          if (!blob) throw new Error('Expected a canvas image.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          const pixel = context
            ? [...context.getImageData(Math.floor(probe.width / 2), Math.floor(probe.height / 2), 1, 1).data]
            : null;
          return { markerCount: document.querySelectorAll('nve-scene-cubes nve-scene-marker').length, pixel };
        })
    );
    expect(result.markerCount).toBe(1);
    expect(result.pixel?.[1]).toBeGreaterThan(result.pixel?.[0] ?? 255);
    expect(result.pixel?.[1]).toBeGreaterThan(150);
    expect(result.pixel?.[3]).toBe(255);
  });

  test('should render intersecting translucent cubes independently of layer order', async () => {
    const result = await webgpuVisualRunner.inspect(
      'scene-cubes-order-independent-transparency',
      /* html */ `
        <nve-scene aria-label="First transparent cube scene" style="width: 48px; height: 48px; background: black">
          <nve-scene-frame position="[-0.25,0,0]">
            <nve-scene-cubes>
              <nve-scene-marker scale="[1.4,1,1]" color="rgba(255,0,0,0.35)"></nve-scene-marker>
            </nve-scene-cubes>
          </nve-scene-frame>
          <nve-scene-frame position="[0.25,0,0]">
            <nve-scene-cubes>
              <nve-scene-marker scale="[1,1.4,1]" color="rgba(0,128,255,0.45)"></nve-scene-marker>
            </nve-scene-cubes>
          </nve-scene-frame>
        </nve-scene>
        <nve-scene aria-label="Reversed transparent cube scene" style="width: 48px; height: 48px; background: black">
          <nve-scene-frame position="[0.25,0,0]">
            <nve-scene-cubes>
              <nve-scene-marker scale="[1,1.4,1]" color="rgba(0,128,255,0.45)"></nve-scene-marker>
            </nve-scene-cubes>
          </nve-scene-frame>
          <nve-scene-frame position="[-0.25,0,0]">
            <nve-scene-cubes>
              <nve-scene-marker scale="[1.4,1,1]" color="rgba(255,0,0,0.35)"></nve-scene-marker>
            </nve-scene-cubes>
          </nve-scene-frame>
        </nve-scene>
        <script>
          globalThis.sceneErrors = [];
          const originalError = console.error;
          console.error = (...values) => {
            globalThis.sceneErrors.push(values.map(String).join(' '));
            originalError(...values);
          };
        </script>
        <script type="module">
          import '@nvidia-elements/scene/cubes/define.js';
          import '@nvidia-elements/scene/frame/define.js';
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scenes = [...document.querySelectorAll('nve-scene')];
          await Promise.all(scenes.map(scene => scene.ready));
          await new Promise(resolve => requestAnimationFrame(resolve));
          return {
            errors: globalThis.sceneErrors,
            pixels: await Promise.all(scenes.map(readCenterPixel))
          };

          async function readCenterPixel(target: Element): Promise<number[] | null> {
            const canvas = target.shadowRoot?.querySelector('canvas');
            const blob = await new Promise<Blob | null>(resolve => canvas?.toBlob(resolve));
            if (!blob) return null;
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
          }
        })
    );

    expect(result.errors).toEqual([]);
    expect(result.pixels[0]?.[0]).toBeGreaterThan(10);
    expect(result.pixels[0]?.[2]).toBeGreaterThan(10);
    expect(result.pixels[0]?.[3]).toBe(255);
    expect(result.pixels[0]?.map((channel, index) => Math.abs(channel - (result.pixels[1]?.[index] ?? 255)))).toEqual([
      0, 0, 0, 0
    ]);
  });

  test('should render declarative and streamed cube outlines', async () => {
    const outlinePixels = await webgpuVisualRunner.inspect(
      'scene-cubes-outlines',
      /* html */ `
        <nve-scene aria-label="Outlined volumes" style="width: 64px; height: 64px; background: black">
          <nve-scene-cubes>
            <nve-scene-marker
              position="[-0.65,0,0]"
              color="rgba(255,0,0,0.2)"
              outline-color="rgba(0,255,255,1)"
            ></nve-scene-marker>
          </nve-scene-cubes>
          <nve-scene-cubes id="streamed-outline"></nve-scene-cubes>
        </nve-scene>
        <script type="module">
          import { MARKER, writeMarker } from '@nvidia-elements/scene';
          import '@nvidia-elements/scene/cubes/define.js';
          const bytes = new Uint8Array(MARKER.stride);
          writeMarker(bytes, 0, {
            position: [0.65, 0, 0],
            color: [1, 0, 0, 0.2],
            outlineColor: [0, 1, 1, 1]
          });
          document.querySelector('#streamed-outline').instances = bytes;
        </script>
      `,
      page =>
        // eslint-disable-next-line complexity -- Pixel classification keeps the browser-side visual probe self-contained.
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected a scene fixture.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(resolve));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          const blob = await new Promise<Blob | null>(resolve => canvas?.toBlob(resolve));
          if (!blob) return 0;
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          const data = context?.getImageData(0, 0, probe.width, probe.height).data ?? [];
          let count = 0;
          for (let index = 0; index < data.length; index += 4) {
            if ((data[index + 1] ?? 0) > (data[index] ?? 0) + 20 && (data[index + 2] ?? 0) > (data[index] ?? 0) + 20) {
              count += 1;
            }
          }
          return count;
        })
    );

    expect(outlinePixels).toBeGreaterThan(4);
  });

  test('should render marker and streamed records to equal pixels', async () => {
    const pixels = await webgpuVisualRunner.inspect(
      'scene-cubes-source-equality',
      /* html */ `
        <nve-scene aria-label="Marker cube" style="width: 32px; height: 32px">
          <nve-scene-frame position="[0,0,0]">
            <nve-scene-cubes><nve-scene-marker color="#76b900"></nve-scene-marker></nve-scene-cubes>
          </nve-scene-frame>
        </nve-scene>
        <nve-scene aria-label="Buffer cube" style="width: 32px; height: 32px">
          <nve-scene-frame position="[0,0,0]"><nve-scene-cubes id="buffer-cubes"></nve-scene-cubes></nve-scene-frame>
        </nve-scene>
        <script type="module">
          import { MARKER, writeMarker } from '@nvidia-elements/scene';
          import '@nvidia-elements/scene/cubes/define.js';
          import '@nvidia-elements/scene/frame/define.js';
          const records = new Uint8Array(MARKER.stride);
          writeMarker(records, 0, { position: [0, 0, 0], color: [118 / 255, 185 / 255, 0, 1] });
          document.querySelector('#buffer-cubes').instances = records;
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scenes = [...document.querySelectorAll('nve-scene')];
          await Promise.all(scenes.map(scene => scene.ready));
          await new Promise(resolve => requestAnimationFrame(resolve));
          return Promise.all(scenes.map(readCenterPixel));

          async function readCenterPixel(target: Element): Promise<number[] | null> {
            const canvas = target.shadowRoot?.querySelector('canvas');
            const blob = await new Promise<Blob | null>(resolve => canvas?.toBlob(resolve));
            if (!blob) return null;
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
          }
        })
    );

    expect(pixels[0]).not.toEqual([0, 0, 0, 0]);
    expect(pixels[1]).toEqual(pixels[0]);
  });

  test('should update frame uniforms without re-uploading instances', async () => {
    const uploads = await webgpuVisualRunner.inspect(
      'scene-cubes-frame-uniform',
      /* html */ `
        <nve-scene aria-label="Moving cube" style="width: 32px; height: 32px">
          <nve-scene-frame position="[0,0,0]">
            <nve-scene-cubes><nve-scene-marker color="#76b900"></nve-scene-marker></nve-scene-cubes>
          </nve-scene-frame>
        </nve-scene>
        <script type="module">
          import { Scene } from '../../src/scene/scene.ts';
          import { SceneFrame } from '../../src/frame/frame.ts';
          import { SceneMarker } from '../../src/marker/marker.ts';
          import { SceneCubes } from '../../src/cubes/cubes.ts';
          import { getSceneInstanceUploadCountForTesting } from '../../src/internal/testing.ts';
          customElements.define(Scene.metadata.tag, Scene);
          customElements.define(SceneFrame.metadata.tag, SceneFrame);
          customElements.define(SceneMarker.metadata.tag, SceneMarker);
          customElements.define(SceneCubes.metadata.tag, SceneCubes);
          globalThis.getSceneInstanceUploadCountForTesting = getSceneInstanceUploadCountForTesting;
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          const frame = document.querySelector('nve-scene-frame');
          if (!scene || !frame) throw new Error('Expected a scene frame fixture.');
          const getUploadCount = Reflect.get(globalThis, 'getSceneInstanceUploadCountForTesting') as
            | typeof getSceneInstanceUploadCountForTesting
            | undefined;
          if (typeof getUploadCount !== 'function') throw new Error('Expected the scene upload counter.');
          await scene.ready;
          const before = getUploadCount(scene);
          frame.position = [1, 0, 0];
          await frame.updateComplete;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          return { before, after: getUploadCount(scene) };
        })
    );

    expect(uploads.before).toBeGreaterThan(0);
    expect(uploads.after).toBe(uploads.before);
  });
});
