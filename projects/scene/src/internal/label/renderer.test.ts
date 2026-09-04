// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import {
  LabelTextureRenderer,
  createLabelTexturePipeline,
  supportsLabelTextureRendering,
  type LabelTextureRendererDevice,
  type LabelTextureRenderItem
} from './renderer.js';
import type { SceneGPUBuffer, SceneGPUCommandEncoder, SceneGPURenderPass, SceneGPUTexture } from '../gpu/platform.js';

describe(createLabelTexturePipeline.name, () => {
  it('should create a premultiplied, depth-tested sRGB label pipeline without depth writes', () => {
    const gpu = createLabelGpu({ queries: false });
    createLabelTexturePipeline(gpu.device, 'bgra8unorm');

    expect(gpu.pipelineDescriptors).toEqual([
      expect.objectContaining({
        depthStencil: { depthCompare: 'less-equal', depthWriteEnabled: false, format: 'depth24plus' },
        fragment: expect.objectContaining({
          targets: [
            expect.objectContaining({
              blend: expect.objectContaining({ color: expect.objectContaining({ srcFactor: 'one' }) })
            })
          ]
        })
      })
    ]);
  });
});

describe(LabelTextureRenderer.name, () => {
  it('should draw a six-vertex texture quad without requiring an occlusion-query implementation', () => {
    const gpu = createLabelGpu({ queries: false });
    const renderer = new LabelTextureRenderer(gpu.device, 'bgra8unorm');
    const frame = renderer.beginFrame([createItem()]);
    const pass = createPass();

    renderer.draw(pass, frame);

    expect(pass.draw).toHaveBeenCalledWith(6);
    expect(pass.beginOcclusionQuery).not.toHaveBeenCalled();
    expect(gpu.writeBuffer).toHaveBeenCalledWith(expect.anything(), 0, expect.any(Float32Array));
    expect(gpu.destroyedBuffers).toBe(0);
    renderer.disconnect();
    expect(gpu.destroyedBuffers).toBeGreaterThan(0);
  });

  it('should reuse label buffers, bind groups, texture views, and unchanged uniform values', () => {
    const gpu = createLabelGpu({ queries: false });
    const renderer = new LabelTextureRenderer(gpu.device, 'bgra8unorm');
    const key = {};
    const firstTexture = { createView: vi.fn(() => ({})) };
    const secondTexture = { createView: vi.fn(() => ({})) };
    const item = createItem({ key, texture: firstTexture });

    renderer.draw(createPass(), renderer.beginFrame([item]));
    renderer.draw(createPass(), renderer.beginFrame([item]));
    expect(gpu.createBuffer).toHaveBeenCalledOnce();
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(2);
    expect(gpu.writeBuffer).toHaveBeenCalledOnce();
    expect(firstTexture.createView).toHaveBeenCalledOnce();

    const moved = { ...item, quad: { ...item.quad, left: -0.3 } };
    renderer.draw(createPass(), renderer.beginFrame([moved]));
    expect(gpu.createBuffer).toHaveBeenCalledOnce();
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(2);
    expect(gpu.writeBuffer).toHaveBeenCalledTimes(2);

    renderer.draw(createPass(), renderer.beginFrame([{ ...moved, texture: secondTexture }]));
    expect(gpu.createBuffer).toHaveBeenCalledOnce();
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(3);
    expect(secondTexture.createView).toHaveBeenCalledOnce();

    renderer.beginFrame([]);
    expect(gpu.destroyedBuffers).toBe(1);
  });

  it('should resolve and report occlusion results in stable label order', async () => {
    const gpu = createLabelGpu({ queries: true });
    const reported: number[] = [];
    const renderer = new LabelTextureRenderer(gpu.device, 'bgra8unorm');
    const frame = renderer.beginFrame([
      createItem({ onOcclusionSamples: samples => reported.push(samples) }),
      createItem({ onOcclusionSamples: samples => reported.push(samples) })
    ]);
    const pass = createPass();
    const encoder = createEncoder();

    renderer.draw(pass, frame);
    renderer.resolveOcclusion(encoder, frame);
    renderer.readOcclusion(frame);
    await vi.waitFor(() => expect(reported).toEqual([0, 7]));

    expect(pass.beginOcclusionQuery).toHaveBeenNthCalledWith(1, 0);
    expect(pass.beginOcclusionQuery).toHaveBeenNthCalledWith(2, 1);
    expect(encoder.resolveQuerySet).toHaveBeenCalledOnce();
    expect(encoder.copyBufferToBuffer).toHaveBeenCalledOnce();
  });

  it('should skip a query batch while a prior mapped result remains pending', async () => {
    const gpu = createLabelGpu({ delayedMap: true, queries: true });
    const reported: string[] = [];
    const renderer = new LabelTextureRenderer(gpu.device, 'bgra8unorm');
    const first = renderer.beginFrame([createItem({ onOcclusionSamples: () => reported.push('first') })]);
    renderer.readOcclusion(first);
    const second = renderer.beginFrame([createItem({ onOcclusionSamples: () => reported.push('second') })]);

    expect(renderer.getQuerySet(first)).toBeDefined();
    expect(renderer.getQuerySet(second)).toBeUndefined();
    gpu.resolveMap();
    await vi.waitFor(() => expect(reported).toEqual(['first']));

    const third = renderer.beginFrame([createItem({ onOcclusionSamples: () => reported.push('third') })]);
    expect(renderer.getQuerySet(third)).toBeDefined();
  });

  it('should replace undersized query resources and release the previous set after submission', async () => {
    const gpu = createLabelGpu({ queries: true });
    const renderer = new LabelTextureRenderer(gpu.device, 'bgra8unorm');
    const first = renderer.beginFrame([createItem()]);
    const second = renderer.beginFrame([createItem(), createItem()]);

    expect(renderer.getQuerySet(first)).toBeDefined();
    expect(renderer.getQuerySet(second)).toBeDefined();
    await vi.waitFor(() => expect(gpu.destroyedBuffers).toBeGreaterThan(1));
    renderer.disconnect();
  });

  it('should suppress rejected or incomplete mapped query results', async () => {
    const gpu = createLabelGpu({ missingRange: true, queries: true, rejectMap: true });
    const reported = vi.fn();
    const renderer = new LabelTextureRenderer(gpu.device, 'bgra8unorm');
    const frame = renderer.beginFrame([createItem({ onOcclusionSamples: reported })]);

    renderer.readOcclusion(frame);
    renderer.readOcclusion(frame);
    await vi.waitFor(() => expect(reported).not.toHaveBeenCalled());
  });

  it('should skip missing mapped ranges, cap oversized samples, and free cached draw buffers during teardown', async () => {
    const missing = createLabelGpu({ missingRange: true, queries: true });
    const missingRenderer = new LabelTextureRenderer(missing.device, 'bgra8unorm');
    const missingFrame = missingRenderer.beginFrame([createItem({ onOcclusionSamples: vi.fn() })]);
    missingRenderer.readOcclusion(missingFrame);
    await vi.waitFor(() => expect(missing.destroyedBuffers).toBe(0));

    const gpu = createLabelGpu({ queries: true, samples: [BigInt(Number.MAX_SAFE_INTEGER) + 1n] });
    const reported = vi.fn();
    const renderer = new LabelTextureRenderer(gpu.device, 'bgra8unorm');
    const frame = renderer.beginFrame([createItem({ onOcclusionSamples: reported })]);
    renderer.draw(createPass(), frame);
    renderer.readOcclusion(frame);
    await vi.waitFor(() => expect(reported).toHaveBeenCalledWith(Number.MAX_SAFE_INTEGER));
    renderer.disconnect();
    expect(gpu.destroyedBuffers).toBeGreaterThan(0);
  });

  it('should tolerate unavailable query and mapping capabilities, invalid render passes, and repeated teardown', () => {
    const gpu = createLabelGpu({ map: false, queries: false, submissionCompletion: false });
    const renderer = new LabelTextureRenderer(gpu.device, 'bgra8unorm');
    const frame = renderer.beginFrame([createItem()]);

    renderer.draw({ end: () => undefined }, frame);
    renderer.draw(createPass(), frame);
    renderer.resolveOcclusion({ beginRenderPass: () => createPass(), finish: () => ({}) }, frame);
    renderer.readOcclusion(frame);
    renderer.disconnect();
    renderer.disconnect();
    renderer.draw(createPass(), frame);

    expect(gpu.destroyedBuffers).toBeGreaterThan(0);
  });

  it('should retire replacement query resources after a pending map settles and suppress stale callbacks', async () => {
    const gpu = createLabelGpu({ delayedMap: true, queries: true });
    const reported = vi.fn();
    const renderer = new LabelTextureRenderer(gpu.device, 'bgra8unorm');
    const first = renderer.beginFrame([createItem({ onOcclusionSamples: reported })]);
    renderer.readOcclusion(first);
    renderer.disconnect();
    gpu.resolveMap();

    await vi.waitFor(() => expect(gpu.destroyedBuffers).toBeGreaterThan(1));
    expect(reported).not.toHaveBeenCalled();
  });

  it('should identify complete label rendering devices and reject partial device capabilities', () => {
    const gpu = createLabelGpu({ queries: false });
    expect(supportsLabelTextureRendering(gpu.device)).toBe(true);
    expect(supportsLabelTextureRendering({ ...gpu.device, createSampler: undefined })).toBe(false);
    expect(supportsLabelTextureRendering({ ...gpu.device, queue: { submit: () => undefined } })).toBe(false);
  });
});

