// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SharedDeviceLease } from '../gpu/device-manager.js';
import {
  getSrgbCanvasViewFormat,
  scenePlatform,
  type SceneGPUCanvasContext,
  type SceneGPUDevice,
  type SceneGPURenderPass
} from '../gpu/platform.js';
import type { LabelTextureRenderer, LabelTextureRenderFrame, LabelTextureRenderItem } from '../label/renderer.js';
import type { PickScope, ScenePickRequest, ScenePickResult } from '../pick/routing.js';
import type { Mat4 } from '../types.js';
import type { GeometryDevice, GeometryRenderer } from './geometry-renderer.js';
import { hasPickTargets, isInteractiveItem, isTransparentItem, type SceneRenderItem } from './render-items.js';
import type { CompletedGeometryPixel, PickRenderer } from './pick-renderer.js';
import type { LinearColor, OitResources, RenderTargets } from './render-targets.js';

export type {
  LineRenderItem,
  MarkerRenderItem,
  MeshRenderItem,
  PointRenderItem,
  SceneRenderItem,
  TriangleRenderItem
} from './render-items.js';
interface PreparedFrame {
  readonly colorView: unknown;
  readonly depthView: unknown | null;
  readonly device: SceneGPUDevice;
  readonly encoder: ReturnType<SceneGPUDevice['createCommandEncoder']>;
  readonly items: readonly SceneRenderItem[];
  readonly labelFrame?: LabelTextureRenderFrame;
  readonly oit?: OitResources;
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
  #frameProjection?: Mat4;
  #geometry?: GeometryRenderer;
  #labelLoad?: Promise<void>;
  #labelRenderer?: LabelTextureRenderer;
  #labelToken = 0;
  #picking?: PickRenderer;
  #pickingLoad?: Promise<PickRenderer | undefined>;
  #renderFormat?: string;
  #renderRequested = false;
  #renderingLoad?: Promise<void>;
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

  render(
    items: readonly SceneRenderItem[] = [],
    viewProjection?: Mat4,
    labels: readonly LabelTextureRenderItem[] = []
  ): boolean {
    const frame = this.#prepareFrame(items, viewProjection, labels);
    if (!frame) return false;
    this.#encodeOpaquePass({ ...frame, usesOit: frame.oit !== undefined });
    if (frame.oit) this.#encodeTransparentPass({ ...frame, oit: frame.oit });
    this.#submitFrame(frame);
    return true;
  }

