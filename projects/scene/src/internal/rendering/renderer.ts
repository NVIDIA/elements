// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SharedDeviceLease } from '../gpu/device-manager.js';
import {
  getSrgbCanvasViewFormat,
  scenePlatform,
  type SceneGPUCanvasContext,
  type SceneGPUDevice,
  type SceneGPUQuerySet,
  type SceneGPURenderPassDescriptor,
  type SceneGPUTextureView,
  type SceneGPURenderPass,
  supportsSceneGeometryRendering
} from '../gpu/platform.js';
import type { PickScope, ScenePickRequest, ScenePickResult } from '../pick/routing.js';
import type { Matrix4, PreciseMat4 } from '../types.js';
import type { GeometryRenderer } from './geometry-renderer.js';
import { hasPickTargets, isInteractiveItem, isTransparentItem, type SceneRenderItem } from './render-items.js';
import type { CompletedGeometryPixel, PickRenderer } from './pick-renderer.js';
import type { LinearColor, OitResources, RenderTargets } from './render-targets.js';

export type {
  LineRenderItem,
  LabelRenderItem,
  MarkerRenderItem,
  MeshRenderItem,
  PointRenderItem,
  SceneRenderItem,
  TriangleRenderItem
} from './render-items.js';
interface PreparedFrame {
  readonly colorView: SceneGPUTextureView;
  readonly depthView: SceneGPUTextureView | null;
  readonly device: SceneGPUDevice;
  readonly encoder: ReturnType<SceneGPUDevice['createCommandEncoder']>;
  readonly items: readonly SceneRenderItem[];
  readonly oit?: OitResources;
}

interface SubmittedProjectionSnapshot {
  readonly canvas: HTMLCanvasElement;
  readonly cssHeight: number;
  readonly cssWidth: number;
  readonly deviceHeight: number;
  readonly deviceWidth: number;
  readonly projection: PreciseMat4;
}

export class SceneRenderer {
  #canvas?: HTMLCanvasElement;
  #clearColor: LinearColor = { r: 0, g: 0, b: 0, a: 0 };
  #clearColorSource?: string;
  #context?: SceneGPUCanvasContext;
  #device?: SceneGPUDevice;
  #frameGeneration = 0;
  #frameItems: readonly SceneRenderItem[] = [];
  #interactiveFrameItems: SceneRenderItem[] = [];
  #frameProjection?: Matrix4;
  #hasSubmittedFrame = false;
  #initialFrameItems?: readonly SceneRenderItem[];
  #geometry?: GeometryRenderer;
  #picking?: PickRenderer;
  #pickingLoad?: Promise<PickRenderer | undefined>;
  #renderFormat?: string;
  #renderRequested = false;
  #renderingLoad?: Promise<void>;
  #renderingFailure?: unknown;
  #submittedProjection?: SubmittedProjectionSnapshot;
  #subsystemToken = 0;
  #targets?: RenderTargets;
  readonly #onRenderingFailure: (error: unknown) => void;
  readonly #wakeScene: () => void;

  constructor(wakeScene: () => void = () => undefined, onRenderingFailure: (error: unknown) => void = () => undefined) {
    this.#wakeScene = wakeScene;
    this.#onRenderingFailure = onRenderingFailure;
  }

  get active(): boolean {
    return this.#context !== undefined && this.#device !== undefined;
  }

  getCompletedGeometryPixel(pixelX: number, pixelY: number): CompletedGeometryPixel | undefined {
    return this.#picking?.getCompletedGeometryPixel(pixelX, pixelY);
  }

