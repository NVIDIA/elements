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

/**
 * Nominal resource handles deliberately carry no runtime fields. The optional
 * symbol keys make unlike WebGPU resources incompatible in TypeScript while
 * preserving native object identity and keeping lightweight test fakes simple.
 */
declare const sceneGpuResourceKind: unique symbol;

export interface SceneGPUShaderModule {
  readonly [sceneGpuResourceKind]?: 'shader-module';
}

export interface SceneGPUTextureView {
  readonly [sceneGpuResourceKind]?: 'texture-view';
  readonly [property: string]: unknown;
}

export interface SceneGPUBindGroupLayout {
  readonly [sceneGpuResourceKind]?: 'bind-group-layout';
}

interface SceneGPUCommandBuffer {
  readonly [sceneGpuResourceKind]?: 'command-buffer';
}

export interface SceneGPUShaderModuleDescriptor {
  readonly code: string;
  readonly [property: string]: unknown;
}

export interface SceneGPUVertexBufferLayout {
  readonly arrayStride: number;
  readonly attributes: readonly { readonly format: string; readonly offset: number; readonly shaderLocation: number }[];
}

export interface SceneGPUColorTargetState {
  readonly blend?: object;
  readonly format: string;
  readonly writeMask?: number;
}

export interface SceneGPURenderPipelineDescriptor {
  readonly depthStencil?: {
    readonly depthCompare: 'always' | 'less' | 'less-equal';
    readonly depthWriteEnabled: boolean;
    readonly format: string;
    readonly depthBias?: number;
    readonly depthBiasClamp?: number;
    readonly depthBiasSlopeScale?: number;
  };
  readonly fragment?: {
    readonly entryPoint: string;
    readonly module: SceneGPUShaderModule;
    readonly targets: readonly SceneGPUColorTargetState[];
  };
  readonly layout: 'auto';
  readonly primitive?: {
    readonly cullMode?: 'back' | 'none';
    readonly frontFace?: 'ccw';
    readonly topology: 'line-list' | 'triangle-list';
  };
  readonly vertex: {
    readonly buffers?: readonly SceneGPUVertexBufferLayout[];
    readonly entryPoint: string;
    readonly module: SceneGPUShaderModule;
  };
}

export interface SceneGPUBufferDescriptor {
  readonly size: number;
  readonly usage: number;
  readonly [property: string]: unknown;
}

export interface SceneGPUComputePipelineDescriptor {
  readonly compute: { readonly entryPoint: string; readonly module: SceneGPUShaderModule };
  readonly layout: 'auto';
  readonly [property: string]: unknown;
}

interface SceneGPUQuerySetDescriptor {
  readonly count: number;
  readonly type: 'occlusion' | 'timestamp';
}

export interface SceneGPUSamplerDescriptor {
  readonly magFilter?: 'linear' | 'nearest';
  readonly minFilter?: 'linear' | 'nearest';
  readonly [property: string]: unknown;
}

export interface SceneGPUTextureDescriptor {
  readonly format?: string;
  readonly size?:
    | readonly [width: number, height: number]
    | { readonly depthOrArrayLayers?: number; readonly height: number; readonly width: number };
  readonly usage?: number;
  readonly [property: string]: unknown;
}

export interface SceneGPUBindGroupDescriptor {
  readonly entries: readonly {
    readonly binding: number;
    readonly resource: SceneGPUBindGroupResource;
  }[];
  readonly layout: SceneGPUBindGroupLayout;
  readonly [property: string]: unknown;
}

type SceneGPUBindGroupResource =
  | SceneGPUSampler
  | SceneGPUTextureView
  | { readonly buffer: SceneGPUBuffer; readonly offset?: number; readonly size?: number };

interface SceneGPUColor {
  readonly a: number;
  readonly b: number;
  readonly g: number;
  readonly r: number;
}

interface SceneGPURenderPassColorAttachment {
  readonly clearValue?: SceneGPUColor;
  readonly loadOp: 'clear' | 'load';
  readonly storeOp: 'discard' | 'store';
  readonly view: SceneGPUTextureView;
}

interface SceneGPURenderPassDepthStencilAttachment {
  readonly depthClearValue?: number;
  readonly depthLoadOp: 'clear' | 'load';
  readonly depthStoreOp: 'discard' | 'store';
  readonly view: SceneGPUTextureView;
}

export interface SceneGPURenderPassDescriptor {
  readonly colorAttachments: readonly (SceneGPURenderPassColorAttachment | null)[];
  readonly depthStencilAttachment?: SceneGPURenderPassDepthStencilAttachment;
  readonly occlusionQuerySet?: SceneGPUQuerySet;
}

