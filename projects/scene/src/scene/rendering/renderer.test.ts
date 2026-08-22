// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { LINE_VERTEX, MARKER, POINT, TRI_VERTEX } from '../../internal/layouts/built-ins.js';
import { writeLineVertex, writeMarker, writePoint, writeTriVertex } from '../../internal/layouts/helpers.js';
import { identityMat4 } from '../../internal/math/mat4.js';
import type { LabelTextureRenderItem } from '../../internal/label/renderer.js';
import { configureSceneTesting, resetSceneTesting, type SceneGPUDevice } from '../../internal/testing.js';
import {
  SceneRenderer,
  getSceneInstanceUploadCount,
  getSceneMeshUploadSnapshot,
  getScenePickPerformanceSnapshot,
  registerSceneRenderer,
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
  it('should expose zero counters until a renderer is registered, then expose its counters', () => {
    const scene = document.createElement('div');
    expect(new SceneRenderer().active).toBe(false);
    expect(getSceneInstanceUploadCount(scene)).toBe(0);
    expect(getSceneMeshUploadSnapshot(scene)).toEqual({ rebuilds: 0, uploads: 0 });
    expect(getScenePickPerformanceSnapshot(scene)).toEqual({
      latestPointLatencyMs: 0,
      pickPasses: 0,
      readbackBuffers: 0,
      targetAllocations: 0
    });
    const renderer = new SceneRenderer();
    registerSceneRenderer(scene, renderer);
    expect(getSceneInstanceUploadCount(scene)).toBe(0);
    expect(getSceneMeshUploadSnapshot(scene)).toEqual({ rebuilds: 0, uploads: 0 });
    expect(getScenePickPerformanceSnapshot(scene)).toEqual({
      latestPointLatencyMs: 0,
      pickPasses: 0,
      readbackBuffers: 0,
      targetAllocations: 0
    });
  });

  it('should stay active without geometry capabilities and skip deferred pipeline loading safely', () => {
    const submissions: unknown[][] = [];
    const renderer = new SceneRenderer();
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
    renderer.disconnect();
    expect(renderer.active).toBe(false);
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

  it('should use a supplied camera view-projection for render uniforms and pick snapshots', () => {
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
    const uniform = gpu.writes.find(write => write instanceof Float32Array && write.length === 40);
    expect(uniform).toBeInstanceOf(Float32Array);
    expect(Array.from((uniform as Float32Array).subarray(0, 16))).toEqual(Array.from(projection));
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should select world units only for world-sized points', () => {
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

    renderer.render([createPointRenderItem({ count: 1, sizeUnit: 'world' })]);
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
    expect(renderer.instanceUploadCount).toBe(4);
    expect(new Set(gpu.uniformWriteSources).size).toBe(1);

    renderer.disconnect();
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
    renderer.disconnect();
    resetSceneTesting();
  });

  it('should attach a label occlusion query set when the device supports query resources', async () => {
    const gpu = createAdvancedDevice();
    (gpu.device as SceneGPUDevice & { createQuerySet(descriptor: unknown): object }).createQuerySet = () => ({});
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

  it('should retry a mapped pick when a newer frame replaces its snapshot', async () => {
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
    await vi.waitFor(() => expect(mapAsync).toHaveBeenCalledTimes(2));
    mapResolvers[1]?.();

    await expect(pick).resolves.toMatchObject({ instanceIndex: 0, layer: item.layer });
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

  it('should handle an empty pick table and report asynchronous validation errors', async () => {
    const gpu = createAdvancedDevice();
    gpu.device.popErrorScope = () => Promise.resolve({ message: 'validation failed' });
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
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
    renderer.render([]);
    await expect(renderer.pick({ canvas, clientX: 0, clientY: 0, pixelX: 0, pixelY: 0 })).resolves.toBeNull();
    await vi.waitFor(() => expect(error).toHaveBeenCalledWith('Scene WebGPU validation error.', 'validation failed'));
    error.mockRestore();
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
    expect(gpu.createBindGroup).toHaveBeenCalledOnce();
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
    expect(renderer.instanceUploadCount).toBe(2);
    expect(gpu.draws[0]?.pipeline).toBe(gpu.draws[1]?.pipeline);
    expect(gpu.draws[2]?.pipeline).not.toBe(gpu.draws[0]?.pipeline);
    expect(gpu.draws[3]?.pipeline).toBe(gpu.pipelines[0]);
    expect(gpu.draws.map(draw => draw.instanceCount)).toEqual([1, 1, 1, undefined]);
    expect(gpu.passDescriptors.slice(-3)).toMatchObject([
      { colorAttachments: [{ loadOp: 'clear' }] },
      { colorAttachments: [{ loadOp: 'clear' }, { loadOp: 'clear' }] },
      { colorAttachments: [{ loadOp: 'load' }] }
    ]);

    const opaqueUpdate = {
      ...loadedOpaque,
      data: { ...loadedOpaque.data, uploadRanges: [{ offset: 0, size: MARKER.stride }] }
    };
    const transparentUpdate = loadedTransparent;
    renderer.render([opaqueUpdate, transparentUpdate]);
    expect(renderer.instanceUploadCount).toBe(3);

    const replacement = createRenderItem({
      kind: 'cube',
      transparent: false,
      layer: loadedOpaque.layer,
      count: 2
    });
    renderer.render([replacement]);
    expect(renderer.instanceUploadCount).toBe(4);
    expect(gpu.destroyedBuffers.length).toBeGreaterThan(0);

    renderer.resize(32, 32);
    renderer.render([]);
    expect(gpu.destroyedTextures).toBeGreaterThan(0);
    renderer.disconnect();
    expect(context.unconfigure).toHaveBeenCalledOnce();
    expect(gpu.submissions).toHaveLength(5);
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
    expect(gpu.draws.slice(-2).map(draw => draw.indexCount)).toEqual([36, 24]);

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

    expect(gpu.draws.slice(-6).map(draw => draw.vertexCount)).toEqual([12, 3, undefined, 15, 12, 3]);
    expect(gpu.draws.slice(-6).map(draw => draw.pipeline)).toEqual([
      gpu.pipelines[7],
      gpu.pipelines[9],
      gpu.pipelines[1],
      gpu.pipelines[5],
      gpu.pipelines[8],
      gpu.pipelines[0]
    ]);
    expect(renderer.instanceUploadCount).toBe(4);

    renderer.render([
      { ...loadedLine, data: { ...loadedLine.data, uploadRanges: [{ offset: 0, size: LINE_VERTEX.stride }] } },
      loadedTriangles,
      loadedPoints
    ]);
    expect(renderer.instanceUploadCount).toBe(5);
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

  it('should decode large instance IDs from compact layer ranges and expose pick counters', async () => {
    const gpu = createAdvancedDevice();
    configureSceneTesting({
      getCanvasContext: () => ({
        configure: () => undefined,
        unconfigure: () => undefined,
        getCurrentTexture: () => ({ createView: () => ({}) })
      })
    });
    const renderer = new SceneRenderer();
    const scene = document.createElement('div');
    const canvas = document.createElement('canvas');
    registerSceneRenderer(scene, renderer);
    renderer.initialize(canvas, { device: gpu.device, format: 'bgra8unorm' });
    renderer.resize(20, 10);
    const first = createPointRenderItem({ count: 10_000 });
    const second = createPointRenderItem({ count: 3 });
    renderer.render([first, second]);
    await vi.waitFor(() => expect(renderer.consumeRenderRequest()).toBe(true));
    renderer.render([
      { ...first, data: { ...first.data, uploadRanges: [] } },
      { ...second, data: { ...second.data, uploadRanges: [] } }
    ]);
    new DataView(gpu.mappedBytes.buffer).setUint32(0, 10_003, true);
    new DataView(gpu.mappedBytes.buffer).setFloat32(256, 0.5, true);

    await expect(renderer.pick({ canvas, clientX: 2, clientY: 3, pixelX: 2, pixelY: 3 })).resolves.toMatchObject({
      instanceIndex: 2,
      layer: second.layer
    });
    renderer.recordLatestPointLatency(12.5);
    expect(getScenePickPerformanceSnapshot(scene)).toEqual({
      latestPointLatencyMs: 12.5,
      pickPasses: 1,
      readbackBuffers: 1,
      targetAllocations: 2
    });
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
    expect(renderer.meshRebuildCount).toBe(1);
    const deformed = createMeshRenderItem({
      layer: mesh.layer,
      normals,
      positions: new Float32Array([0.1, 0, 0, 1, 0, 0, 0, 1, 0])
    });
    renderer.render([deformed]);
    expect(renderer.meshRebuildCount).toBe(1);
    expect(renderer.meshUploadCount).toBe(1);
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

    const drawCount = gpu.draws.length;
    renderer.render([
      {
        ...identity,
        data: { ...identity.data, identityInstance: false },
        instances: {
          bytes: new Uint8Array(),
          count: 0,
          kind: 'cube',
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
    renderer.render([attributes]);
    const positionUpdate = {
      ...attributes,
      data: { ...attributes.data, positions: new Float32Array(attributes.data.positions) }
    };
    renderer.render([positionUpdate]);
    expect(gpu.writes.at(-3)).toBe(positionUpdate.data.positions);

    const normalUpdate = {
      ...positionUpdate,
      data: { ...positionUpdate.data, normals: new Float32Array(positionUpdate.data.normals as Float32Array) }
    };
    renderer.render([normalUpdate]);
    expect(gpu.writes.at(-3)).toBe(normalUpdate.data.normals);

    const uvUpdate = {
      ...normalUpdate,
      data: { ...normalUpdate.data, uvs: new Float32Array(normalUpdate.data.uvs as Float32Array) }
    };
    renderer.render([uvUpdate]);
    expect(gpu.writes.at(-3)).toBe(uvUpdate.data.uvs);

    const colorUpdate = {
      ...uvUpdate,
      data: { ...uvUpdate.data, colors: new Float32Array(uvUpdate.data.colors as Float32Array) }
    };
    renderer.render([colorUpdate]);
    expect(gpu.writes.at(-3)).toBe(colorUpdate.data.colors);

    const flat = createMeshRenderItem({ layer: document.createElement('div'), normals: null });
    renderer.render([flat]);
    const flatUpdate = {
      ...flat,
      data: { ...flat.data, positions: new Float32Array([0, 0, 0, 2, 0, 0, 0, 1, 0]) }
    };
    renderer.render([flatUpdate]);
    expect(gpu.writes.at(-4)).toBe(flatUpdate.data.positions);
    expect(gpu.writes.at(-3)).toBeInstanceOf(Float32Array);
    expect(renderer.meshUploadCount).toBe(5);
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
  faceAlpha?: number;
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
      bytes,
      count,
      kind: options.kind,
      outlineTransparent: (options.outlineColor?.[3] ?? 0) > 0 && (options.outlineColor?.[3] ?? 0) < 1,
      outlineVisible: (options.outlineColor?.[3] ?? 0) > 0,
      ready: true,
      transparent: options.transparent,
      uploadRanges: [{ offset: 0, size: bytes.byteLength }],
      version: 1
    },
    frameMatrix: identityMat4(),
    layer: options.layer ?? document.createElement('div')
  };
}

function createPointRenderItem(options: {
  count: number;
  pickable?: boolean;
  sizeUnit?: 'pixel' | 'world';
  transparent?: boolean;
}): PointRenderItem {
  const bytes = new Uint8Array(options.count * POINT.stride);
  for (let index = 0; index < options.count; index += 1) {
    writePoint(bytes, index, { color: [1, 1, 1, options.transparent ? 0.5 : 1], position: [index, 0, 0] });
  }
  return {
    data: createStreamData(bytes, options.count, { pickable: options.pickable, transparent: options.transparent }),
    frameMatrix: identityMat4(),
    layer: document.createElement('div'),
    size: 3,
    sizeUnit: options.sizeUnit ?? 'pixel',
    type: 'point'
  };
}

function createLineRenderItem(options: {
  count: number;
  topology?: 'strip' | 'loop' | 'segments';
  widthUnit?: 'pixel' | 'world';
}): LineRenderItem {
  const bytes = new Uint8Array(options.count * LINE_VERTEX.stride);
  for (let index = 0; index < options.count; index += 1) {
    writeLineVertex(bytes, index, { position: [index, 0, 0] });
  }
  return {
    data: createStreamData(bytes, options.count),
    frameMatrix: identityMat4(),
    layer: document.createElement('div'),
    topology: options.topology ?? 'strip',
    type: 'line',
    widthUnit: options.widthUnit ?? 'world'
  };
}

function createTriangleRenderItem(options: { count: number }): TriangleRenderItem {
  const bytes = new Uint8Array(options.count * TRI_VERTEX.stride);
  for (let index = 0; index < options.count; index += 1) {
    writeTriVertex(bytes, index, { position: [index, 0, 0] });
  }
  return {
    data: createStreamData(bytes, options.count, false),
    frameMatrix: identityMat4(),
    layer: document.createElement('div'),
    type: 'triangle'
  };
}

function createStreamData(
  bytes: Uint8Array,
  count: number,
  options: { pickable?: boolean; transparent?: boolean } = {}
) {
  return {
    bytes,
    count,
    depthBias: false,
    pickable: options.pickable ?? true,
    ready: true,
    topology: 'strip' as const,
    transparent: options.transparent ?? false,
    uploadRanges: [{ offset: 0, size: bytes.byteLength }],
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
    layer: options.layer ?? document.createElement('div'),
    type: 'mesh'
  };
}

function createAdvancedDevice(): {
  device: SceneGPUDevice;
  bufferDescriptors: Array<{ size: number; usage: number }>;
  createBindGroup: ReturnType<typeof vi.fn>;
  destroyedBuffers: number[];
  destroyedTextures: number;
  draws: Array<{ indexCount?: number; instanceCount?: number; pipeline: object | undefined; vertexCount?: number }>;
  passDescriptors: unknown[];
  pipelineDescriptors: unknown[];
  pipelines: object[];
  submissions: unknown[][];
  writes: ArrayBufferView[];
  mappedBytes: Uint8Array;
  copyTextureToBuffer: ReturnType<typeof vi.fn>;
  uniformWriteSources: Float32Array[];
} {
  let bufferID = 0;
  let destroyedTextures = 0;
  let activePipeline: object | undefined;
  const destroyedBuffers: number[] = [];
  const bufferDescriptors: Array<{ size: number; usage: number }> = [];
  const draws: Array<{
    indexCount?: number;
    instanceCount?: number;
    pipeline: object | undefined;
    vertexCount?: number;
  }> = [];
  const pipelines: object[] = [];
  const pipelineDescriptors: unknown[] = [];
  const passDescriptors: unknown[] = [];
  const submissions: unknown[][] = [];
  const writes: ArrayBufferView[] = [];
  const uniformWriteSources: Float32Array[] = [];
  const mappedBytes = new Uint8Array(512);
  const createBindGroup = vi.fn(() => ({}));
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
  const device: SceneGPUDevice = {
    lost: new Promise(() => undefined),
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
      beginRenderPass: descriptor => {
        passDescriptors.push(descriptor);
        return {
          draw: (vertexCount: number, instanceCount?: number) =>
            draws.push({ instanceCount, pipeline: activePipeline, vertexCount }),
          drawIndexed: (indexCount: number, instanceCount?: number) =>
            draws.push({ indexCount, pipeline: activePipeline, instanceCount }),
          end: () => undefined,
          setBindGroup: () => undefined,
          setIndexBuffer: () => undefined,
          setPipeline: pipeline => {
            activePipeline = pipeline;
          },
          setVertexBuffer: () => undefined
        };
      },
      copyTextureToBuffer,
      finish: () => ({})
    }),
    createRenderPipeline: descriptor => {
      pipelineDescriptors.push(descriptor);
      const pipeline = { getBindGroupLayout: () => ({}) };
      pipelines.push(pipeline);
      return pipeline;
    },
    createSampler: () => ({}),
    createShaderModule: () => ({}),
    createTexture: () => ({
      createView: () => ({ depth: true }),
      destroy: () => {
        destroyedTextures += 1;
      }
    }),
    destroy: () => undefined,
    popErrorScope: () => Promise.resolve(null),
    pushErrorScope: () => undefined
  };
  return {
    bufferDescriptors,
    createBindGroup,
    device,
    destroyedBuffers,
    get destroyedTextures() {
      return destroyedTextures;
    },
    draws,
    pipelines,
    submissions,
    writes,
    mappedBytes,
    passDescriptors,
    pipelineDescriptors,
    copyTextureToBuffer,
    uniformWriteSources
  };
}
