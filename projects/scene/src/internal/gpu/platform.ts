// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface SceneGPUAdapter {
  requestDevice(): Promise<SceneGPUDevice>;
}

export interface SceneGPUCanvasContext {
  configure(configuration: {
    device: SceneGPUDevice;
    format: string;
    alphaMode: 'premultiplied';
    colorSpace?: 'srgb';
    viewFormats?: readonly string[];
  }): void;
  unconfigure(): void;
  getCurrentTexture(): SceneGPUTexture;
}

export interface SceneGPUCommandEncoder {
  beginRenderPass(descriptor: unknown): SceneGPURenderPass;
  copyBufferToBuffer?(
    source: SceneGPUBuffer,
    sourceOffset: number,
    destination: SceneGPUBuffer,
    destinationOffset: number,
    size: number
  ): void;
  copyTextureToBuffer?(
    source: { texture: SceneGPUTexture; origin: { x: number; y: number; z?: number } },
    destination: { buffer: SceneGPUBuffer; bytesPerRow: number; offset?: number },
    copySize: { width: number; height: number; depthOrArrayLayers?: number }
  ): void;
  resolveQuerySet?(
    querySet: SceneGPUQuerySet,
    firstQuery: number,
    queryCount: number,
    destination: SceneGPUBuffer,
    destinationOffset: number
  ): void;
  finish(): unknown;
}

export type SceneGPUBindGroup = object;

export type SceneGPUSampler = object;

export interface SceneGPUBuffer {
  destroy(): void;
  getMappedRange?(): ArrayBuffer;
  mapAsync?(mode: number, offset?: number, size?: number): Promise<void>;
  unmap?(): void;
}

export interface SceneGPUQuerySet {
  destroy?(): void;
}

export interface SceneGPURenderPipeline {
  getBindGroupLayout(index: number): unknown;
}

export interface SceneGPUDevice {
  readonly lost: Promise<SceneGPUDeviceLostInfo>;
  readonly queue: SceneGPUQueue;
  createBindGroup?(descriptor: unknown): SceneGPUBindGroup;
  createBuffer?(descriptor: unknown): SceneGPUBuffer;
  createCommandEncoder(): SceneGPUCommandEncoder;
  createRenderPipeline?(descriptor: unknown): SceneGPURenderPipeline;
  createQuerySet?(descriptor: unknown): SceneGPUQuerySet;
  createSampler?(descriptor?: unknown): SceneGPUSampler;
  createShaderModule?(descriptor: unknown): unknown;
  createTexture?(descriptor: unknown): SceneGPUTexture;
  destroy(): void;
  pushErrorScope?(filter: 'validation'): void;
  popErrorScope?(): Promise<unknown | null>;
}

export interface SceneGPUDeviceLostInfo {
  readonly message?: string;
  readonly reason?: string;
}

export interface SceneGPUQueue {
  onSubmittedWorkDone?(): Promise<void>;
  submit(commandBuffers: readonly unknown[]): void;
  copyExternalImageToTexture?(
    source: { source: ImageBitmap },
    destination: { texture: SceneGPUTexture },
    copySize: { width: number; height: number }
  ): void;
  writeBuffer?(buffer: SceneGPUBuffer, bufferOffset: number, data: ArrayBufferView): void;
  writeTexture?(
    destination: { texture: SceneGPUTexture },
    data: ArrayBufferView,
    layout: { bytesPerRow: number },
    size: { width: number; height: number }
  ): void;
}

export interface SceneGPURenderPass {
  beginOcclusionQuery?(queryIndex: number): void;
  draw?(vertexCount: number, instanceCount?: number): void;
  drawIndexed?(indexCount: number, instanceCount?: number): void;
  endOcclusionQuery?(): void;
  end(): void;
  setBindGroup?(index: number, bindGroup: SceneGPUBindGroup): void;
  setIndexBuffer?(buffer: SceneGPUBuffer, indexFormat: 'uint32'): void;
  setPipeline?(pipeline: SceneGPURenderPipeline): void;
  setVertexBuffer?(slot: number, buffer: SceneGPUBuffer): void;
}

export interface SceneGPUTexture {
  createView(descriptor?: { format?: string }): unknown;
  destroy?(): void;
}

export interface ScenePlatform {
  requestAdapter(): Promise<SceneGPUAdapter | null>;
  getPreferredCanvasFormat(): string;
  getCanvasContext(canvas: HTMLCanvasElement): SceneGPUCanvasContext | null;
  createMutationObserver(callback: MutationCallback): MutationObserver;
  createResizeObserver(callback: ResizeObserverCallback): ResizeObserver;
  requestAnimationFrame(callback: FrameRequestCallback): number;
  cancelAnimationFrame(handle: number): void;
  getComputedStyle(element: Element): CSSStyleDeclaration;
  getDevicePixelRatio(): number;
  getTimeOrigin(): number;
  now(): number;
}