function createItem(overrides: Partial<LabelTextureRenderItem> = {}): LabelTextureRenderItem {
  return {
    onOcclusionSamples: undefined,
    quad: { bottom: -0.2, depth: 0.5, left: -0.2, right: 0.2, top: 0.2 },
    texture: { createView: () => ({}) },
    ...overrides
  };
}

function createPass() {
  return {
    beginOcclusionQuery: vi.fn<(queryIndex: number) => void>(),
    draw: vi.fn<(vertexCount: number, instanceCount?: number) => void>(),
    end: vi.fn(),
    endOcclusionQuery: vi.fn<() => void>(),
    setBindGroup: vi.fn<(index: number, bindGroup: object) => void>(),
    setPipeline: vi.fn<(pipeline: object) => void>()
  } satisfies SceneGPURenderPass;
}

function createEncoder() {
  return {
    beginRenderPass: () => createPass(),
    copyBufferToBuffer: vi.fn<NonNullable<SceneGPUCommandEncoder['copyBufferToBuffer']>>(),
    finish: () => ({}),
    resolveQuerySet: vi.fn<NonNullable<SceneGPUCommandEncoder['resolveQuerySet']>>()
  } satisfies SceneGPUCommandEncoder;
}

function createLabelGpu(options: {
  delayedMap?: boolean;
  map?: boolean;
  missingRange?: boolean;
  queries: boolean;
  rejectMap?: boolean;
  samples?: readonly bigint[];
  submissionCompletion?: boolean;
}): {
  readonly createBindGroup: ReturnType<typeof vi.fn>;
  readonly createBuffer: ReturnType<typeof vi.fn>;
  readonly destroyedBuffers: number;
  readonly device: LabelTextureRendererDevice;
  readonly pipelineDescriptors: unknown[];
  readonly resolveMap: () => void;
  readonly writeBuffer: ReturnType<typeof vi.fn>;
} {
  const pipelineDescriptors: unknown[] = [];
  const mapped = new BigUint64Array(options.samples ?? [0n, 7n]);
  let destroyedBuffers = 0;
  const writeBuffer = vi.fn();
  const createBindGroup = vi.fn(() => ({}));
  let resolveMap: () => void = () => undefined;
  const createBuffer = vi.fn((descriptor: unknown): SceneGPUBuffer => {
    const usage = getUsage(descriptor);
    return {
      destroy: () => {
        destroyedBuffers += 1;
      },
      getMappedRange: options.missingRange ? () => undefined as unknown as ArrayBuffer : () => mapped.buffer,
      mapAsync:
        usage & 1 && options.map !== false
          ? options.delayedMap
            ? () => new Promise<void>(resolve => (resolveMap = resolve))
            : options.rejectMap
              ? () => Promise.reject(new DOMException('Mapping rejected.', 'AbortError'))
              : () => Promise.resolve()
          : undefined,
      unmap: () => undefined
    };
  });
  const device: LabelTextureRendererDevice = {
    createBindGroup,
    createBuffer,
    createCommandEncoder: () => createEncoder(),
    createQuerySet: options.queries ? () => ({ destroy: () => undefined }) : undefined,
    createRenderPipeline: descriptor => {
      pipelineDescriptors.push(descriptor);
      return { getBindGroupLayout: () => ({}) };
    },
    createSampler: () => ({}),
    createShaderModule: () => ({}),
    destroy: () => undefined,
    lost: new Promise(() => undefined),
    queue: {
      onSubmittedWorkDone: options.submissionCompletion === false ? undefined : () => Promise.resolve(),
      submit: () => undefined,
      writeBuffer
    }
  };
  return {
    createBindGroup,
    createBuffer,
    get destroyedBuffers() {
      return destroyedBuffers;
    },
    device,
    pipelineDescriptors,
    resolveMap: () => resolveMap(),
    writeBuffer
  };
}

function getUsage(descriptor: unknown): number {
  if (typeof descriptor !== 'object' || descriptor === null) return 0;
  const usage = Reflect.get(descriptor, 'usage');
  return typeof usage === 'number' ? usage : 0;
}
