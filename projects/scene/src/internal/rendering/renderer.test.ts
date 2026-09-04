// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { LINE_VERTEX, MARKER, POINT, TRI_VERTEX } from '../layouts/built-ins.js';
import { writeLineVertex, writeMarker, writePoint, writeTriVertex } from '../layouts/helpers.js';
import { identityMat4 } from '../math/mat4.js';
import type { MarkerBounds } from '../markers/bounds.js';
import type { LabelTextureRenderItem } from '../label/renderer.js';
import {
  configureSceneTesting,
  resetSceneTesting,
  type SceneGPUDevice,
  type SceneGPUDeviceLostInfo
} from '../testing.js';
import type { VertexStreamIssue } from '../vertex-stream.js';
import {
  SceneRenderer,
  parseComputedBackgroundColor,
  type LineRenderItem,
  type MarkerRenderItem,
  type MeshRenderItem,
  type PointRenderItem,
  type TriangleRenderItem
} from './renderer.js';

describe(parseComputedBackgroundColor.name, () => {
  it('should convert computed sRGB channels to linear values while preserving alpha', () => {
    const color = parseComputedBackgroundColor('rgba(128, 64, 32, 0.5)');
    expect(color.r).toBeCloseTo(0.21586050011389923, 14);
    expect(color.g).toBeCloseTo(0.05126945837404324, 14);
    expect(color.b).toBeCloseTo(0.014443843596092545, 14);
    expect(color.a).toBe(0.5);
  });

  it('should map transparent and invalid colors to transparent black', () => {
    expect(parseComputedBackgroundColor('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    expect(parseComputedBackgroundColor('invalid')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    expect(parseComputedBackgroundColor(`rgb(${'9'.repeat(400)}, 0, 0)`)).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it('should clamp computed color channels and default alpha to opaque', () => {
    expect(parseComputedBackgroundColor('rgb(300, -1, 0)')).toEqual({ r: 1, g: 0, b: 0, a: 1 });
  });
});

describe(SceneRenderer.name, () => {
  it('should stay active without geometry capabilities and skip deferred pipeline loading safely', async () => {
    const submissions: unknown[][] = [];
    const renderingFailure = vi.fn();
    const renderer = new SceneRenderer(() => undefined, renderingFailure);
    const canvas = document.createElement('canvas');
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    renderer.initialize(canvas, { device: createDevice(submissions), format: 'bgra8unorm' });
    expect(renderer.active).toBe(true);
    expect(renderer.render([createPointRenderItem({ count: 1 })])).toBe(true);
    expect(renderer.render([createRenderItem({ kind: 'cube', transparent: false })])).toBe(true);
    expect(renderer.render([createMeshRenderItem()])).toBe(true);
    await expect(renderer.pick({ canvas, clientX: 0, clientY: 0, pixelX: 0, pixelY: 0 })).resolves.toBeNull();
    expect(renderingFailure).not.toHaveBeenCalled();
    renderer.disconnect();
    expect(renderer.active).toBe(false);
    resetSceneTesting();
  });

  it('should report current deferred rendering initialization failures', async () => {
    const gpu = createAdvancedDevice();
    const renderingFailure = vi.fn();
    vi.spyOn(gpu.device, 'createRenderPipeline').mockImplementation(() => {
      throw new Error('render target pipeline failure');
    });
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer(() => undefined, renderingFailure);
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });

    renderer.render([createPointRenderItem({ count: 1 })]);
    await vi.waitFor(() => expect(renderingFailure).toHaveBeenCalledOnce());

    expect(renderingFailure).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'render target pipeline failure' })
    );
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should ignore deferred rendering failures after disconnecting', async () => {
    const gpu = createAdvancedDevice();
    const renderingFailure = vi.fn();
    vi.spyOn(gpu.device, 'createRenderPipeline').mockImplementation(() => {
      throw new Error('stale render target pipeline failure');
    });
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer(() => undefined, renderingFailure);
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.render([createPointRenderItem({ count: 1 })]);
    renderer.disconnect();

    await Promise.resolve();
    await Promise.resolve();
    expect(renderingFailure).not.toHaveBeenCalled();
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should destroy primitive geometry buffers after an intermediate allocation fails', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    const marker = createRenderItem({ count: 1, kind: 'sphere', transparent: false });
    renderer.render([marker]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));

    const originalCreateBuffer = gpu.device.createBuffer;
    const beforeDescriptors = gpu.bufferDescriptors.length;
    const beforeDestroyed = gpu.destroyedBuffers.length;
    let createBufferCalls = 0;
    gpu.device.createBuffer = descriptor => {
      createBufferCalls += 1;
      if (createBufferCalls === 2) throw new Error('primitive geometry allocation failure');
      return originalCreateBuffer(descriptor);
    };

    expect(() => renderer.render([marker])).toThrow('primitive geometry allocation failure');
    expect(gpu.bufferDescriptors).toHaveLength(beforeDescriptors + 1);
    expect(gpu.destroyedBuffers.slice(beforeDestroyed)).toEqual([beforeDescriptors]);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should destroy primitive geometry buffers after an intermediate upload fails', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    const marker = createRenderItem({ count: 1, kind: 'sphere', transparent: false });
    renderer.render([marker]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));

    const originalWriteBuffer = gpu.device.queue.writeBuffer;
    const beforeDescriptors = gpu.bufferDescriptors.length;
    const beforeDestroyed = gpu.destroyedBuffers.length;
    let writeBufferCalls = 0;
    gpu.device.queue.writeBuffer = (buffer, offset, data) => {
      writeBufferCalls += 1;
      if (writeBufferCalls === 2) throw new Error('primitive geometry upload failure');
      originalWriteBuffer?.(buffer, offset, data);
    };

    expect(() => renderer.render([marker])).toThrow('primitive geometry upload failure');
    expect(gpu.bufferDescriptors).toHaveLength(beforeDescriptors + 2);
    expect(gpu.destroyedBuffers.slice(beforeDestroyed)).toEqual([beforeDescriptors + 1, beforeDescriptors]);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should wake a parked scene once when a deferred pipeline becomes available', async () => {
    const gpu = createAdvancedDevice();
    const wakeScene = vi.fn();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer(wakeScene);
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });

    renderer.render([createPointRenderItem({ count: 1 })]);
    await vi.waitFor(() => expect(wakeScene).toHaveBeenCalledOnce());
    expect(renderer.consumeRenderRequest()).toBe(true);
    expect(renderer.consumeRenderRequest()).toBe(false);
    expect(wakeScene).toHaveBeenCalledOnce();

    renderer.disconnect();
    resetSceneTesting();
  });

  it('should remain idle before initialization and reject a missing context', () => {
    const renderer = new SceneRenderer();
    const lease = { device: createDevice(), format: 'bgra8unorm' };

    expect(renderer.resize(10, 10)).toBe(false);
    expect(renderer.render()).toBe(false);
    configureSceneTesting({ getCanvasContext: () => null });
    expect(() => renderer.initialize(document.createElement('canvas'), lease)).toThrow(DOMException);
    resetSceneTesting();
  });

  it('should normalize dimensions, skip unchanged state, and render without optional error scopes', () => {
    const submissions: unknown[][] = [];
    const device = createDevice(submissions);
    const configure = vi.fn();
    const createView = vi.fn(() => ({}));
    const context = {
      configure,
      unconfigure: () => undefined,
      getCurrentTexture: () => ({ createView })
    };
    configureSceneTesting({ getCanvasContext: () => context });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device, format: 'bgra8unorm' });

    expect(renderer.resize(Number.NaN, 0)).toBe(true);
    expect([canvas.width, canvas.height]).toEqual([1, 1]);
    expect(renderer.resize(1, 1)).toBe(false);
    expect(renderer.setBackgroundColor('transparent')).toBe(true);
    expect(renderer.setBackgroundColor('transparent')).toBe(false);
    expect(renderer.render()).toBe(true);
    expect(submissions).toHaveLength(1);
    expect(configure).toHaveBeenCalledWith({
      device,
      format: 'bgra8unorm',
      alphaMode: 'premultiplied',
      colorSpace: 'srgb',
      viewFormats: ['bgra8unorm-srgb']
    });
    expect(createView).toHaveBeenCalledWith({ format: 'bgra8unorm-srgb' });
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should use a supplied camera view-projection for render uniforms and pick snapshots', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    const projection = new Float32Array(Array.from({ length: 16 }, (_, index) => index + 1));
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    renderer.render([createPointRenderItem({ count: 1 })], projection);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([createPointRenderItem({ count: 1 })], projection);
    const uniform = gpu.writes.find(write => write instanceof Float32Array && write.length === 40);
    expect(uniform).toBeInstanceOf(Float32Array);
    expect(Array.from((uniform as Float32Array).subarray(0, 16))).toEqual(Array.from(projection));
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should select world units only for world-sized points', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });

    const point = createPointRenderItem({ count: 1, sizeUnit: 'world' });
    renderer.render([point]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([point]);
    expect(gpu.writes.find(write => write instanceof Float32Array && write.length === 40)).toMatchObject(
      expect.objectContaining({ 38: 1 })
    );

    renderer.disconnect();
    resetSceneTesting();
  });

  it('should reuse stream bind groups across unchanged frames, ranged commits, resize, and picking', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const point = createPointRenderItem({ count: 2 });

    renderer.render([point]);
    expect(gpu.createBindGroup).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    const loaded = { ...point, data: { ...point.data, uploadRanges: [] } };
    renderer.render([loaded]);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(2);

    renderer.render([loaded]);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(2);
    const transformed = { ...loaded, frameMatrix: new Float32Array(loaded.frameMatrix) };
    transformed.frameMatrix[12] = 4;
    const transformResources = {
      bindGroups: gpu.createBindGroup.mock.calls.length,
      buffers: gpu.bufferDescriptors.length,
      pipelines: gpu.pipelineDescriptors.length,
      storageWrites: gpu.writes.filter(write => write instanceof Uint8Array).length
    };
    renderer.render([transformed]);
    expect({
      bindGroups: gpu.createBindGroup.mock.calls.length,
      buffers: gpu.bufferDescriptors.length,
      pipelines: gpu.pipelineDescriptors.length,
      storageWrites: gpu.writes.filter(write => write instanceof Uint8Array).length
    }).toEqual(transformResources);
    const ranged = {
      ...loaded,
      data: { ...loaded.data, uploadRanges: [{ offset: 0, size: POINT.stride }] }
    };
    renderer.render([ranged]);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(2);

    gpu.mappedBytes[0] = 1;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);
    const request = { canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 };
    await renderer.pick(request);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(4);
    await renderer.pick(request);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(4);

    const replacement = { ...createPointRenderItem({ count: 3 }), layer: point.layer };
    renderer.render([replacement]);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(6);
    await renderer.pick(request);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(8);
    renderer.resize(40, 20);
    renderer.render([replacement]);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(8);
    expect(new Set(gpu.uniformWriteSources).size).toBe(1);

    renderer.disconnect();
    resetSceneTesting();
  });

  it('should share immutable instance buffers across renderers and isolate a replacement', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const first = new SceneRenderer();
    const second = new SceneRenderer();
    first.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    second.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    first.resize(20, 10);
    second.resize(20, 10);
    const firstItem = createPointRenderItem({ count: 2 });
    const secondItem = { ...firstItem, layer: document.createElement('div') };

    first.render([firstItem]);
    second.render([secondItem]);
    await vi.waitFor(() => expect(first.consumeRenderRequest()).toBe(true));
    await vi.waitFor(() => expect(second.consumeRenderRequest()).toBe(true));
    first.render([{ ...firstItem, data: { ...firstItem.data, uploadRanges: [] } }]);
    second.render([{ ...secondItem, data: { ...secondItem.data, uploadRanges: [] } }]);

    const instanceBuffer = gpu.bufferDescriptors.findIndex(
      descriptor => descriptor.size === firstItem.data.bytes?.byteLength && descriptor.usage === 0x88
    );
    expect(instanceBuffer).toBeGreaterThanOrEqual(0);
    expect(
      gpu.bufferDescriptors.filter(
        descriptor => descriptor.size === firstItem.data.bytes?.byteLength && descriptor.usage === 0x88
      )
    ).toHaveLength(1);
    expect(gpu.writes.filter(write => write === firstItem.data.bytes)).toHaveLength(1);

    const replacement = { ...createPointRenderItem({ count: 2 }), layer: secondItem.layer };
    second.render([replacement]);
    const instanceBuffers = gpu.bufferDescriptors
      .map((descriptor, index) => ({ descriptor, index }))
      .filter(({ descriptor }) => descriptor.size === firstItem.data.bytes?.byteLength && descriptor.usage === 0x88);
    expect(instanceBuffers).toHaveLength(2);
    const replacementBuffer = instanceBuffers[1]?.index;
    expect(gpu.destroyedBuffers).not.toContain(instanceBuffer);

    first.disconnect();
    expect(gpu.destroyedBuffers).toContain(instanceBuffer);
    expect(gpu.destroyedBuffers).not.toContain(replacementBuffer);
    second.disconnect();
    expect(gpu.destroyedBuffers).toContain(replacementBuffer);
    resetSceneTesting();
  });

  it('should rebuild stream bind groups after device recovery and reuse them on the recovered device', async () => {
    const first = createAdvancedDevice();
    const recovered = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    const point = createPointRenderItem({ count: 1 });
    renderer.initialize(canvas, { device: first.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    renderer.render([point]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([point]);
    expect(first.createBindGroup).toHaveBeenCalledTimes(2);

    renderer.initialize(canvas, { device: recovered.device, format: 'bgra8unorm' });
    renderer.render([point]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([point]);
    renderer.render([point]);

    expect(first.createBindGroup).toHaveBeenCalledTimes(2);
    expect(recovered.createBindGroup).toHaveBeenCalledTimes(2);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should sample frame pixel ratio once and skip unchanged stream uniform uploads', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    const getBoundingClientRect = vi
      .spyOn(canvas, 'getBoundingClientRect')
      .mockReturnValue(DOMRect.fromRect({ height: 32, width: 32 }));
    const points = [createPointRenderItem({ count: 1 }), createPointRenderItem({ count: 1 })];
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    renderer.render(points);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    const loaded = points.map(item => ({ ...item, data: { ...item.data, uploadRanges: [] } }));
    renderer.render(loaded);
    getBoundingClientRect.mockClear();
    const uniformWrites = () => gpu.writes.filter(write => write instanceof Float32Array && write.length === 40).length;
    const writesBefore = uniformWrites();

    renderer.render(loaded);
    expect(getBoundingClientRect).toHaveBeenCalledOnce();
    expect(uniformWrites()).toBe(writesBefore);

    const movedProjection = identityMat4();
    movedProjection[12] = 1;
    renderer.render(loaded, movedProjection);
    expect(getBoundingClientRect).toHaveBeenCalledTimes(2);
    expect(uniformWrites()).toBe(writesBefore + 2);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should defer the label renderer until captured texture items arrive, then draw them after geometry', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    const label: LabelTextureRenderItem = {
      quad: { bottom: -0.5, depth: 0.5, left: -0.5, right: 0.5, top: 0.5 },
      texture: { createView: () => ({}) }
    };
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);

    renderer.render([], undefined, [label]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([], undefined, [label]);

    expect(gpu.draws).toContainEqual(expect.objectContaining({ vertexCount: 6 }));
    const drawsBeforeTransparency = gpu.draws.length;
    renderer.render([createPointRenderItem({ count: 1, transparent: true })], undefined, [label]);
    expect(gpu.draws.slice(drawsBeforeTransparency)).toContainEqual(expect.objectContaining({ vertexCount: 6 }));
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should attach a label occlusion query set when the device supports query resources', async () => {
    const gpu = createAdvancedDevice();
    Reflect.set(gpu.device, 'createQuerySet', () => ({}));
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const label: LabelTextureRenderItem = {
      quad: { bottom: -0.5, depth: 0.5, left: -0.5, right: 0.5, top: 0.5 },
      texture: { createView: () => ({}) }
    };

    renderer.render([], undefined, [label]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([], undefined, [label]);

    expect(gpu.passDescriptors).toContainEqual(expect.objectContaining({ occlusionQuerySet: expect.anything() }));
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should return misses for pick requests before a frame, with a mismatched canvas, or outside pixels', async () => {
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    expect(await renderer.pick({ canvas, clientX: 0, clientY: 0, pixelX: 0, pixelY: 0 })).toBeNull();

    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    expect(
      await renderer.pick({ canvas: document.createElement('canvas'), clientX: 0, clientY: 0, pixelX: 0, pixelY: 0 })
    ).toBeNull();
    expect(await renderer.pick({ canvas, clientX: 0, clientY: 0, pixelX: -1, pixelY: 0 })).toBeNull();
    expect(await renderer.pick({ canvas, clientX: 0, clientY: 0, pixelX: 20, pixelY: 0 })).toBeNull();
    expect(await renderer.pick({ canvas, clientX: 0, clientY: 0, pixelX: 0, pixelY: -1 })).toBeNull();
    expect(await renderer.pick({ canvas, clientX: 0, clientY: 0, pixelX: 0, pixelY: 10 })).toBeNull();
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should issue an ID/depth pass and return a mapped stream hit with a world position', async () => {
    const gpu = createAdvancedDevice();
    gpu.device.pushErrorScope = vi.fn();
    gpu.device.popErrorScope = vi.fn(() => Promise.resolve(null));
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const item = createPointRenderItem({ count: 1 });
    renderer.render([item]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    const loaded = { ...item, data: { ...item.data, uploadRanges: [] } };
    renderer.render([loaded]);
    gpu.mappedBytes[0] = 1;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);
    const hit = await renderer.pick({ canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 });
    expect(hit).toMatchObject({ layer: item.layer, instanceIndex: 0 });
    expect(hit?.worldPosition).toEqual(
      expect.arrayContaining([expect.any(Number), expect.any(Number), expect.any(Number)])
    );
    expect(renderer.getCompletedGeometryPixel(2, 3)).toEqual({ depth: 0.5, id: 1, pixelX: 2, pixelY: 3 });
    expect(renderer.getCompletedGeometryPixel(3, 2)).toBeUndefined();
    renderer.render([loaded]);
    expect(renderer.getCompletedGeometryPixel(2, 3)).toEqual({ depth: 0.5, id: 1, pixelX: 2, pixelY: 3 });
    renderer.render([loaded]);
    expect(renderer.getCompletedGeometryPixel(2, 3)).toBeUndefined();
    expect(gpu.copyTextureToBuffer).toHaveBeenCalledTimes(2);
    gpu.mappedBytes.fill(0);
    await expect(renderer.pick({ canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 })).resolves.toBeNull();
    expect(gpu.device.pushErrorScope).not.toHaveBeenCalled();
    expect(gpu.device.popErrorScope).not.toHaveBeenCalled();
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should retry a pick snapshot when a newer frame replaces shared draw resources while pipelines load', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const first = createPointRenderItem({ count: 1 });
    renderer.render([first]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    const loaded = { ...first, data: { ...first.data, uploadRanges: [] } };
    renderer.render([loaded]);
    const pick = renderer.pick({ canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 });
    const second = { ...loaded, data: { ...loaded.data } };
    renderer.render([second]);
    gpu.mappedBytes[0] = 1;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);

    const result = await pick;
    expect(gpu.copyTextureToBuffer).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ instanceIndex: 0, layer: second.layer });
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should complete a submitted pick without redrawing when a newer color frame renders', async () => {
    const gpu = createAdvancedDevice();
    const mapResolvers: Array<() => void> = [];
    const mapAsync = vi.fn(() => new Promise<void>(resolve => mapResolvers.push(resolve)));
    const originalCreateBuffer = gpu.device.createBuffer;
    gpu.device.createBuffer = descriptor => {
      const buffer = originalCreateBuffer(descriptor);
      return descriptor.usage === 9 ? { ...buffer, mapAsync } : buffer;
    };
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const item = createPointRenderItem({ count: 1 });
    renderer.render([item]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    const loaded = { ...item, data: { ...item.data, uploadRanges: [] } };
    renderer.render([loaded]);
    gpu.mappedBytes[0] = 1;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);

    const pick = renderer.pick({ canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 });
    await vi.waitFor(() => expect(mapAsync).toHaveBeenCalledOnce());
    renderer.render([loaded]);
    mapResolvers[0]?.();

    await expect(pick).resolves.toMatchObject({ instanceIndex: 0, layer: item.layer });
    expect(mapAsync).toHaveBeenCalledOnce();
    expect(gpu.copyTextureToBuffer).toHaveBeenCalledTimes(2);
    expect(renderer.getCompletedGeometryPixel(2, 3)).toEqual({ depth: 0.5, id: 1, pixelX: 2, pixelY: 3 });
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should prefetch raw geometry pixels without requiring a Scene event dispatch', async () => {
    const renderer = new SceneRenderer();
    const request = { canvas: document.createElement('canvas'), clientX: 1, clientY: 2, pixelX: 3, pixelY: 4 };
    await expect(renderer.prefetchGeometryPixel(request)).resolves.toBeUndefined();
    const pick = vi.spyOn(renderer, 'pick').mockRejectedValue(new DOMException('Unavailable.', 'AbortError'));

    await expect(renderer.prefetchGeometryPixel(request)).resolves.toBeUndefined();
    expect(pick).toHaveBeenCalledWith(request);
  });

  it('should retain a bounded set of same-frame geometry pixels and evict the oldest sample', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(200, 1);
    renderer.render([createPointRenderItem({ count: 1 })]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([createPointRenderItem({ count: 1 })]);
    gpu.mappedBytes[0] = 1;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);

    for (let pixelX = 0; pixelX < 129; pixelX += 1) {
      await renderer.prefetchGeometryPixel({ canvas, clientX: pixelX, clientY: 0, pixelX, pixelY: 0 });
    }

    expect(renderer.getCompletedGeometryPixel(0, 0)).toBeUndefined();
    expect(renderer.getCompletedGeometryPixel(128, 0)).toEqual({ depth: 0.5, id: 1, pixelX: 128, pixelY: 0 });
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should discard a mapped pick when resize replaces its snapshot resources', async () => {
    const gpu = createAdvancedDevice();
    let resolveMap!: () => void;
    const mapAsync = vi.fn(() => new Promise<void>(resolve => (resolveMap = resolve)));
    const originalCreateBuffer = gpu.device.createBuffer;
    gpu.device.createBuffer = descriptor => {
      const buffer = originalCreateBuffer(descriptor);
      return descriptor.usage === 9 ? { ...buffer, mapAsync } : buffer;
    };
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const item = createPointRenderItem({ count: 1 });
    renderer.render([item]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([{ ...item, data: { ...item.data, uploadRanges: [] } }]);
    gpu.mappedBytes[0] = 1;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);
    const pick = renderer.pick({ canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 });
    await vi.waitFor(() => expect(mapAsync).toHaveBeenCalledOnce());
    renderer.resize(30, 10);
    resolveMap();

    await expect(pick).resolves.toBeNull();
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should issue an ID/depth draw for mesh resources owned by the mesh renderer', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const mesh = createMeshRenderItem();
    renderer.render([mesh]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([mesh]);
    gpu.mappedBytes[0] = 1;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);

    const hit = await renderer.pick({ canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 });

    expect(hit).toMatchObject({ instanceIndex: 0, layer: mesh.layer });
    expect(hit?.marker).toBeUndefined();
    expect(gpu.draws.at(-1)?.vertexCount).toBe(3);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should cache mesh bind groups by pipeline, instance resources, and texture identity', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const sourceA = { height: 2, width: 2 } as ImageBitmap;
    const sourceB = { height: 3, width: 3 } as ImageBitmap;
    const uvs = new Float32Array([0, 0, 1, 0, 0, 1]);
    const mesh = createMeshRenderItem({ texture: sourceA, uvs });

    renderer.render([mesh]);
    expect(gpu.createBindGroup).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([mesh]);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(7);
    renderer.render([mesh]);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(7);

    gpu.mappedBytes[0] = 1;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);
    const request = { canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 };
    await renderer.pick(request);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(10);
    await renderer.pick(request);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(10);

    const textureReplacement = { ...mesh, data: { ...mesh.data, texture: sourceB } };
    renderer.render([textureReplacement]);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(12);
    await renderer.pick(request);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(13);

    const bytes = new Uint8Array(MARKER.stride * 2);
    writeMarker(bytes, 0, { color: [1, 1, 1, 1], position: [0, 0, 0] });
    writeMarker(bytes, 1, { color: [1, 1, 1, 1], position: [1, 0, 0] });
    const instances: MeshRenderItem['instances'] = {
      bytes,
      count: 2,
      kind: 'cube',
      opaque: true,
      outlineOpaque: false,
      outlineTransparent: false,
      outlineVisible: false,
      ready: true,
      transparent: false,
      uploadRanges: [{ offset: 0, size: bytes.byteLength }],
      version: 2
    };
    const instanceReplacement = createMeshRenderItem({
      identityInstance: false,
      instances,
      layer: mesh.layer,
      texture: sourceB,
      uvs
    });
    renderer.render([instanceReplacement]);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(17);
    renderer.render([instanceReplacement]);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(17);
    await renderer.pick(request);
    expect(gpu.createBindGroup).toHaveBeenCalledTimes(19);
    expect(new Set(gpu.uniformWriteSources).size).toBe(1);

    renderer.disconnect();
    resetSceneTesting();
  });

  it('should load, upload, order, update, replace, and destroy marker resources', async () => {
    const gpu = createAdvancedDevice();
    const context = {
      configure: vi.fn(),
      unconfigure: vi.fn(),
      getCurrentTexture: () => ({ createView: () => ({ color: true }) })
    };
    configureSceneTesting({ getCanvasContext: () => context });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 32);

    const opaque = createRenderItem({ kind: 'cube', transparent: false });
    const transparent = createRenderItem({ kind: 'sphere', transparent: true });
    expect(renderer.render([transparent, opaque])).toBe(true);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    gpu.draws.length = 0;
    const loadedOpaque = { ...opaque, data: { ...opaque.data, uploadRanges: [] } };
    const loadedTransparent = { ...transparent, data: { ...transparent.data, uploadRanges: [] } };
    renderer.render([loadedTransparent, loadedOpaque]);
    expect(gpu.writes.filter(write => write instanceof Uint8Array)).toHaveLength(2);
    expect(gpu.draws[1]?.pipeline).not.toBe(gpu.draws[0]?.pipeline);
    expect(gpu.draws[2]?.pipeline).toBe(gpu.pipelines[0]);
    expect(gpu.draws.map(draw => draw.instanceCount)).toEqual([1, 1, undefined]);
    expect(gpu.passDescriptors.slice(-3)).toMatchObject([
      { colorAttachments: [{ loadOp: 'clear' }] },
      { colorAttachments: [{ loadOp: 'clear' }, { loadOp: 'clear' }] },
      { colorAttachments: [{ loadOp: 'load' }] }
    ]);

    gpu.draws.length = 0;
    renderer.render([{ ...loadedTransparent, data: { ...loadedTransparent.data, opaque: true } }]);
    expect(gpu.draws.map(draw => draw.instanceCount)).toEqual([1, 1, undefined]);

    gpu.draws.length = 0;
    renderer.render([{ ...loadedTransparent, data: { ...loadedTransparent.data, opaque: false, transparent: false } }]);
    expect(gpu.draws).toEqual([]);

    const opaqueUpdate = {
      ...loadedOpaque,
      data: { ...loadedOpaque.data, uploadRanges: [{ offset: 0, size: MARKER.stride }] }
    };
    const transparentUpdate = loadedTransparent;
    renderer.render([opaqueUpdate, transparentUpdate]);
    expect(gpu.writes.filter(write => write instanceof Uint8Array)).toHaveLength(3);

    const replacement = createRenderItem({
      kind: 'cube',
      transparent: false,
      layer: loadedOpaque.layer,
      count: 2
    });
    renderer.render([replacement]);
    expect(gpu.writes.filter(write => write instanceof Uint8Array)).toHaveLength(4);
    expect(gpu.destroyedBuffers.length).toBeGreaterThan(0);

    renderer.resize(32, 32);
    renderer.render([]);
    expect(gpu.destroyedTextures).toBeGreaterThan(0);
    renderer.disconnect();
    expect(context.unconfigure).toHaveBeenCalledOnce();
    expect(gpu.submissions).toHaveLength(7);
    resetSceneTesting();
  });

  it('should perform exact ranged marker writes while reusing same-capacity resources and growing only the instance buffer', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const initial = createRenderItem({ count: 10_000, kind: 'cube', transparent: false });
    renderer.render([initial]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    const loaded = { ...initial, data: { ...initial.data, uploadRanges: [] } };
    renderer.render([loaded]);
    const buffersAfterLoad = gpu.bufferDescriptors.length;
    const destroyedAfterLoad = gpu.destroyedBuffers.length;
    const writesAfterLoad = gpu.writes.length;

    for (let commit = 0; commit < 16; commit += 1) {
      renderer.render([
        {
          ...loaded,
          data: {
            ...loaded.data,
            uploadRanges: [{ offset: commit * 100 * MARKER.stride, size: 100 * MARKER.stride }]
          }
        }
      ]);
    }

    expect(gpu.bufferDescriptors).toHaveLength(buffersAfterLoad);
    expect(gpu.destroyedBuffers).toHaveLength(destroyedAfterLoad);
    expect(
      gpu.writes
        .slice(writesAfterLoad)
        .filter(write => write instanceof Uint8Array)
        .map(write => write.byteLength)
    ).toEqual(Array.from({ length: 16 }, () => 100 * MARKER.stride));

    const sameCapacity = createRenderItem({ count: 10_000, kind: 'cube', layer: initial.layer, transparent: false });
    renderer.render([sameCapacity]);
    expect(gpu.bufferDescriptors).toHaveLength(buffersAfterLoad);
    expect(gpu.destroyedBuffers).toHaveLength(destroyedAfterLoad);

    const growth = createRenderItem({ count: 20_000, kind: 'cube', layer: initial.layer, transparent: false });
    renderer.render([growth]);
    expect(gpu.bufferDescriptors).toHaveLength(buffersAfterLoad + 2);
    expect(gpu.bufferDescriptors.slice(-2).map(descriptor => descriptor.size)).toEqual([20_000 * MARKER.stride, 160]);
    expect(gpu.destroyedBuffers).toHaveLength(destroyedAfterLoad + 2);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should compact large outline-free marker layers and draw opaque and transparent pass buffers indirectly', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const opaque = createRenderItem({ count: 25_000, kind: 'sphere', transparent: false });
    const transparent = createRenderItem({ count: 25_000, kind: 'sphere', transparent: true });

    renderer.render([opaque, transparent]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([
      { ...opaque, data: { ...opaque.data, uploadRanges: [] } },
      { ...transparent, data: { ...transparent.data, uploadRanges: [] } }
    ]);

    expect(gpu.computeDispatches.filter(count => count === 391)).toHaveLength(2);
    expect(gpu.draws.filter(draw => draw.indirectOffset !== undefined).map(draw => draw.indirectOffset)).toEqual([
      0, 20
    ]);
    renderer.disconnect();
    expect(gpu.destroyedBuffers.length).toBeGreaterThan(0);
    resetSceneTesting();
  });

  it('should fall back to direct marker drawing when compaction pipeline construction fails without retrying', async () => {
    const gpu = createAdvancedDevice();
    const createComputePipeline = vi.spyOn(gpu.device, 'createComputePipeline').mockImplementation(() => {
      throw new Error('compute pipeline failure');
    });
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const marker = createRenderItem({ count: 25_000, kind: 'sphere', transparent: false });

    renderer.render([marker]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    const loaded = { ...marker, data: { ...marker.data, uploadRanges: [] } };
    renderer.render([loaded]);
    expect(gpu.draws.at(-1)).toMatchObject({ indexCount: 960, instanceCount: 25_000 });
    expect(createComputePipeline).toHaveBeenCalledOnce();

    renderer.render([loaded]);
    expect(createComputePipeline).toHaveBeenCalledOnce();
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should fall back to direct marker drawing when compaction resource setup fails without retrying', async () => {
    const gpu = createAdvancedDevice();
    let bindGroupCalls = 0;
    const createBindGroup = gpu.device.createBindGroup;
    gpu.device.createBindGroup = vi.fn((descriptor: unknown) => {
      bindGroupCalls += 1;
      if (bindGroupCalls === 2) throw new Error('compaction resource failure');
      return createBindGroup(descriptor);
    });
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const marker = createRenderItem({ count: 25_000, kind: 'sphere', transparent: false });

    renderer.render([marker]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    const loaded = { ...marker, data: { ...marker.data, uploadRanges: [] } };
    renderer.render([loaded]);
    expect(gpu.draws.at(-1)).toMatchObject({ indexCount: 960, instanceCount: 25_000 });
    expect(bindGroupCalls).toBe(4);

    renderer.render([loaded]);
    expect(bindGroupCalls).toBe(4);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should draw compact-capable markers directly when the render pass lacks indirect drawing', async () => {
    const gpu = createAdvancedDevice({ drawIndexedIndirect: false });
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const marker = createRenderItem({ count: 25_000, kind: 'sphere', transparent: false });

    renderer.render([marker]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([{ ...marker, data: { ...marker.data, uploadRanges: [] } }]);

    expect(gpu.computeDispatches).toContain(391);
    expect(gpu.draws.at(-1)).toMatchObject({ indexCount: 960, instanceCount: 25_000 });
    expect(gpu.draws.some(draw => draw.indirectOffset !== undefined)).toBe(false);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should keep regular mesh rendering available when heightfield compute initialization fails', async () => {
    const gpu = createAdvancedDevice();
    vi.spyOn(gpu.device, 'createComputePipeline').mockImplementation(() => {
      throw new Error('heightfield compute pipeline failure');
    });
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const mesh = createMeshRenderItem();

    renderer.render([mesh]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([mesh]);

    expect(gpu.draws.at(-1)).toMatchObject({ vertexCount: 3, instanceCount: 1 });
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should compact only intersecting marker bounds while drawing inside bounds directly and skipping outside bounds', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const bounds: MarkerBounds = {
      maximumX: 0.25,
      maximumY: 0.25,
      maximumZ: 0.75,
      minimumX: -0.25,
      minimumY: -0.25,
      minimumZ: 0.25
    };
    const marker = createRenderItem({ bounds, count: 25_000, kind: 'sphere', transparent: false });
    const intersectingFrame = identityMat4();
    intersectingFrame[12] = 0.9;
    const intersecting = { ...marker, frameMatrix: intersectingFrame };

    renderer.render([intersecting], identityMat4());
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([{ ...intersecting, data: { ...intersecting.data, uploadRanges: [] } }], identityMat4());
    expect(gpu.computeDispatches).toContain(391);
    expect(gpu.draws.at(-1)).toMatchObject({ indirectOffset: 0 });

    const dispatches = gpu.computeDispatches.length;
    const destroyed = gpu.destroyedBuffers.length;
    renderer.render([{ ...marker, data: { ...marker.data, uploadRanges: [] } }], identityMat4());
    expect(gpu.computeDispatches).toHaveLength(dispatches);
    expect(gpu.destroyedBuffers).toHaveLength(destroyed);
    expect(gpu.draws.at(-1)).toMatchObject({ instanceCount: 25_000 });

    const outsideFrame = identityMat4();
    outsideFrame[12] = 2;
    const drawCount = gpu.draws.length;
    renderer.render(
      [{ ...marker, data: { ...marker.data, uploadRanges: [] }, frameMatrix: outsideFrame }],
      identityMat4()
    );
    expect(gpu.draws).toHaveLength(drawCount);

    const buffers = gpu.bufferDescriptors.length;
    renderer.render([{ ...intersecting, data: { ...intersecting.data, uploadRanges: [] } }], identityMat4());
    expect(gpu.computeDispatches).toHaveLength(dispatches + 1);
    expect(gpu.bufferDescriptors).toHaveLength(buffers);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should allocate OIT targets only for transparent content and reuse them until resize', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const opaque = createRenderItem({ kind: 'cube', transparent: false });
    renderer.render([opaque]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([{ ...opaque, data: { ...opaque.data, uploadRanges: [] } }]);
    expect(gpu.textureDescriptors).toHaveLength(1);

    const transparent = createRenderItem({ kind: 'sphere', transparent: true });
    renderer.render([transparent]);
    const transparentTextureCount = gpu.textureDescriptors.length;
    expect(transparentTextureCount).toBe(3);
    renderer.render([{ ...transparent, data: { ...transparent.data, uploadRanges: [] } }]);
    expect(gpu.textureDescriptors).toHaveLength(transparentTextureCount);

    renderer.resize(32, 32);
    renderer.render([{ ...transparent, data: { ...transparent.data, uploadRanges: [] } }]);
    expect(gpu.textureDescriptors).toHaveLength(transparentTextureCount + 3);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should draw and pick cube outlines when the faces are invisible', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const outlined = createRenderItem({
      faceAlpha: 0,
      kind: 'cube',
      outlineColor: [0, 1, 1, 1],
      transparent: false
    });

    renderer.render([outlined]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([{ ...outlined, data: { ...outlined.data, uploadRanges: [] } }]);
    expect(gpu.draws.at(-1)?.indexCount).toBe(24);

    const pickDrawCount = gpu.draws.length;
    gpu.mappedBytes[0] = 1;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);
    await expect(renderer.pick({ canvas, clientX: 1, clientY: 1, pixelX: 1, pixelY: 1 })).resolves.toMatchObject({
      layer: outlined.layer
    });
    expect(gpu.draws.slice(pickDrawCount).map(draw => draw.indexCount)).toEqual([36, 24]);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should load and draw streamed points, lines, and triangles in opaque then transparent passes', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(80, 40);

    const transparentPoints = createPointRenderItem({ count: 2, transparent: true });
    const opaqueLine = createLineRenderItem({ count: 3 });
    const opaqueTriangles = createTriangleRenderItem({ count: 3 });
    const opaqueMarker = createRenderItem({ kind: 'cube', transparent: false });
    renderer.render([transparentPoints, opaqueTriangles, opaqueMarker, opaqueLine]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    const loadedPoints = { ...transparentPoints, data: { ...transparentPoints.data, uploadRanges: [] } };
    const loadedTriangles = { ...opaqueTriangles, data: { ...opaqueTriangles.data, uploadRanges: [] } };
    const loadedMarker = { ...opaqueMarker, data: { ...opaqueMarker.data, uploadRanges: [] } };
    const loadedLine = { ...opaqueLine, data: { ...opaqueLine.data, uploadRanges: [] } };
    renderer.render([loadedPoints, loadedTriangles, loadedMarker, loadedLine]);

    expect(gpu.draws.slice(-5).map(draw => draw.vertexCount)).toEqual([3, undefined, 15, 12, 3]);
    expect(gpu.draws.slice(-5).map(draw => draw.pipeline)).toEqual([
      gpu.pipelines[11],
      gpu.pipelines[1],
      gpu.pipelines[7],
      gpu.pipelines[10],
      gpu.pipelines[0]
    ]);
    expect(gpu.writes.filter(write => write instanceof Uint8Array)).toHaveLength(4);

    renderer.render([
      { ...loadedLine, data: { ...loadedLine.data, uploadRanges: [{ offset: 0, size: LINE_VERTEX.stride }] } },
      loadedTriangles,
      loadedPoints
    ]);
    expect(gpu.writes.filter(write => write instanceof Uint8Array)).toHaveLength(5);
    resetSceneTesting();
  });

  it('should draw paired segment records without polyline joins', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(80, 40);
    const axes = createLineRenderItem({ count: 6, topology: 'segments', widthUnit: 'pixel' });

    renderer.render([axes]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([{ ...axes, data: { ...axes.data, uploadRanges: [] } }]);

    expect(gpu.draws.at(-1)).toEqual(expect.objectContaining({ vertexCount: 18 }));
    expect(gpu.writes.find(write => write instanceof Float32Array && write.length === 40)).toMatchObject(
      expect.objectContaining({ 37: 2, 38: 0 })
    );
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should draw loop joins in world units and map pick IDs to loop segments', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(80, 40);
    const loop = createLineRenderItem({ count: 3, topology: 'loop', widthUnit: 'world' });

    renderer.render([loop]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    const loaded = { ...loop, data: { ...loop.data, uploadRanges: [] } };
    renderer.render([loaded]);

    expect(gpu.draws.at(-1)).toEqual(expect.objectContaining({ vertexCount: 27 }));
    expect(gpu.writes.find(write => write instanceof Float32Array && write.length === 40)).toMatchObject(
      expect.objectContaining({ 37: 1, 38: 1 })
    );

    gpu.mappedBytes[0] = 3;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);
    await expect(renderer.pick({ canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 })).resolves.toMatchObject({
      instanceIndex: 2,
      layer: loop.layer
    });
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should select the biased line pair only for depth-biased line records', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(80, 40);
    const normal = createLineRenderItem({ count: 3 });
    const biasedBase = createLineRenderItem({ count: 3 });
    const biased = {
      ...biasedBase,
      data: { ...biasedBase.data, depthBias: true }
    };

    renderer.render([normal, biased]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([
      { ...normal, data: { ...normal.data, uploadRanges: [] } },
      { ...biased, data: { ...biased.data, uploadRanges: [] } }
    ]);

    const [normalDraw, biasedDraw] = gpu.draws.slice(-2);
    expect(normalDraw?.pipeline).toBe(gpu.pipelines[1]);
    expect(biasedDraw?.pipeline).toBe(gpu.pipelines[7]);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should omit non-pickable stream records from ID draws and targets without ID gaps', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const reference = createPointRenderItem({ count: 1, pickable: false });
    const target = createPointRenderItem({ count: 1 });
    renderer.render([reference, target]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([
      { ...reference, data: { ...reference.data, uploadRanges: [] } },
      { ...target, data: { ...target.data, uploadRanges: [] } }
    ]);
    gpu.mappedBytes[0] = 1;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);

    await expect(renderer.pick({ canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 })).resolves.toMatchObject({
      instanceIndex: 0,
      layer: target.layer
    });
    expect(gpu.draws.at(-1)).toEqual(expect.objectContaining({ vertexCount: 6 }));
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should decode large instance IDs from compact layer ranges across repeated picks', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const first = createPointRenderItem({ count: 10_000 });
    const second = createPointRenderItem({ count: 3 });
    renderer.render([first, second]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    const frame = [
      { ...first, data: { ...first.data, uploadRanges: [] } },
      { ...second, data: { ...second.data, uploadRanges: [] } }
    ];
    renderer.render(frame);
    new DataView(gpu.mappedBytes.buffer).setUint32(0, 10_003, true);
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);

    const request = { canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 };
    await expect(renderer.pick(request)).resolves.toMatchObject({
      instanceIndex: 2,
      layer: second.layer
    });
    await expect(renderer.pick({ ...request, pixelX: 3 })).resolves.toMatchObject({
      instanceIndex: 2,
      layer: second.layer
    });
    renderer.render(frame);
    await expect(renderer.pick(request)).resolves.toMatchObject({ instanceIndex: 2, layer: second.layer });
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should skip pick subsystem work when an interactive query has no eligible targets', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    renderer.render([createPointRenderItem({ count: 2 })]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([createPointRenderItem({ count: 2 })]);
    const before = {
      buffers: gpu.bufferDescriptors.length,
      passes: gpu.passDescriptors.length,
      submissions: gpu.submissions.length,
      textures: gpu.textureDescriptors.length
    };

    await expect(
      renderer.pick({ canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 }, 'interactive')
    ).resolves.toBeNull();

    expect(gpu.bufferDescriptors).toHaveLength(before.buffers);
    expect(gpu.passDescriptors).toHaveLength(before.passes);
    expect(gpu.submissions).toHaveLength(before.submissions);
    expect(gpu.textureDescriptors).toHaveLength(before.textures);
    expect(gpu.copyTextureToBuffer).not.toHaveBeenCalled();
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should isolate interactive and explicit target IDs and geometry-pixel caches', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const staticPoints = createPointRenderItem({ count: 2 });
    const interactivePoints = createPointRenderItem({ count: 3, interactive: true });
    renderer.render([staticPoints, interactivePoints]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    const frame = [
      { ...staticPoints, data: { ...staticPoints.data, uploadRanges: [] } },
      { ...interactivePoints, data: { ...interactivePoints.data, uploadRanges: [] } }
    ];
    renderer.render(frame);
    const request = { canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 };
    const pickDrawStart = gpu.draws.length;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);

    new DataView(gpu.mappedBytes.buffer).setUint32(0, 1, true);
    await expect(renderer.pick(request, 'interactive')).resolves.toMatchObject({
      instanceIndex: 0,
      layer: interactivePoints.layer
    });
    expect(renderer.getCompletedGeometryPixel(2, 3)).toBeUndefined();

    new DataView(gpu.mappedBytes.buffer).setUint32(0, 3, true);
    await expect(renderer.pick(request, 'all')).resolves.toMatchObject({
      instanceIndex: 0,
      layer: interactivePoints.layer
    });
    expect(renderer.getCompletedGeometryPixel(2, 3)).toMatchObject({ id: 3 });

    new DataView(gpu.mappedBytes.buffer).setUint32(0, 1, true);
    await expect(renderer.pick(request, 'interactive')).resolves.toMatchObject({
      instanceIndex: 0,
      layer: interactivePoints.layer
    });
    expect(renderer.getCompletedGeometryPixel(2, 3)).toMatchObject({ id: 3 });
    expect(gpu.draws.slice(pickDrawStart)).toHaveLength(4);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should scissor the first pick and promote a second sampled pixel to a reusable full frame', async () => {
    const gpu = createAdvancedDevice({ scissor: true });
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const points = createPointRenderItem({ count: 2 });
    renderer.render([points]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([{ ...points, data: { ...points.data, uploadRanges: [] } }]);
    gpu.mappedBytes[0] = 1;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);
    const request = { canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 };
    const pickDrawStart = gpu.draws.length;

    await renderer.pick(request);
    await renderer.pick(request);
    await renderer.pick({ ...request, pixelX: 4 });
    await renderer.pick({ ...request, pixelX: 6 });

    expect(gpu.scissorRects).toEqual([[2, 3, 1, 1]]);
    expect(gpu.draws.slice(pickDrawStart)).toHaveLength(2);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should lazily render meshes and retain topology resources across deforming uploads', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    const mesh = createMeshRenderItem({ normals });
    renderer.render([mesh]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([mesh]);
    const buffersAfterLoad = gpu.bufferDescriptors.length;
    const deformed = createMeshRenderItem({
      layer: mesh.layer,
      normals,
      positions: new Float32Array([0.1, 0, 0, 1, 0, 0, 0, 1, 0])
    });
    const writesBeforeDeform = gpu.writes.length;
    renderer.render([deformed]);
    expect(gpu.bufferDescriptors).toHaveLength(buffersAfterLoad);
    expect(gpu.writes.slice(writesBeforeDeform)).toContain(deformed.data.positions);
    expect(gpu.draws.at(-1)?.vertexCount).toBe(3);
    resetSceneTesting();
  });

  it('should retain generated flat normals while an unchanged mesh renders', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const mesh = createMeshRenderItem({ normals: null });

    renderer.render([mesh]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([mesh]);
    const writes = gpu.writes.length;

    renderer.render([mesh]);

    expect(gpu.writes.slice(writes)).not.toContainEqual(expect.objectContaining({ length: 9 }));
    resetSceneTesting();
  });

  it('should generate compact heightfield mesh attributes in a compute pass', async () => {
    const gpu = createAdvancedDevice();
    const operationOrder: string[] = [];
    const createCommandEncoder = gpu.device.createCommandEncoder;
    gpu.device.createCommandEncoder = () => {
      const encoder = createCommandEncoder();
      const beginComputePass = encoder.beginComputePass;
      if (!beginComputePass) return encoder;
      return {
        ...encoder,
        beginComputePass: () => {
          operationOrder.push('compute');
          return beginComputePass.call(encoder);
        }
      };
    };
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const base = createMeshRenderItem();
    const heightfield: MeshRenderItem = {
      ...base,
      data: {
        ...base.data,
        heightfield: {
          colors: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255]),
          columns: 2,
          heights: new Float32Array([0, 1, 2, 3]),
          origin: [0, 0],
          rows: 2,
          spacing: 1
        },
        indices: null,
        normals: null,
        positions: null
      }
    };

    renderer.render([heightfield]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    operationOrder.length = 0;
    renderer.render([heightfield]);

    expect(operationOrder[0]).toBe('compute');
    expect(gpu.computeDispatches).toContain(1);
    expect(gpu.draws.at(-1)).toMatchObject({ indexCount: 6, instanceCount: 1 });
    expect(gpu.bufferDescriptors).toContainEqual({ size: 48, usage: 160 });
    const dispatches = gpu.computeDispatches.length;
    renderer.render([heightfield]);
    expect(gpu.computeDispatches).toHaveLength(dispatches);
    const source = heightfield.data.heightfield;
    if (!source) throw new TypeError('Expected heightfield render data.');
    renderer.render([
      {
        ...heightfield,
        data: {
          ...heightfield.data,
          heightfield: {
            ...source,
            heights: new Float32Array([1, 2, 3, 4])
          },
          version: 2
        }
      }
    ]);
    expect(gpu.computeDispatches).toHaveLength(dispatches + 1);
    resetSceneTesting();
  });

  it('should rebuild indexed mesh resources when same-length indices change with a new topology version', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    const mesh = createMeshRenderItem({ indices: new Uint32Array([0, 1, 2]), normals });
    renderer.render([mesh]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([mesh]);
    const destroyedBuffers = gpu.destroyedBuffers.length;
    const reordered = createMeshRenderItem({
      indices: new Uint32Array([0, 2, 1]),
      layer: mesh.layer,
      normals,
      topologyVersion: mesh.data.topologyVersion + 1
    });

    renderer.render([reordered]);

    expect(gpu.destroyedBuffers.length).toBeGreaterThan(destroyedBuffers);
    expect(gpu.draws.at(-1)?.indexCount).toBe(3);
    resetSceneTesting();
  });

  it('should rebuild indexed mesh resources when normals toggle between supplied and generated modes with a new topology version', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    const mesh = createMeshRenderItem({ indices: new Uint32Array([0, 1, 2]), normals });
    renderer.render([mesh]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([mesh]);
    const generated = createMeshRenderItem({
      indices: new Uint32Array([0, 1, 2]),
      layer: mesh.layer,
      normals: null,
      topologyVersion: mesh.data.topologyVersion + 1
    });

    renderer.render([generated]);

    expect(gpu.draws.at(-1)?.indexCount).toBeUndefined();
    expect(gpu.draws.at(-1)?.vertexCount).toBe(3);
    resetSceneTesting();
  });

  it('should not draw or pick stale mesh resources while current geometry is inert, then recover', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const valid = createMeshRenderItem();
    renderer.render([valid]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([valid]);
    const drawCount = gpu.draws.length;

    const notReady: MeshRenderItem = {
      ...valid,
      data: { ...valid.data, ready: false }
    };
    renderer.render([notReady]);
    expect(gpu.draws).toHaveLength(drawCount);
    await renderer.pick({ canvas, clientX: 1, clientY: 1, pixelX: 1, pixelY: 1 });
    expect(gpu.draws).toHaveLength(drawCount);

    const invalid: MeshRenderItem = {
      ...valid,
      data: { ...valid.data, geometryError: true, positions: null }
    };
    renderer.render([invalid]);
    expect(gpu.draws).toHaveLength(drawCount);
    await renderer.pick({ canvas, clientX: 1, clientY: 1, pixelX: 1, pixelY: 1 });
    expect(gpu.draws).toHaveLength(drawCount);

    const corrected = createMeshRenderItem({ layer: valid.layer });
    renderer.render([corrected]);
    expect(gpu.draws).toHaveLength(drawCount + 1);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should draw one identity mesh instance and skip an explicitly empty instance layer', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const identity = {
      ...createMeshRenderItem(),
      instances: {
        bytes: null,
        count: 0,
        kind: 'cube' as const,
        opaque: false,
        outlineOpaque: false,
        outlineTransparent: false,
        outlineVisible: false,
        ready: true,
        transparent: false,
        uploadRanges: [],
        version: 1
      }
    };
    renderer.render([identity]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([identity]);
    expect(gpu.draws.at(-1)?.instanceCount).toBe(1);
    const identityWrites = () =>
      gpu.writes.filter(write => write instanceof Uint8Array && write.byteLength === 48).length;
    const uniformWrites = () => gpu.writes.filter(write => write instanceof Float32Array && write.length === 40).length;
    const identityWritesBefore = identityWrites();
    const uniformWritesBefore = uniformWrites();

    renderer.render([identity]);
    expect(identityWrites()).toBe(identityWritesBefore);
    expect(uniformWrites()).toBe(uniformWritesBefore);

    const movedFrame = identityMat4();
    movedFrame[12] = 1;
    renderer.render([{ ...identity, frameMatrix: movedFrame }]);
    expect(identityWrites()).toBe(identityWritesBefore);
    expect(uniformWrites()).toBe(uniformWritesBefore + 1);

    const drawCount = gpu.draws.length;
    renderer.render([
      {
        ...identity,
        data: { ...identity.data, identityInstance: false },
        instances: {
          bytes: new Uint8Array(),
          count: 0,
          kind: 'cube',
          opaque: false,
          outlineOpaque: false,
          outlineTransparent: false,
          outlineVisible: false,
          ready: true,
          transparent: false,
          uploadRanges: [],
          version: 2
        }
      }
    ]);
    expect(gpu.draws).toHaveLength(drawCount);
    resetSceneTesting();
  });

  it('should share the identity instance buffer across mesh layers until the final layer is pruned', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    const first = createMeshRenderItem();
    const second = createMeshRenderItem();
    renderer.render([first, second]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([first, second]);

    const instanceBuffer = gpu.bufferDescriptors.findIndex(
      descriptor => descriptor.size === 48 && descriptor.usage === 0x88
    );
    expect(instanceBuffer).toBeGreaterThanOrEqual(0);
    expect(
      gpu.bufferDescriptors.filter(descriptor => descriptor.size === 48 && descriptor.usage === 0x88)
    ).toHaveLength(1);

    renderer.render([first]);
    expect(gpu.destroyedBuffers).not.toContain(instanceBuffer);
    renderer.render([]);
    expect(gpu.destroyedBuffers).toContain(instanceBuffer);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should supply default optional attributes and upload each changing mesh input', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);

    const defaults = createMeshRenderItem();
    renderer.render([defaults]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([defaults]);
    expect(
      gpu.bufferDescriptors.filter(descriptor => descriptor.usage === 40).map(descriptor => descriptor.size)
    ).toEqual([36, 36, 24, 48]);

    const attributes = createMeshRenderItem({
      colors: new Float32Array(12).fill(1),
      normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
      uvs: new Float32Array([0, 0, 1, 0, 0, 1])
    });
    if (!attributes.data.positions) throw new Error('Expected mesh positions.');
    renderer.render([attributes]);
    const positionUpdate = {
      ...attributes,
      data: { ...attributes.data, positions: new Float32Array(attributes.data.positions) }
    };
    let writeStart = gpu.writes.length;
    renderer.render([positionUpdate]);
    expect(gpu.writes.slice(writeStart)).toContain(positionUpdate.data.positions);

    const normalUpdate = {
      ...positionUpdate,
      data: { ...positionUpdate.data, normals: new Float32Array(positionUpdate.data.normals as Float32Array) }
    };
    writeStart = gpu.writes.length;
    renderer.render([normalUpdate]);
    expect(gpu.writes.slice(writeStart)).toContain(normalUpdate.data.normals);

    const uvUpdate = {
      ...normalUpdate,
      data: { ...normalUpdate.data, uvs: new Float32Array(normalUpdate.data.uvs as Float32Array) }
    };
    writeStart = gpu.writes.length;
    renderer.render([uvUpdate]);
    expect(gpu.writes.slice(writeStart)).toContain(uvUpdate.data.uvs);

    const colorUpdate = {
      ...uvUpdate,
      data: { ...uvUpdate.data, colors: new Float32Array(uvUpdate.data.colors as Float32Array) }
    };
    writeStart = gpu.writes.length;
    renderer.render([colorUpdate]);
    expect(gpu.writes.slice(writeStart)).toContain(colorUpdate.data.colors);

    const flat = createMeshRenderItem({ layer: document.createElement('div'), normals: null });
    renderer.render([flat]);
    const flatUpdate = {
      ...flat,
      data: { ...flat.data, positions: new Float32Array([0, 0, 0, 2, 0, 0, 0, 1, 0]) }
    };
    writeStart = gpu.writes.length;
    renderer.render([flatUpdate]);
    const flatWrites = gpu.writes.slice(writeStart);
    expect(flatWrites).toContain(flatUpdate.data.positions);
    expect(flatWrites.filter(write => write instanceof Float32Array)).toHaveLength(2);
    resetSceneTesting();
  });

  it('should split mesh contributions between opaque and weighted transparency passes', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const opaque = createMeshRenderItem({ indices: new Uint32Array([0, 1, 2]) });
    const transparent = createMeshRenderItem({ color: [1, 1, 1, 0.5] });

    renderer.render([transparent, opaque]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([transparent, opaque]);

    expect(gpu.draws.slice(-4)).toEqual([
      { instanceCount: 1, pipeline: gpu.pipelines[1], vertexCount: 3 },
      { indexCount: 3, instanceCount: 1, pipeline: gpu.pipelines[1] },
      { instanceCount: 1, pipeline: gpu.pipelines[2], vertexCount: 3 },
      { instanceCount: undefined, pipeline: gpu.pipelines[0], vertexCount: 3 }
    ]);
    resetSceneTesting();
  });

  it('should honor mesh render transparency from a translucent vertex color', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const opaque = createMeshRenderItem({ indices: new Uint32Array([0, 1, 2]) });
    const transparent = createMeshRenderItem({
      colors: new Float32Array([1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 1])
    });

    renderer.render([transparent, opaque]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([transparent, opaque]);

    expect(gpu.draws.slice(-4)).toEqual([
      { instanceCount: 1, pipeline: gpu.pipelines[1], vertexCount: 3 },
      { indexCount: 3, instanceCount: 1, pipeline: gpu.pipelines[1] },
      { instanceCount: 1, pipeline: gpu.pipelines[2], vertexCount: 3 },
      { instanceCount: undefined, pipeline: gpu.pipelines[0], vertexCount: 3 }
    ]);
    resetSceneTesting();
  });

  it('should honor mesh transparency from a translucent marker instance in color and pick ordering', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const opaque = createMeshRenderItem({ indices: new Uint32Array([0, 1, 2]) });
    const markerBytes = new Uint8Array(MARKER.stride);
    writeMarker(markerBytes, 0, { color: [1, 1, 1, 0.5], position: [0, 0, 0] });
    const transparent = createMeshRenderItem({
      identityInstance: false,
      instances: {
        bytes: markerBytes,
        count: 1,
        kind: 'cube',
        opaque: false,
        outlineOpaque: false,
        outlineTransparent: false,
        outlineVisible: false,
        ready: true,
        transparent: true,
        uploadRanges: [{ offset: 0, size: markerBytes.byteLength }],
        version: 1
      }
    });

    renderer.render([transparent, opaque]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([transparent, opaque]);
    expect(gpu.draws.slice(-4)).toEqual([
      { instanceCount: 1, pipeline: gpu.pipelines[1], vertexCount: 3 },
      { indexCount: 3, instanceCount: 1, pipeline: gpu.pipelines[1] },
      { instanceCount: 1, pipeline: gpu.pipelines[2], vertexCount: 3 },
      { instanceCount: undefined, pipeline: gpu.pipelines[0], vertexCount: 3 }
    ]);

    const pickDrawCount = gpu.draws.length;
    gpu.mappedBytes[0] = 1;
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);
    await expect(renderer.pick({ canvas, clientX: 1, clientY: 1, pixelX: 1, pixelY: 1 })).resolves.toMatchObject({
      layer: transparent.layer
    });
    expect(gpu.draws.slice(pickDrawCount)).toHaveLength(2);
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should replace mesh textures and topology resources before pruning them', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    renderer.initialize(document.createElement('canvas'), { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(64, 64);
    const sourceA = { height: 2, width: 2 } as ImageBitmap;
    const sourceB = { height: 3, width: 3 } as ImageBitmap;
    const textured = createMeshRenderItem({
      texture: sourceA,
      uvs: new Float32Array([0, 0, 1, 0, 0, 1])
    });

    renderer.render([textured]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([textured]);
    const beforeTextureReplace = gpu.destroyedTextures;
    const textureReplacement = { ...textured, data: { ...textured.data, texture: sourceB } };
    renderer.render([textureReplacement]);
    expect(gpu.destroyedTextures).toBe(beforeTextureReplace + 1);

    const beforeTopologyReplace = gpu.destroyedBuffers.length;
    const topologyReplacement = {
      ...textureReplacement,
      data: { ...textureReplacement.data, topologyVersion: 2 }
    };
    renderer.render([topologyReplacement]);
    expect(gpu.destroyedBuffers.length).toBe(beforeTopologyReplace + 4);

    const beforePrune = gpu.destroyedBuffers.length;
    renderer.render([]);
    expect(gpu.destroyedBuffers.length).toBeGreaterThanOrEqual(beforePrune + 6);
    renderer.disconnect();
    expect(gpu.destroyedTextures).toBeGreaterThanOrEqual(4);
    resetSceneTesting();
  });
});

function createDevice(submissions: unknown[][] = []): SceneGPUDevice {
  return {
    lost: new Promise(() => undefined),
    queue: { submit: commandBuffers => submissions.push([...commandBuffers]) },
    createCommandEncoder: () => ({
      beginRenderPass: () => ({ end: () => undefined }),
      finish: () => ({})
    }),
    destroy: () => undefined
  };
}

// eslint-disable-next-line complexity -- Marker fixture derives render flags from authored face and outline colors.
function createRenderItem(options: {
  bounds?: MarkerBounds | null;
  faceAlpha?: number;
  interactive?: boolean;
  kind: 'cube' | 'sphere';
  transparent: boolean;
  outlineColor?: [number, number, number, number];
  layer?: HTMLElement;
  count?: number;
}): MarkerRenderItem & { data: { uploadRanges: Array<{ offset: number; size: number }> } } {
  const count = options.count ?? 1;
  const faceAlpha = options.faceAlpha ?? (options.transparent ? 0.5 : 1);
  const bytes = new Uint8Array(MARKER.stride * count);
  for (let index = 0; index < count; index += 1) {
    writeMarker(bytes, index, {
      position: [index, 0, 0],
      color: [1, 1, 1, faceAlpha],
      outlineColor: options.outlineColor
    });
  }
  return {
    data: {
      ...(options.bounds === undefined ? {} : { bounds: options.bounds }),
      bytes,
      count,
      kind: options.kind,
      opaque: faceAlpha === 1,
      outlineOpaque: (options.outlineColor?.[3] ?? 0) === 1,
      outlineTransparent: (options.outlineColor?.[3] ?? 0) > 0 && (options.outlineColor?.[3] ?? 0) < 1,
      outlineVisible: (options.outlineColor?.[3] ?? 0) > 0,
      ready: true,
      transparent: options.transparent,
      uploadRanges: [{ offset: 0, size: bytes.byteLength }],
      version: 1
    },
    frameMatrix: identityMat4(),
    interactive: options.interactive ?? false,
    layer: options.layer ?? document.createElement('div')
  };
}

function createPointRenderItem(options: {
  count: number;
  interactive?: boolean;
  pickable?: boolean;
  sizeUnit?: 'pixel' | 'world';
  transparent?: boolean;
}): PointRenderItem {
  const bytes = new Uint8Array(options.count * POINT.stride);
  for (let index = 0; index < options.count; index += 1) {
    writePoint(bytes, index, { color: [1, 1, 1, options.transparent ? 0.5 : 1], position: [index, 0, 0] });
  }
  return {
    data: createStreamData(bytes, options.count, {
      kind: 'point',
      pickable: options.pickable,
      transparent: options.transparent
    }),
    frameMatrix: identityMat4(),
    interactive: options.interactive ?? false,
    layer: document.createElement('div'),
    size: 3,
    sizeUnit: options.sizeUnit ?? 'pixel',
    type: 'point'
  };
}

function createLineRenderItem(options: {
  count: number;
  interactive?: boolean;
  topology?: 'strip' | 'loop' | 'segments';
  widthUnit?: 'pixel' | 'world';
}): LineRenderItem {
  const bytes = new Uint8Array(options.count * LINE_VERTEX.stride);
  for (let index = 0; index < options.count; index += 1) {
    writeLineVertex(bytes, index, { position: [index, 0, 0] });
  }
  return {
    data: createStreamData(bytes, options.count, { kind: 'line' }),
    frameMatrix: identityMat4(),
    interactive: options.interactive ?? false,
    layer: document.createElement('div'),
    topology: options.topology ?? 'strip',
    type: 'line',
    widthUnit: options.widthUnit ?? 'world'
  };
}

function createTriangleRenderItem(options: { count: number; interactive?: boolean }): TriangleRenderItem {
  const bytes = new Uint8Array(options.count * TRI_VERTEX.stride);
  for (let index = 0; index < options.count; index += 1) {
    writeTriVertex(bytes, index, { position: [index, 0, 0] });
  }
  return {
    data: createStreamData(bytes, options.count, { kind: 'triangle' }),
    frameMatrix: identityMat4(),
    interactive: options.interactive ?? false,
    layer: document.createElement('div'),
    type: 'triangle'
  };
}

function createStreamData(
  bytes: Uint8Array,
  count: number,
  options: { kind: 'line' | 'point' | 'triangle'; pickable?: boolean; transparent?: boolean }
) {
  return {
    bytes,
    capacity: count,
    count,
    depthBias: false,
    issues: new Set<VertexStreamIssue>(),
    kind: options.kind,
    pickable: options.pickable ?? true,
    opaque: options.transparent !== true,
    ready: true,
    topology: 'strip' as const,
    transparent: options.transparent ?? false,
    uploadRanges: [{ offset: 0, size: bytes.byteLength }],
    version: 1,
    widthUnit: 'world' as const
  };
}

// eslint-disable-next-line complexity -- Explicit mesh fixture defaults keep each tested resource input visible.
function createMeshRenderItem(
  options: {
    color?: [number, number, number, number];
    colors?: Float32Array | null;
    identityInstance?: boolean;
    indices?: Uint32Array | null;
    interactive?: boolean;
    instances?: MeshRenderItem['instances'];
    layer?: HTMLElement;
    normals?: Float32Array | null;
    positions?: Float32Array;
    texture?: ImageBitmap | null;
    topologyVersion?: number;
    uvs?: Float32Array | null;
  } = {}
): MeshRenderItem {
  return {
    data: {
      bytes: null,
      color: options.color ?? [1, 1, 1, 1],
      colors: options.colors ?? null,
      geometryError: false,
      identityInstance: options.identityInstance ?? true,
      indices: options.indices ?? null,
      normals: options.normals === undefined ? new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]) : options.normals,
      positions: options.positions ?? new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
      ready: true,
      texture: options.texture ?? null,
      topologyVersion: options.topologyVersion ?? 1,
      transparent:
        (options.color?.[3] ?? 1) < 1 ||
        (options.texture ?? null) !== null ||
        [...(options.colors ?? [])].some((value, index) => index % 4 === 3 && value < 1),
      uploadRanges: [],
      uvs: options.uvs ?? null,
      version: 1
    },
    frameMatrix: identityMat4(),
    instances: options.instances,
    interactive: options.interactive ?? false,
    layer: options.layer ?? document.createElement('div'),
    type: 'mesh'
  };
}

function createAdvancedDevice(options: { drawIndexedIndirect?: boolean; scissor?: boolean } = {}) {
  let bufferID = 0;
  let destroyedTextures = 0;
  let activePipeline: object | undefined;
  const destroyedBuffers: number[] = [];
  const bufferDescriptors: Array<{ size: number; usage: number }> = [];
  const draws: Array<{
    indirectOffset?: number;
    indexCount?: number;
    instanceCount?: number;
    pipeline: object | undefined;
    vertexCount?: number;
  }> = [];
  const computeDispatches: number[] = [];
  const pipelines: object[] = [];
  const scissorRects: Array<readonly [number, number, number, number]> = [];
  const pipelineDescriptors: unknown[] = [];
  const passDescriptors: unknown[] = [];
  const submissions: unknown[][] = [];
  const textureDescriptors: unknown[] = [];
  const writes: ArrayBufferView[] = [];
  const uniformWriteSources: Float32Array[] = [];
  const mappedBytes = new Uint8Array(512);
  const createBindGroup = vi.fn<(descriptor: unknown) => object>(() => ({}));
  const copyTextureToBuffer = vi.fn();
  const queue = {
    submit: (buffers: readonly unknown[]) => submissions.push([...buffers]),
    copyExternalImageToTexture: vi.fn(),
    writeBuffer: (_buffer: object, _offset: number, values: ArrayBufferView) => {
      if (values instanceof Float32Array && values.length === 40) {
        uniformWriteSources.push(values);
        writes.push(new Float32Array(values));
      } else writes.push(values);
    },
    writeTexture: vi.fn()
  };
  const device = {
    lost: new Promise<SceneGPUDeviceLostInfo>(() => undefined),
    queue,
    createBindGroup,
    createBuffer: (descriptor: { size: number; usage: number }) => {
      bufferDescriptors.push(descriptor);
      const id = bufferID;
      bufferID += 1;
      return {
        destroy: () => destroyedBuffers.push(id),
        getMappedRange: () => mappedBytes.buffer,
        mapAsync: () => Promise.resolve(),
        unmap: () => undefined
      };
    },
    createCommandEncoder: () => ({
      beginComputePass: () => ({
        dispatchWorkgroups: (count: number) => computeDispatches.push(count),
        end: () => undefined,
        setBindGroup: () => undefined,
        setPipeline: () => undefined
      }),
      beginRenderPass: (descriptor: unknown) => {
        passDescriptors.push(descriptor);
        return {
          draw: (vertexCount: number, instanceCount?: number) =>
            draws.push({ instanceCount, pipeline: activePipeline, vertexCount }),
          drawIndexed: (indexCount: number, instanceCount?: number) =>
            draws.push({ indexCount, pipeline: activePipeline, instanceCount }),
          ...(options.drawIndexedIndirect === false
            ? {}
            : {
                drawIndexedIndirect: (_buffer: object, indirectOffset: number) =>
                  draws.push({ indirectOffset, pipeline: activePipeline })
              }),
          end: () => undefined,
          setBindGroup: () => undefined,
          setIndexBuffer: () => undefined,
          setPipeline: (pipeline: object) => {
            activePipeline = pipeline;
          },
          ...(options.scissor
            ? {
                // eslint-disable-next-line max-params -- Mirrors the four-coordinate WebGPU API.
                setScissorRect: (x: number, y: number, width: number, height: number) =>
                  scissorRects.push([x, y, width, height])
              }
            : {}),
          setVertexBuffer: () => undefined
        };
      },
      copyTextureToBuffer,
      finish: () => ({})
    }),
    createComputePipeline: () => ({ getBindGroupLayout: () => ({}) }),
    createRenderPipeline: (descriptor: unknown) => {
      pipelineDescriptors.push(descriptor);
      const pipeline = { getBindGroupLayout: () => ({}) };
      pipelines.push(pipeline);
      return pipeline;
    },
    createSampler: () => ({}),
    createShaderModule: () => ({}),
    createTexture: (descriptor: unknown) => {
      textureDescriptors.push(descriptor);
      return {
        createView: () => ({ depth: true }),
        destroy: () => {
          destroyedTextures += 1;
        }
      };
    },
    destroy: () => undefined,
    popErrorScope: () => Promise.resolve(null),
    pushErrorScope: () => undefined
  };
  return {
    bufferDescriptors,
    computeDispatches,
    createBindGroup,
    device,
    destroyedBuffers,
    get destroyedTextures() {
      return destroyedTextures;
    },
    draws,
    pipelines,
    scissorRects,
    submissions,
    writes,
    mappedBytes,
    passDescriptors,
    pipelineDescriptors,
    textureDescriptors,
    copyTextureToBuffer,
    uniformWriteSources
  };
}