export interface SceneGPUCommandEncoder {
  beginComputePass?(): SceneGPUComputePass;
  beginRenderPass(descriptor: SceneGPURenderPassDescriptor): SceneGPURenderPass;
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
  finish(): SceneGPUCommandBuffer;
}

export interface SceneGPUBindGroup {
  readonly [sceneGpuResourceKind]?: 'bind-group';
}

export interface SceneGPUSampler {
  readonly [sceneGpuResourceKind]?: 'sampler';
}

export interface SceneGPUBuffer {
  destroy(): void;
  getMappedRange?(): ArrayBuffer;
  mapAsync?(mode: number, offset?: number, size?: number): Promise<void>;
  unmap?(): void;
}

export interface SceneGPUQuerySet {
  destroy?(): void;
}

export interface SceneGPUComputePipeline {
  getBindGroupLayout(index: number): SceneGPUBindGroupLayout;
}

export interface SceneGPUComputePass {
  dispatchWorkgroups(x: number, y?: number, z?: number): void;
  end(): void;
  setBindGroup(index: number, bindGroup: SceneGPUBindGroup): void;
  setPipeline(pipeline: SceneGPUComputePipeline): void;
}

export interface SceneGPURenderPipeline {
  getBindGroupLayout(index: number): SceneGPUBindGroupLayout;
}

export interface SceneGPUDevice {
  readonly lost: Promise<SceneGPUDeviceLostInfo>;
  readonly limits?: SceneGPUSupportedLimits;
  readonly queue: SceneGPUQueue;
  createBindGroup?(descriptor: SceneGPUBindGroupDescriptor): SceneGPUBindGroup;
  createBuffer?(descriptor: SceneGPUBufferDescriptor): SceneGPUBuffer;
  createCommandEncoder(): SceneGPUCommandEncoder;
  createComputePipeline?(descriptor: SceneGPUComputePipelineDescriptor): SceneGPUComputePipeline;
  createRenderPipeline?(descriptor: SceneGPURenderPipelineDescriptor): SceneGPURenderPipeline;
  createQuerySet?(descriptor: SceneGPUQuerySetDescriptor): SceneGPUQuerySet;
  createSampler?(descriptor?: SceneGPUSamplerDescriptor): SceneGPUSampler;
  createShaderModule?(descriptor: SceneGPUShaderModuleDescriptor): SceneGPUShaderModule;
  createTexture?(descriptor: SceneGPUTextureDescriptor): SceneGPUTexture;
  destroy(): void;
  pushErrorScope?(filter: 'validation'): void;
  popErrorScope?(): Promise<unknown | null>;
}

interface SceneGPUSupportedLimits {
  readonly maxBufferSize?: number;
  readonly maxComputeWorkgroupsPerDimension?: number;
  readonly maxStorageBufferBindingSize?: number;
  readonly minStorageBufferOffsetAlignment?: number;
}

export interface SceneGPUDeviceLostInfo {
  readonly message?: string;
  readonly reason?: string;
}