  #prepareFrame(
    items: readonly SceneRenderItem[],
    viewProjection: Mat4 | undefined,
    labels: readonly LabelTextureRenderItem[]
  ): PreparedFrame | undefined {
    const context = this.#context;
    const device = this.#device;
    if (!context || !device) return undefined;
    this.#prepareGeometry(items, viewProjection);
    this.#loadLabelRenderer(labels);
    const labelFrame = this.#labelRenderer?.beginFrame(labels);
    const encoder = device.createCommandEncoder();
    this.#geometry?.encodeCompaction(encoder, items);
    const colorView = context.getCurrentTexture().createView({ format: this.#renderFormat });
    const { depthView, oit } = this.#prepareTargets(items);
    return { colorView, depthView, device, encoder, items, labelFrame, oit };
  }

  #prepareGeometry(items: readonly SceneRenderItem[], viewProjection: Mat4 | undefined): Mat4 | undefined {
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
    if (frame.labelFrame) this.#labelRenderer?.resolveOcclusion(frame.encoder, frame.labelFrame);
    frame.device.queue.submit([frame.encoder.finish()]);
    if (frame.labelFrame) {
      this.#labelRenderer?.readOcclusion(frame.labelFrame);
    }
  }

  #encodeOpaquePass(options: {
    readonly colorView: unknown;
    readonly depthView: unknown | null;
    readonly encoder: ReturnType<SceneGPUDevice['createCommandEncoder']>;
    readonly items: readonly SceneRenderItem[];
    readonly labelFrame?: LabelTextureRenderFrame;
    readonly usesOit: boolean;
  }): void {
    const querySet = options.labelFrame && this.#labelRenderer?.getQuerySet(options.labelFrame);
    const descriptorOptions = {
      clearColor: this.#clearColor,
      colorView: options.colorView,
      depthView: options.depthView,
      occlusionQuerySet: querySet
    };
    const descriptor =
      this.#targets?.createOpaquePassDescriptor(descriptorOptions) ?? createOpaquePassDescriptor(descriptorOptions);
    const pass = options.encoder.beginRenderPass(descriptor);
    this.#geometry?.drawItems(pass, options.items, false);
    if (!options.usesOit && options.labelFrame) this.#labelRenderer?.draw(pass, options.labelFrame);
    pass.end();
  }

  #encodeTransparentPass(options: {
    readonly colorView: unknown;
    readonly depthView: unknown | null;
    readonly encoder: ReturnType<SceneGPUDevice['createCommandEncoder']>;
    readonly items: readonly SceneRenderItem[];
    readonly labelFrame?: LabelTextureRenderFrame;
    readonly oit: OitResources;
  }): void {
    const targets = this.#targets;
    if (!targets) return;
    const transparentPass = options.encoder.beginRenderPass(
      targets.createOitPassDescriptor(options.oit, options.depthView)
    );
    this.#geometry?.drawItems(transparentPass, options.items, true);
    transparentPass.end();
    const querySet = options.labelFrame && this.#labelRenderer?.getQuerySet(options.labelFrame);
    const compositePass = options.encoder.beginRenderPass(
      targets.createCompositePassDescriptor({
        colorView: options.colorView,
        depthView: options.depthView,
        occlusionQuerySet: querySet
      })
    );
    targets.drawComposite(compositePass, options.oit);
    if (options.labelFrame) this.#labelRenderer?.draw(compositePass, options.labelFrame);
    compositePass.end();
  }

  #loadLabelRenderer(labels: readonly LabelTextureRenderItem[]): void {
    if (this.#labelRenderer || this.#labelLoad || labels.length === 0) return;
    const device = this.#device;
    const format = this.#renderFormat;
    if (!device || !format || !supportsGeometryRendering(device)) return;
    void this.#loadTargets();
    const token = this.#labelToken;
    this.#labelLoad = import('../label/renderer.js')
      .then(({ LabelTextureRenderer, supportsLabelTextureRendering }) => {
        if (token === this.#labelToken && device === this.#device && supportsLabelTextureRendering(device)) {
          this.#labelRenderer = new LabelTextureRenderer(device, format);
          this.#requestRender();
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (token === this.#labelToken) this.#labelLoad = undefined;
      });
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
          supportsGeometryRendering(resources.device) ? resources.device : undefined
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
        const geometry = new GeometryRenderer(() => this.#requestRender());
        const targets = new RenderTargets();
        geometry.initialize(resources.canvas, resources.device, resources.format);
        targets.initialize(resources.canvas, resources.device, resources.format);
        this.#geometry = geometry;
        this.#targets = targets;
        this.#frameProjection = geometry.prepare(this.#frameItems, this.#frameProjection);
        this.#picking?.updateFrame({
          frameGeneration: this.#frameGeneration,
          items: this.#frameItems,
          projection: this.#frameProjection,
          scope: 'all'
        });
        this.#requestRender();
      })
      .catch(error => {
        if (this.#isResourceContextCurrent(resources)) this.#onRenderingFailure(error);
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
    this.#disconnectLabels();
    this.#disconnectGeometry();
    this.#disconnectTargets();
    this.#frameGeneration = 0;
    this.#frameItems = [];
    this.#interactiveFrameItems = [];
    this.#frameProjection = undefined;
  }

  #disconnectPicking(): void {
    this.#pickingLoad = undefined;
    this.#picking?.disconnect();
    this.#picking = undefined;
  }

  #disconnectLabels(): void {
    this.#labelToken += 1;
    this.#labelLoad = undefined;
    this.#labelRenderer?.disconnect();
    this.#labelRenderer = undefined;
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
  readonly colorView: unknown;
  readonly depthView: unknown | null;
  readonly occlusionQuerySet?: unknown;
}): unknown {
  const descriptor: Record<string, unknown> = {
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

function supportsGeometryRendering(device: SceneGPUDevice): device is GeometryDevice {
  return (
    typeof device.createBindGroup === 'function' &&
    typeof device.createBuffer === 'function' &&
    typeof device.createRenderPipeline === 'function' &&
    typeof device.createShaderModule === 'function' &&
    typeof device.createTexture === 'function' &&
    typeof device.queue.writeBuffer === 'function'
  );
}
