// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { configureSceneTesting, resetSceneTesting } from '../testing.js';
import { getSrgbCanvasViewFormat, restoreScenePlatform, scenePlatform, type SceneGPUDevice } from './platform.js';

describe(getSrgbCanvasViewFormat.name, () => {
  it('should return the compatible sRGB view for each preferred canvas format', () => {
    expect(getSrgbCanvasViewFormat('bgra8unorm')).toBe('bgra8unorm-srgb');
    expect(getSrgbCanvasViewFormat('rgba8unorm')).toBe('rgba8unorm-srgb');
  });

  it('should reject formats that cannot be presented through the sRGB canvas path', () => {
    expect(() => getSrgbCanvasViewFormat('rgba16float')).toThrow(TypeError);
  });
});

describe('Scene platform boundary', () => {
  let gpuDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    gpuDescriptor = Object.getOwnPropertyDescriptor(navigator, 'gpu');
    restoreScenePlatform();
  });

  afterEach(() => {
    resetSceneTesting();
    if (gpuDescriptor) {
      Object.defineProperty(navigator, 'gpu', gpuDescriptor);
    } else {
      Reflect.deleteProperty(navigator, 'gpu');
    }
  });

  it('should report missing and malformed GPU entrypoints as unavailable', async () => {
    setNavigatorGPU(undefined);
    expect(await scenePlatform.requestAdapter()).toBeNull();
    expect(() => scenePlatform.getPreferredCanvasFormat()).toThrow(DOMException);

    setNavigatorGPU({});
    expect(await scenePlatform.requestAdapter()).toBeNull();

    setNavigatorGPU({ requestAdapter: () => null, getPreferredCanvasFormat: 'bgra8unorm' });
    expect(await scenePlatform.requestAdapter()).toBeNull();
  });

  it('should validate adapters and devices returned by browser entrypoints', async () => {
    const gpu = createNavigatorGPU();
    setNavigatorGPU(gpu.value);

    gpu.setAdapter(null);
    expect(await scenePlatform.requestAdapter()).toBeNull();
    gpu.setAdapter({});
    expect(await scenePlatform.requestAdapter()).toBeNull();
    gpu.setAdapter({ requestDevice: 'invalid' });
    expect(await scenePlatform.requestAdapter()).toBeNull();

    for (const invalidDevice of [null, {}, { queue: {} }, { queue: { submit: () => undefined } }]) {
      gpu.setAdapter({ requestDevice: async () => invalidDevice });
      const adapter = await scenePlatform.requestAdapter();
      await expect(adapter?.requestDevice()).rejects.toThrow(TypeError);
    }

    const incompleteDevice = {
      queue: { submit: () => undefined },
      lost: Promise.resolve({}),
      createCommandEncoder: () => ({})
    };
    gpu.setAdapter({ requestDevice: async () => incompleteDevice });
    await expect((await scenePlatform.requestAdapter())?.requestDevice()).rejects.toThrow(TypeError);

    const device = createValidDevice();
    gpu.setAdapter({ requestDevice: async () => device });
    await expect((await scenePlatform.requestAdapter())?.requestDevice()).resolves.toBe(device);
  });

  it('should validate the preferred canvas format', () => {
    const gpu = createNavigatorGPU();
    setNavigatorGPU(gpu.value);

    gpu.setFormat(42);
    expect(() => scenePlatform.getPreferredCanvasFormat()).toThrow(TypeError);
    gpu.setFormat('rgba8unorm');
    expect(scenePlatform.getPreferredCanvasFormat()).toBe('rgba8unorm');
  });

  it('should validate WebGPU canvas contexts', () => {
    const canvas = document.createElement('canvas');
    expect(scenePlatform.getCanvasContext(canvas)).not.toBeNull();

    setCanvasContext(canvas, null);
    expect(scenePlatform.getCanvasContext(canvas)).toBeNull();
    setCanvasContext(canvas, {});
    expect(scenePlatform.getCanvasContext(canvas)).toBeNull();
    setCanvasContext(canvas, { configure: () => undefined });
    expect(scenePlatform.getCanvasContext(canvas)).toBeNull();
    setCanvasContext(canvas, { configure: () => undefined, unconfigure: () => undefined });
    expect(scenePlatform.getCanvasContext(canvas)).toBeNull();

    const context = {
      configure: () => undefined,
      unconfigure: () => undefined,
      getCurrentTexture: () => ({ createView: () => ({}) })
    };
    setCanvasContext(canvas, context);
    expect(scenePlatform.getCanvasContext(canvas)).toBe(context);
  });

  it('should expose restorable browser timing, observer, style, and display entrypoints', async () => {
    configureSceneTesting();
    const mutationObserver = scenePlatform.createMutationObserver(() => undefined);
    const resizeObserver = scenePlatform.createResizeObserver(() => undefined);
    const frame = scenePlatform.requestAnimationFrame(() => undefined);

    expect(scenePlatform.getComputedStyle(document.documentElement).display).toBe('block');
    expect(scenePlatform.getDevicePixelRatio()).toBe(globalThis.devicePixelRatio);
    expect(scenePlatform.now()).toBeTypeOf('number');
    scenePlatform.cancelAnimationFrame(frame);
    mutationObserver.disconnect();
    resizeObserver.disconnect();
    await Promise.resolve();
  });
});

function setNavigatorGPU(value: unknown): void {
  Object.defineProperty(navigator, 'gpu', { configurable: true, value });
}

function setCanvasContext(canvas: HTMLCanvasElement, value: unknown): void {
  Object.defineProperty(canvas, 'getContext', { configurable: true, value: () => value });
}

function createNavigatorGPU(): {
  value: { requestAdapter(): Promise<unknown>; getPreferredCanvasFormat(): unknown };
  setAdapter(value: unknown): void;
  setFormat(value: unknown): void;
} {
  let adapter: unknown;
  let format: unknown = 'bgra8unorm';
  return {
    value: {
      requestAdapter: async () => adapter,
      getPreferredCanvasFormat: () => format
    },
    setAdapter: value => (adapter = value),
    setFormat: value => (format = value)
  };
}

function createValidDevice(): SceneGPUDevice {
  return {
    lost: new Promise(() => undefined),
    queue: { submit: () => undefined },
    createCommandEncoder: () => ({
      beginRenderPass: () => ({ end: () => undefined }),
      finish: () => ({})
    }),
    destroy: () => undefined
  };
}
