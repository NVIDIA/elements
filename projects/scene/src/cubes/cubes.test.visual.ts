// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';
import { MARKER_COMPACTION_SHADER } from '../internal/markers/compaction.js';

describe('scene cubes visual runtime', () => {
  test('should render a known cube in the real WebGPU profile', async () => {
    const result = await visualRunner.inspect(
      'scene-cubes-marker',
      /* html */ `
        <nve-scene aria-label="cubes scene" style="width: 512px; height: 512px; background: rgb(0 0 0)">
          <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="8" phi="0.9" theta="-0.75" projection="ortho" frustum-height="3.5"></nve-scene-camera>
          <nve-scene-frame position="[0,0,0]"><nve-scene-cubes>
            <nve-scene-marker position="[0,0,0]" color="#76b900"></nve-scene-marker>
          </nve-scene-cubes></nve-scene-frame>
        </nve-scene>
        <script type="module">
          import '@nvidia-elements/scene/cubes/define.js';
          import '@nvidia-elements/scene/camera/define.js';
          import '@nvidia-elements/scene/frame/define.js';
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected a scene fixture.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
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

  test('should retain a visible GPU-compacted marker after picking', async () => {
    const result = await visualRunner.inspect(
      'scene-cubes-compacted-markers',
      /* html */ `
        <nve-scene aria-label="Compacted cubes" style="width: 512px; height: 512px; background: black">
          <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="8" phi="0.9" theta="-0.75" projection="ortho" frustum-height="3.5"></nve-scene-camera>
          <nve-scene-cubes id="compacted"></nve-scene-cubes>
        </nve-scene>
        <script type="module">
          import { MarkerBuffer } from '@nvidia-elements/scene';
          import '@nvidia-elements/scene/camera/define.js';
          import '@nvidia-elements/scene/cubes/define.js';
          const count = 25_000;
          const markers = new MarkerBuffer({ capacity: count });
          const view = new DataView(markers.bytes.buffer, markers.bytes.byteOffset, markers.bytes.byteLength);
          for (let index = 0; index < count; index += 1) {
            const offset = index * 48;
            view.setFloat32(offset, index === 0 ? 0 : 10_000, true);
            view.setFloat32(offset + 24, 1, true);
            view.setFloat32(offset + 28, 1, true);
            view.setFloat32(offset + 32, 1, true);
            view.setFloat32(offset + 36, 1, true);
            markers.bytes.set([118, 185, 0, 255], offset + 40);
          }
          markers.commit();
          document.querySelector('#compacted').instances = markers;
          const readCompaction = async () => {
            const shader = ${JSON.stringify(MARKER_COMPACTION_SHADER)};
            const adapter = await navigator.gpu.requestAdapter();
            const device = await adapter.requestDevice();
            const module = device.createShaderModule({ code: shader });
            const compilation = await module.getCompilationInfo();
            const errors = compilation.messages.filter(message => message.type === 'error');
            if (errors.length > 0) throw new Error(errors.map(message => message.message).join('\\n'));
            const count = 4;
            const sourceData = new Uint32Array(count * 12);
            const sourceBytes = new Uint8Array(sourceData.buffer);
            const sourceFloats = new Float32Array(sourceData.buffer);
            const records = [[0, 255], [0.5, 128], [10, 255], [1.8, 64]];
            for (let index = 0; index < records.length; index += 1) {
              const [position, alpha] = records[index];
              const base = index * 12;
              sourceFloats[base] = position;
              sourceFloats[base + 7] = 1;
              sourceFloats[base + 8] = 1;
              sourceFloats[base + 9] = 1;
              sourceBytes[index * 48 + 43] = alpha;
            }
            const source = device.createBuffer({ size: sourceBytes.byteLength, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE });
            device.queue.writeBuffer(source, 0, sourceData);
            const uniformData = new Float32Array(36);
            for (const index of [0, 5, 10, 15, 16, 21, 26, 31]) uniformData[index] = 1;
            uniformData[32] = count;
            const uniform = device.createBuffer({ size: uniformData.byteLength, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM });
            device.queue.writeBuffer(uniform, 0, uniformData);
            const opaque = device.createBuffer({ size: 16, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE });
            const transparent = device.createBuffer({ size: 16, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE });
            const argumentsBuffer = device.createBuffer({ size: 40, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.INDIRECT | GPUBufferUsage.STORAGE });
            device.queue.writeBuffer(argumentsBuffer, 0, new Uint32Array([36, 0, 0, 0, 0, 36, 0, 0, 0, 0]));
            const pipeline = device.createComputePipeline({ layout: 'auto', compute: { module, entryPoint: 'main' } });
            const sceneBindGroup = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: uniform } }] });
            const bindGroup = device.createBindGroup({
              layout: pipeline.getBindGroupLayout(1),
              entries: [
                { binding: 0, resource: { buffer: source } },
                { binding: 1, resource: { buffer: opaque } },
                { binding: 2, resource: { buffer: transparent } },
                { binding: 3, resource: { buffer: argumentsBuffer } }
              ]
            });
            const encoder = device.createCommandEncoder();
            const pass = encoder.beginComputePass();
            pass.setPipeline(pipeline);
            pass.setBindGroup(0, sceneBindGroup);
            pass.setBindGroup(1, bindGroup);
            pass.dispatchWorkgroups(1);
            pass.end();
            const readback = size => device.createBuffer({ size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
            const argumentsReadback = readback(40);
            const opaqueReadback = readback(16);
            const transparentReadback = readback(16);
            encoder.copyBufferToBuffer(argumentsBuffer, 0, argumentsReadback, 0, 40);
            encoder.copyBufferToBuffer(opaque, 0, opaqueReadback, 0, 16);
            encoder.copyBufferToBuffer(transparent, 0, transparentReadback, 0, 16);
            device.queue.submit([encoder.finish()]);
            await device.queue.onSubmittedWorkDone();
            const read = async buffer => {
              await buffer.mapAsync(GPUMapMode.READ);
              const values = [...new Uint32Array(buffer.getMappedRange())];
              buffer.unmap();
              return values;
            };
            const argumentValues = await read(argumentsReadback);
            const opaqueValues = await read(opaqueReadback);
            const transparentValues = await read(transparentReadback);
            const result = {
              opaqueCount: argumentValues[1],
              opaqueIndices: opaqueValues.slice(0, argumentValues[1]).sort((left, right) => left - right),
              transparentCount: argumentValues[6],
              transparentIndices: transparentValues.slice(0, argumentValues[6]).sort((left, right) => left - right)
            };
            for (const buffer of [source, uniform, opaque, transparent, argumentsBuffer, argumentsReadback, opaqueReadback, transparentReadback]) buffer.destroy();
            device.destroy();
            return result;
          };
          readCompaction()
            .then(result => { document.documentElement.dataset.markerCompaction = JSON.stringify(result); })
            .catch(error => { document.documentElement.dataset.markerCompaction = JSON.stringify({ error: String(error) }); });
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected a compacted marker scene.');
          await scene.ready;
          while (!document.documentElement.dataset.markerCompaction) {
            await new Promise(resolve => requestAnimationFrame(resolve));
          }
          const compaction = JSON.parse(document.documentElement.dataset.markerCompaction);
          if (compaction.error) throw new Error(compaction.error);
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          const layer = document.querySelector('nve-scene-cubes');
          if (!canvas || !layer) throw new Error('Expected compacted marker rendering resources.');
          const beforePick = await readCenterPixel(canvas);
          const bounds = canvas.getBoundingClientRect();
          await scene.pick(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
          layer.commit();
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          return {
            compaction,
            beforePick,
            afterPick: await readCenterPixel(canvas)
          };

          async function readCenterPixel(target: HTMLCanvasElement): Promise<number[] | null> {
            const blob = await new Promise<Blob | null>(resolve => target.toBlob(resolve));
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

    expect(result.beforePick?.[1]).toBeGreaterThan(result.beforePick?.[0] ?? 255);
    expect(result.beforePick?.[1]).toBeGreaterThan(100);
    expect(result.beforePick?.[3]).toBe(255);
    expect(result.afterPick).toEqual(result.beforePick);
    expect(result.compaction).toEqual({
      opaqueCount: 1,
      opaqueIndices: [0],
      transparentCount: 2,
      transparentIndices: [1, 3]
    });
  });

  test('should render intersecting translucent cubes independently of layer order', async () => {
    const result = await visualRunner.inspect(
      'scene-cubes-order-independent-transparency',
      /* html */ `
        <nve-scene aria-label="First transparent cube scene" style="width: 512px; height: 512px; background: black">
          <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="8" phi="0.9" theta="-0.75" projection="ortho" frustum-height="3.5"></nve-scene-camera>
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
        <nve-scene aria-label="Reversed transparent cube scene" style="width: 512px; height: 512px; background: black">
          <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="8" phi="0.9" theta="-0.75" projection="ortho" frustum-height="3.5"></nve-scene-camera>
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
          import '@nvidia-elements/scene/camera/define.js';
          import '@nvidia-elements/scene/cubes/define.js';
          import '@nvidia-elements/scene/frame/define.js';
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scenes = [...document.querySelectorAll('nve-scene')];
          await Promise.all(scenes.map(scene => scene.ready));
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          return {
            errors: (globalThis as typeof globalThis & { sceneErrors: string[] }).sceneErrors,
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
    const outlinePixels = await visualRunner.inspect(
      'scene-cubes-outlines',
      /* html */ `
        <nve-scene aria-label="Outlined volumes" style="width: 512px; height: 512px; background: black">
          <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="8" phi="0.9" theta="-0.75" projection="ortho" frustum-height="3.5"></nve-scene-camera>
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
          import { MarkerBuffer } from '@nvidia-elements/scene';
          import '@nvidia-elements/scene/camera/define.js';
          import '@nvidia-elements/scene/cubes/define.js';
          const markers = new MarkerBuffer({ capacity: 1 });
          markers.add({
            position: [0.65, 0, 0],
            color: [1, 0, 0, 0.2],
            outlineColor: [0, 1, 1, 1]
          });
          document.querySelector('#streamed-outline').instances = markers;
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
    const pixels = await visualRunner.inspect(
      'scene-cubes-source-equality',
      /* html */ `
        <nve-scene aria-label="Marker cube" style="width: 512px; height: 512px; background: rgb(0 0 0)">
          <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="8" phi="0.9" theta="-0.75" projection="ortho" frustum-height="3.5"></nve-scene-camera>
          <nve-scene-frame position="[0,0,0]">
            <nve-scene-cubes><nve-scene-marker color="#76b900"></nve-scene-marker></nve-scene-cubes>
          </nve-scene-frame>
        </nve-scene>
        <nve-scene aria-label="Buffer cube" style="width: 512px; height: 512px; background: rgb(0 0 0)">
          <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="8" phi="0.9" theta="-0.75" projection="ortho" frustum-height="3.5"></nve-scene-camera>
          <nve-scene-frame position="[0,0,0]"><nve-scene-cubes id="buffer-cubes"></nve-scene-cubes></nve-scene-frame>
        </nve-scene>
        <script type="module">
          import { MarkerBuffer } from '@nvidia-elements/scene';
          import '@nvidia-elements/scene/camera/define.js';
          import '@nvidia-elements/scene/cubes/define.js';
          import '@nvidia-elements/scene/frame/define.js';
          const markers = new MarkerBuffer({ capacity: 1 });
          markers.add({ position: [0, 0, 0], color: '#76b900' });
          document.querySelector('#buffer-cubes').instances = markers;
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
});