  getSubmittedProjection(): SubmittedProjectionSnapshot | null {
    const snapshot = this.#submittedProjection;
    const canvas = this.#canvas;
    if (!snapshot || !canvas || snapshot.canvas !== canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (
      canvas.width !== snapshot.deviceWidth ||
      canvas.height !== snapshot.deviceHeight ||
      rect.width !== snapshot.cssWidth ||
      rect.height !== snapshot.cssHeight
    )
      return null;
    return { ...snapshot, projection: new Float64Array(snapshot.projection) };
  }

  prefetchGeometryPixel(request: ScenePickRequest): Promise<void> {
    return this.pick(request).then(
      () => undefined,
      () => undefined
    );
  }

  async pick(request: ScenePickRequest, scope: PickScope = 'all'): Promise<ScenePickResult | null> {
    const items = scope === 'interactive' ? this.#interactiveFrameItems : this.#frameItems;
    if (!hasPickTargets(items)) return null;
    const [, picking] = await Promise.all([this.#loadGeometry(), this.#loadPicking(), this.#loadTargets()]);
    if (!picking) return null;
    picking.updateFrame({ frameGeneration: this.#frameGeneration, items, projection: this.#frameProjection, scope });
    return picking.pick(request);
  }

  consumeRenderRequest(): boolean {
    const requested = this.#renderRequested;
    this.#renderRequested = false;
    return requested;
  }

  initialize(canvas: HTMLCanvasElement, lease: SharedDeviceLease): void {
    const context = scenePlatform.getCanvasContext(canvas);
    if (!context) throw new DOMException('A WebGPU canvas context is unavailable.', 'NotSupportedError');
    if (this.#device) this.#disconnectSubsystems();
    const renderFormat = getSrgbCanvasViewFormat(lease.format);
    context.configure({
      device: lease.device,
      format: lease.format,
      alphaMode: 'premultiplied',
      colorSpace: 'srgb',
      viewFormats: [renderFormat]
    });
    this.#canvas = canvas;
    this.#context = context;
    this.#device = lease.device;
    this.#renderFormat = renderFormat;
  }

  disconnect(): void {
    this.#context?.unconfigure();
    this.#disconnectSubsystems();
    this.#canvas = undefined;
    this.#context = undefined;
    this.#device = undefined;
    this.#renderFormat = undefined;
    this.#renderRequested = false;
  }

  resize(width: number, height: number): boolean {
    const canvas = this.#canvas;
    if (!canvas) return false;
    const pixelWidth = normalizeCanvasDimension(width);
    const pixelHeight = normalizeCanvasDimension(height);
    if (canvas.width === pixelWidth && canvas.height === pixelHeight) return false;
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    this.#picking?.invalidateSize();
    this.#targets?.invalidateSize();
    return true;
  }

  setBackgroundColor(source: string): boolean {
    if (source === this.#clearColorSource) return false;
    this.#clearColorSource = source;
    this.#clearColor = parseComputedBackgroundColor(source);
    return true;
  }

  render(items: readonly SceneRenderItem[] = [], viewProjection?: Matrix4): boolean {
    const frame = this.#prepareFrame(items, viewProjection);
    if (!frame) return false;
    this.#encodeOpaquePass({ ...frame, usesOit: frame.oit !== undefined });
    if (frame.oit) this.#encodeTransparentPass({ ...frame, oit: frame.oit });
    this.#submitFrame(frame);
    this.#hasSubmittedFrame = true;
    this.#initialFrameItems = undefined;
    this.#captureSubmittedProjection();
    return true;
  }

  #prepareFrame(items: readonly SceneRenderItem[], viewProjection: Matrix4 | undefined): PreparedFrame | undefined {
    const context = this.#context;
    const device = this.#device;
    if (!context || !device) return undefined;
    this.#initialFrameItems ??= items;
    const projection = this.#prepareGeometry(items, viewProjection);
    if (this.#isInitialGeometryPending(items, projection)) return undefined;
    const encoder = device.createCommandEncoder();
    this.#geometry?.encodeCompaction(encoder, items);
    const colorView = context.getCurrentTexture().createView({ format: this.#renderFormat });
    const { depthView, oit } = this.#prepareTargets(items);
    return { colorView, depthView, device, encoder, items, oit };
  }

  #isInitialGeometryPending(items: readonly SceneRenderItem[], projection: Matrix4 | undefined): boolean {
    const initialItems = this.#initialFrameItems ?? items;
    return (
      !this.#hasSubmittedFrame &&
      hasRequiredGeometry(initialItems) &&
      (!this.#geometry?.readyFor(initialItems, items) || !this.#targets || !projection)
    );
  }

  #prepareGeometry(items: readonly SceneRenderItem[], viewProjection: Matrix4 | undefined): Matrix4 | undefined {
    this.#frameGeneration += 1;
    this.#frameItems = items;
    this.#interactiveFrameItems.length = 0;
    for (const item of items) {
      if (isInteractiveItem(item)) this.#interactiveFrameItems.push(item);
    }
    this.#frameProjection = viewProjection;
    if (items.length > 0) {
      void this.#loadGeometry();
      void this.#loadTargets();
    }
    const projection = this.#geometry?.prepare(items, viewProjection) ?? viewProjection;
    this.#frameProjection = projection;
    this.#picking?.updateFrame({ frameGeneration: this.#frameGeneration, items, projection, scope: 'all' });
    return projection;
  }

  #prepareTargets(items: readonly SceneRenderItem[]): Pick<PreparedFrame, 'depthView' | 'oit'> {
    const depthView = this.#targets?.getDepthView() ?? null;
    const oit = items.some(isTransparentItem) ? this.#targets?.getOitResources() : undefined;
    return { depthView, oit };
  }

  #submitFrame(frame: PreparedFrame): void {
    frame.device.queue.submit([frame.encoder.finish()]);
  }

  #captureSubmittedProjection(): void {
    const canvas = this.#canvas;
    const projection = this.#frameProjection;
    if (!canvas || !projection || canvas.width <= 0 || canvas.height <= 0) {
      this.#submittedProjection = undefined;
      return;
    }
    const rect = this.#geometry?.getPreparedCssViewport() ?? canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      this.#submittedProjection = undefined;
      return;
    }
    this.#submittedProjection = {
      canvas,
      cssHeight: rect.height,
      cssWidth: rect.width,
      deviceHeight: canvas.height,
      deviceWidth: canvas.width,
      projection: new Float64Array(projection)
    };
  }

  #encodeOpaquePass(options: {
    readonly colorView: SceneGPUTextureView;
    readonly depthView: SceneGPUTextureView | null;
    readonly encoder: ReturnType<SceneGPUDevice['createCommandEncoder']>;
    readonly items: readonly SceneRenderItem[];
    readonly usesOit: boolean;
  }): void {
    const descriptorOptions = {
      clearColor: this.#clearColor,
      colorView: options.colorView,
      depthView: options.depthView
    };
    const descriptor =
      this.#targets?.createOpaquePassDescriptor(descriptorOptions) ?? createOpaquePassDescriptor(descriptorOptions);
    const pass = options.encoder.beginRenderPass(descriptor);
    this.#geometry?.drawItems(pass, options.items, false);
    pass.end();
  }

  #encodeTransparentPass(options: {
    readonly colorView: SceneGPUTextureView;
    readonly depthView: SceneGPUTextureView | null;
    readonly encoder: ReturnType<SceneGPUDevice['createCommandEncoder']>;
    readonly items: readonly SceneRenderItem[];
    readonly oit: OitResources;
  }): void {
    const targets = this.#targets;
    if (!targets) return;
    const transparentPass = options.encoder.beginRenderPass(
      targets.createOitPassDescriptor(options.oit, options.depthView)
    );
    this.#geometry?.drawItems(transparentPass, options.items, true);
    transparentPass.end();
    const compositePass = options.encoder.beginRenderPass(
      targets.createCompositePassDescriptor({
        colorView: options.colorView,
        depthView: options.depthView
      })
    );
    targets.drawComposite(compositePass, options.oit);
    compositePass.end();
  }

  #loadGeometry(): Promise<GeometryRenderer | undefined> {
    if (this.#geometry) return Promise.resolve(this.#geometry);
    return this.#loadRenderingSubsystems().then(() => this.#geometry);
  }

  #loadPicking(): Promise<PickRenderer | undefined> {
    if (this.#picking) return Promise.resolve(this.#picking);
    if (this.#pickingLoad) return this.#pickingLoad;
    const resources = this.#getResourceContext();
    if (!resources) return Promise.resolve(undefined);
    this.#pickingLoad = import('./pick-renderer.js')
      .then(({ PickRenderer }) => {
        if (!this.#isResourceContextCurrent(resources)) return undefined;
        const picking = new PickRenderer({
          draw: {
            drawPickItems: (pass, items, pipelines) =>
              this.#geometry?.drawPickItems(pass as SceneGPURenderPass, items, pipelines)
          },
          getDepthView: () => this.#targets?.getDepthView() ?? null
        });
        picking.initialize(
          resources.canvas,
          supportsSceneGeometryRendering(resources.device) ? resources.device : undefined
        );
        picking.updateFrame({
          frameGeneration: this.#frameGeneration,
          items: this.#frameItems,
          projection: this.#frameProjection,
          scope: 'all'
        });
        this.#picking = picking;
        return picking;
      })
      .catch(() => undefined)
      .finally(() => {
        if (resources.token === this.#subsystemToken) this.#pickingLoad = undefined;
      });
    return this.#pickingLoad;
  }

  #loadTargets(): Promise<RenderTargets | undefined> {
    if (this.#targets) return Promise.resolve(this.#targets);
    return this.#loadRenderingSubsystems().then(() => this.#targets);
  }

  #loadRenderingSubsystems(): Promise<void> {
    if (this.#geometry && this.#targets) return Promise.resolve();
    if (this.#renderingLoad) return this.#renderingLoad;
    const resources = this.#getResourceContext();
    if (!resources) return Promise.resolve();
    this.#renderingLoad = Promise.all([import('./geometry-renderer.js'), import('./render-targets.js')])
      .then(([{ GeometryRenderer }, { RenderTargets }]) => {
        if (!this.#isResourceContextCurrent(resources)) return;
        const geometry = new GeometryRenderer(
          () => this.#requestRender(),
          error => this.#reportRenderingFailure(error)
        );
        const targets = new RenderTargets();
        geometry.initialize(resources.canvas, resources.device, resources.format);
        targets.initialize(resources.canvas, resources.device, resources.format);
        if (hasRequiredGeometry(this.#initialFrameItems ?? this.#frameItems) && !geometry.active) {
          throw new DOMException('Scene geometry rendering is unavailable.', 'NotSupportedError');
        }
        this.#geometry = geometry;
        this.#targets = targets;
        this.#frameProjection = geometry.prepare(this.#frameItems, this.#frameProjection);
        geometry.readyFor(this.#initialFrameItems ?? this.#frameItems, this.#frameItems);
        this.#picking?.updateFrame({
          frameGeneration: this.#frameGeneration,
          items: this.#frameItems,
          projection: this.#frameProjection,
          scope: 'all'
        });
        this.#requestRender();
      })
      .catch(error => {
        if (this.#isResourceContextCurrent(resources)) this.#reportRenderingFailure(error);
      })
      .finally(() => {
        if (resources.token === this.#subsystemToken) this.#renderingLoad = undefined;
      });
    return this.#renderingLoad;
  }

  #getResourceContext():
    | {
        readonly canvas: HTMLCanvasElement;
        readonly device: SceneGPUDevice;
        readonly format: string;
        readonly token: number;
      }
    | undefined {
    const canvas = this.#canvas;
    const device = this.#device;
    const format = this.#renderFormat;
    return canvas && device && format ? { canvas, device, format, token: this.#subsystemToken } : undefined;
  }

  #isResourceContextCurrent(resources: { readonly device: SceneGPUDevice; readonly token: number }): boolean {
    return resources.token === this.#subsystemToken && resources.device === this.#device;
  }

  #disconnectSubsystems(): void {
    this.#subsystemToken += 1;
    this.#disconnectPicking();
    this.#disconnectGeometry();
    this.#disconnectTargets();
    this.#frameGeneration = 0;
    this.#frameItems = [];
    this.#interactiveFrameItems = [];
    this.#frameProjection = undefined;
    this.#hasSubmittedFrame = false;
    this.#initialFrameItems = undefined;
    this.#submittedProjection = undefined;
    this.#renderingFailure = undefined;
  }

  #disconnectPicking(): void {
    this.#pickingLoad = undefined;
    this.#picking?.disconnect();
    this.#picking = undefined;
  }

  #disconnectGeometry(): void {
    this.#renderingLoad = undefined;
    this.#geometry?.disconnect();
    this.#geometry = undefined;
  }

  #disconnectTargets(): void {
    this.#targets?.disconnect();
    this.#targets = undefined;
  }

  #requestRender(): void {
    if (this.#renderRequested) return;
    this.#renderRequested = true;
    this.#wakeScene();
  }

  #reportRenderingFailure(error: unknown): void {
    if (this.#renderingFailure !== undefined) return;
    this.#renderingFailure = error;
    this.#onRenderingFailure(error);
  }
}

export function parseComputedBackgroundColor(source: string): LinearColor {
  if (source === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  const channels = source.match(/[+-]?(?:\d+\.?\d*|\.\d+)/g)?.map(Number);
  if (!channels || !hasRGBChannels(channels) || channels.some(channel => !Number.isFinite(channel))) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  return {
    r: srgbToLinear(channels[0]),
    g: srgbToLinear(channels[1]),
    b: srgbToLinear(channels[2]),
    a: Math.min(1, Math.max(0, channels[3] ?? 1))
  };
}

function hasRGBChannels(channels: number[]): channels is [number, number, number, ...number[]] {
  return channels.length >= 3;
}

function srgbToLinear(channel: number): number {
  const normalized = Math.min(255, Math.max(0, channel)) / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function normalizeCanvasDimension(value: number): number {
  return Math.max(1, Math.round(Number.isFinite(value) ? value : 1));
}

function createOpaquePassDescriptor(options: {
  readonly clearColor: LinearColor;
  readonly colorView: SceneGPUTextureView;
  readonly depthView: SceneGPUTextureView | null;
  readonly occlusionQuerySet?: SceneGPUQuerySet;
}): SceneGPURenderPassDescriptor {
  const descriptor: {
    colorAttachments: readonly [
      {
        readonly clearValue: LinearColor;
        readonly loadOp: 'clear';
        readonly storeOp: 'store';
        readonly view: SceneGPUTextureView;
      }
    ];
    depthStencilAttachment?: SceneGPURenderPassDescriptor['depthStencilAttachment'];
    occlusionQuerySet?: SceneGPUQuerySet;
  } = {
    colorAttachments: [{ view: options.colorView, clearValue: options.clearColor, loadOp: 'clear', storeOp: 'store' }]
  };
  if (options.depthView) {
    descriptor.depthStencilAttachment = {
      view: options.depthView,
      depthClearValue: 1,
      depthLoadOp: 'clear',
      depthStoreOp: 'store'
    };
  }
  if (options.occlusionQuerySet) descriptor.occlusionQuerySet = options.occlusionQuerySet;
  return descriptor;
}

function hasRequiredGeometry(items: readonly SceneRenderItem[]): boolean {
  return items.some(item => {
    if (!item.data.ready) return false;
    if ('type' in item && item.type === 'mesh') {
      return item.data.identityInstance || (item.instances?.count ?? 0) > 0;
    }
    return item.data.count > 0;
  });
}
