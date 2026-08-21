// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuVisualRunner } from '@internals/vite';

describe('label texture renderer WebGPU isolation', () => {
  test('renders a premultiplied sRGB label quad at its requested CSS-pixel clip bounds', async () => {
    const result = await webgpuVisualRunner.inspect('scene-label-texture-renderer', template('visible'), page =>
      page.evaluate(async () => {
        await waitFor(() => document.documentElement.dataset.labelReady === 'true');
        const canvas = document.querySelector('canvas');
        if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Expected a label test canvas.');
        const pixels = JSON.parse(document.querySelector('output')?.textContent ?? '{}') as {
          readonly center: number[];
          readonly error?: string;
          readonly outside: number[];
        };
        return {
          center: pixels.center,
          error: pixels.error,
          outside: pixels.outside,
          size: [canvas.width, canvas.height]
        };
        async function waitFor(predicate: () => boolean): Promise<void> {
          while (!predicate()) await new Promise(resolve => requestAnimationFrame(resolve));
        }
      })
    );

    expect(result.size).toEqual([32, 32]);
    expect(result.error, JSON.stringify(result)).toBeUndefined();
    // The software adapter's preferred surface is BGRA, so compare the raw
    // target channels instead of assuming RGBA byte order.
    expect(result.center[0], JSON.stringify(result)).toBeLessThan(result.outside[0] ?? 0);
    expect(result.center[2], JSON.stringify(result)).toBeGreaterThan(result.outside[2] ?? 255);
    expect(result.outside).toEqual([255, 0, 0, 255]);
  });

  test('keeps a full-depth-occluded label out of the color target and reports zero samples when supported', async () => {
    const result = await webgpuVisualRunner.inspect('scene-label-texture-depth', template('occluded'), page =>
      page.evaluate(async () => {
        await waitFor(() => document.documentElement.dataset.labelReady === 'true');
        return JSON.parse(document.querySelector('output')?.textContent ?? '{}') as {
          readonly sample?: number;
          readonly supported: boolean;
        };
        async function waitFor(predicate: () => boolean): Promise<void> {
          while (!predicate()) await new Promise(resolve => requestAnimationFrame(resolve));
        }
      })
    );

    expect(result.supported).toBe(true);
    expect(result.sample).toBe(0);
  });
});

function template(mode: 'occluded' | 'visible'): string {
  const depth = mode === 'occluded' ? 0.25 : 1;
  return /* html */ `
    <canvas width="32" height="32"></canvas><output></output>
    <script type="module">
      import { LabelTextureRenderer } from '../../src/internal/label/renderer.ts';
      const canvas = document.querySelector('canvas');
      const output = document.querySelector('output');
      const adapter = await navigator.gpu.requestAdapter();
      const device = await adapter.requestDevice();
      const context = canvas.getContext('webgpu');
      const format = navigator.gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: 'premultiplied', usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
      const texture = device.createTexture({
        format: 'rgba8unorm-srgb', size: [2, 2], usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
      });
      device.queue.writeTexture({ texture }, new Uint8Array([128, 0, 0, 128, 128, 0, 0, 128, 128, 0, 0, 128, 128, 0, 0, 128]), { bytesPerRow: 8 }, [2, 2]);
      const depthTexture = device.createTexture({ format: 'depth24plus', size: [32, 32], usage: GPUTextureUsage.RENDER_ATTACHMENT });
      const renderer = new LabelTextureRenderer(device, format);
      device.pushErrorScope('validation');
      let sample;
      const frame = renderer.beginFrame([{
        texture,
        quad: { left: -0.5, top: 0.5, right: 0.5, bottom: -0.5, depth: 0.5 },
        onOcclusionSamples: value => { sample = value; }
      }]);
      const encoder = device.createCommandEncoder();
      const readback = device.createBuffer({ size: 32 * 256, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
      const surfaceTexture = context.getCurrentTexture();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{ view: surfaceTexture.createView(), clearValue: { r: 0, g: 0, b: 1, a: 1 }, loadOp: 'clear', storeOp: 'store' }],
        depthStencilAttachment: { view: depthTexture.createView(), depthClearValue: ${depth}, depthLoadOp: 'clear', depthStoreOp: 'discard' },
        occlusionQuerySet: renderer.getQuerySet(frame)
      });
      renderer.draw(pass, frame);
      pass.end();
      renderer.resolveOcclusion(encoder, frame);
      encoder.copyTextureToBuffer({ texture: surfaceTexture }, { buffer: readback, bytesPerRow: 256 }, [32, 32]);
      device.queue.submit([encoder.finish()]);
      renderer.readOcclusion(frame);
      renderer.afterSubmission();
      await device.queue.onSubmittedWorkDone();
      await readback.mapAsync(GPUMapMode.READ);
      const bytes = new Uint8Array(readback.getMappedRange());
      const pixel = (x, y) => [...bytes.slice(y * 256 + x * 4, y * 256 + x * 4 + 4)];
      const center = pixel(16, 16);
      const outside = pixel(2, 2);
      readback.unmap();
      for (let attempt = 0; attempt < 20 && sample === undefined; attempt += 1) await new Promise(resolve => requestAnimationFrame(resolve));
      const error = await device.popErrorScope();
      output.textContent = JSON.stringify({ center, error: error?.message, outside, sample, supported: renderer.getQuerySet(frame) !== undefined });
      document.documentElement.dataset.labelReady = 'true';
    </script>
  `;
}