const defaultScenePlatform: ScenePlatform = {
  requestAdapter: requestPlatformAdapter,
  getPreferredCanvasFormat: getPlatformCanvasFormat,
  getCanvasContext: getPlatformCanvasContext,
  createMutationObserver: callback => new MutationObserver(callback),
  createResizeObserver: callback => new ResizeObserver(callback),
  requestAnimationFrame: callback => globalThis.requestAnimationFrame(callback),
  cancelAnimationFrame: handle => globalThis.cancelAnimationFrame(handle),
  getComputedStyle: element => globalThis.getComputedStyle(element),
  getDevicePixelRatio: () => globalThis.devicePixelRatio,
  getTimeOrigin: () => performance.timeOrigin,
  now: () => performance.now()
};

export const scenePlatform: ScenePlatform = { ...defaultScenePlatform };

export function restoreScenePlatform(): void {
  Object.assign(scenePlatform, defaultScenePlatform);
}

export function getLiveSceneTime(): number {
  return scenePlatform.getTimeOrigin() + scenePlatform.now();
}

/** Returns the sRGB render-target view compatible with a preferred canvas format. */
export function getSrgbCanvasViewFormat(format: string): 'bgra8unorm-srgb' | 'rgba8unorm-srgb' {
  if (format === 'bgra8unorm' || format === 'rgba8unorm') {
    return `${format}-srgb`;
  }
  throw new TypeError(`Unsupported WebGPU canvas format: ${format}`);
}

async function requestPlatformAdapter(): Promise<SceneGPUAdapter | null> {
  const gpu = getNavigatorGPU();
  if (!gpu) {
    return null;
  }

  const adapter = await Reflect.apply(gpu.requestAdapter, gpu.target, []);
  if (!isObject(adapter)) {
    return null;
  }

  const requestDevice = Reflect.get(adapter, 'requestDevice');
  if (typeof requestDevice !== 'function') {
    return null;
  }

  return {
    async requestDevice() {
      const device = await Reflect.apply(requestDevice, adapter, []);
      if (!isSceneGPUDevice(device)) {
        throw new TypeError('The WebGPU adapter returned an invalid device.');
      }
      return device;
    }
  };
}

function getPlatformCanvasFormat(): string {
  const gpu = getNavigatorGPU();
  if (!gpu) {
    throw new DOMException('WebGPU is unavailable.', 'NotSupportedError');
  }
  const format = Reflect.apply(gpu.getPreferredCanvasFormat, gpu.target, []);
  if (typeof format !== 'string') {
    throw new TypeError('WebGPU returned an invalid preferred canvas format.');
  }
  return format;
}

function getPlatformCanvasContext(canvas: HTMLCanvasElement): SceneGPUCanvasContext | null {
  const context = Reflect.apply(canvas.getContext, canvas, ['webgpu']);
  return isSceneGPUCanvasContext(context) ? context : null;
}

function getNavigatorGPU(): {
  target: object;
  requestAdapter: (...args: never[]) => unknown;
  getPreferredCanvasFormat: (...args: never[]) => unknown;
} | null {
  const gpu = Reflect.get(navigator, 'gpu');
  if (!isObject(gpu)) {
    return null;
  }

  const requestAdapter = Reflect.get(gpu, 'requestAdapter');
  const getPreferredCanvasFormat = Reflect.get(gpu, 'getPreferredCanvasFormat');
  return typeof requestAdapter === 'function' && typeof getPreferredCanvasFormat === 'function'
    ? { target: gpu, requestAdapter, getPreferredCanvasFormat }
    : null;
}

function isSceneGPUCanvasContext(value: unknown): value is SceneGPUCanvasContext {
  return (
    isObject(value) &&
    typeof Reflect.get(value, 'configure') === 'function' &&
    typeof Reflect.get(value, 'unconfigure') === 'function' &&
    typeof Reflect.get(value, 'getCurrentTexture') === 'function'
  );
}

function isSceneGPUDevice(value: unknown): value is SceneGPUDevice {
  if (!isObject(value)) {
    return false;
  }
  const queue = Reflect.get(value, 'queue');
  return (
    isObject(queue) &&
    typeof Reflect.get(queue, 'submit') === 'function' &&
    Reflect.get(value, 'lost') instanceof Promise &&
    typeof Reflect.get(value, 'createCommandEncoder') === 'function' &&
    typeof Reflect.get(value, 'destroy') === 'function'
  );
}

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}