export interface SceneGPUQueue {
  onSubmittedWorkDone?(): Promise<void>;
  submit(commandBuffers: readonly SceneGPUCommandBuffer[]): void;
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

/** Required operations for creating render pipelines. */
export interface SceneGPURenderPipelineDevice extends SceneGPUDevice {
  createRenderPipeline(descriptor: SceneGPURenderPipelineDescriptor): SceneGPURenderPipeline;
  createShaderModule(descriptor: SceneGPUShaderModuleDescriptor): SceneGPUShaderModule;
}

/** Required operations for compute-backed scene features. */
export interface SceneGPUComputeDevice extends SceneGPUDevice {
  readonly queue: SceneGPUQueue & {
    writeBuffer(buffer: SceneGPUBuffer, bufferOffset: number, data: ArrayBufferView): void;
  };
  createBindGroup(descriptor: SceneGPUBindGroupDescriptor): SceneGPUBindGroup;
  createBuffer(descriptor: SceneGPUBufferDescriptor): SceneGPUBuffer;
  createComputePipeline(descriptor: SceneGPUComputePipelineDescriptor): SceneGPUComputePipeline;
  createShaderModule(descriptor: SceneGPUShaderModuleDescriptor): SceneGPUShaderModule;
}

/** Narrows a device to the operations shared by Scene's compute-backed features. */
export function supportsSceneGPUCompute(device: SceneGPUDevice): device is SceneGPUComputeDevice {
  return (
    typeof device.createBindGroup === 'function' &&
    typeof device.createBuffer === 'function' &&
    typeof device.createComputePipeline === 'function' &&
    typeof device.createShaderModule === 'function' &&
    typeof device.queue.writeBuffer === 'function'
  );
}

/** Required base-rendering operations that Scene checks once while it initializes a device. */
export interface SceneGeometryDevice extends SceneGPURenderPipelineDevice {
  readonly queue: SceneGPUQueue & {
    writeBuffer(buffer: SceneGPUBuffer, bufferOffset: number, data: ArrayBufferView): void;
  };
  createBindGroup(descriptor: SceneGPUBindGroupDescriptor): SceneGPUBindGroup;
  createBuffer(descriptor: SceneGPUBufferDescriptor): SceneGPUBuffer;
  createTexture(descriptor: SceneGPUTextureDescriptor): SceneGPUTexture;
}

/** Narrows a device to the operations required by Scene's lazily loaded geometry renderer. */
export function supportsSceneGeometryRendering(device: SceneGPUDevice): device is SceneGeometryDevice {
  return (
    typeof device.createBindGroup === 'function' &&
    typeof device.createBuffer === 'function' &&
    typeof device.createRenderPipeline === 'function' &&
    typeof device.createShaderModule === 'function' &&
    typeof device.createTexture === 'function' &&
    typeof device.queue.writeBuffer === 'function'
  );
}

export interface SceneGPURenderPass {
  beginOcclusionQuery?(queryIndex: number): void;
  draw?(vertexCount: number, instanceCount?: number): void;
  drawIndexed?(indexCount: number, instanceCount?: number): void;
  drawIndexedIndirect?(indirectBuffer: SceneGPUBuffer, indirectOffset: number): void;
  endOcclusionQuery?(): void;
  end(): void;
  setBindGroup?(index: number, bindGroup: SceneGPUBindGroup): void;
  setIndexBuffer?(buffer: SceneGPUBuffer, indexFormat: 'uint32'): void;
  setPipeline?(pipeline: SceneGPURenderPipeline): void;
  setScissorRect?(x: number, y: number, width: number, height: number): void;
  setVertexBuffer?(slot: number, buffer: SceneGPUBuffer): void;
}

/** Render-pass operations shared by non-indexed Scene draw paths. */
export interface SceneGPUDrawPass extends SceneGPURenderPass {
  draw(vertexCount: number, instanceCount?: number): void;
  setBindGroup(index: number, bindGroup: SceneGPUBindGroup): void;
  setPipeline(pipeline: SceneGPURenderPipeline): void;
}

/** Narrows a render pass to the operations required by non-indexed Scene draws. */
export function supportsSceneGPUDrawPass(pass: SceneGPURenderPass): pass is SceneGPUDrawPass {
  return (
    typeof pass.draw === 'function' && typeof pass.setBindGroup === 'function' && typeof pass.setPipeline === 'function'
  );
}

export interface SceneGPUTexture {
  /** A texture produces a typed view suitable for attachments and bindings. */
  createView(descriptor?: { format?: string }): SceneGPUTextureView;
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
  now(): number;
  captureImageBitmap(source: ImageBitmap): Promise<ImageBitmap>;
  /** Yields open-ended CPU preparation so rendering and input can proceed. */
  yieldForPreparation(): Promise<void>;
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
  now: () => performance.now(),
  captureImageBitmap: source => globalThis.createImageBitmap(source),
  yieldForPreparation
};

export const scenePlatform: ScenePlatform = { ...defaultScenePlatform };

let preparationChannel: MessageChannel | undefined;
const preparationYields: Array<() => void> = [];

export function restoreScenePlatform(): void {
  Object.assign(scenePlatform, defaultScenePlatform);
}

function yieldForPreparation(): Promise<void> {
  const scheduler = Reflect.get(globalThis, 'scheduler');
  if (isObject(scheduler)) {
    const yieldMethod = Reflect.get(scheduler, 'yield');
    if (typeof yieldMethod === 'function') {
      return Promise.resolve(Reflect.apply(yieldMethod, scheduler, [])).then(() => undefined);
    }
  }
  if (typeof globalThis.MessageChannel === 'function') return yieldWithMessageChannel();
  return new Promise(resolve => globalThis.setTimeout(resolve, 0));
}

function yieldWithMessageChannel(): Promise<void> {
  const channel = (preparationChannel ??= createPreparationChannel());
  return new Promise(resolve => {
    preparationYields.push(resolve);
    channel.port2.postMessage(undefined);
  });
}

function createPreparationChannel(): MessageChannel {
  const channel = new globalThis.MessageChannel();
  channel.port1.onmessage = () => preparationYields.shift()?.();
  return channel;
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
