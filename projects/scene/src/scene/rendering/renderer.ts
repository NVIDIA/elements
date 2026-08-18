// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable max-lines -- Renderer owns shared GPU resources in one module. */

import { multiplyMat4 } from '../../internal/math/mat4.js';
import { getMarkerLayerMarker, isMarkerLayerRegistered } from '../../internal/marker/layer-state.js';
import { PickReadback, type PickReadbackDevice } from '../pick/readback.js';
import type { PickPixel } from '../pick/readback.js';
import type { ScenePickRequest, ScenePickResult } from '../pick/routing.js';
import type { MarkerLayerRenderData } from '../../internal/marker/layer-state.js';
import type { MeshRenderData } from '../../internal/mesh/layer-state.js';
import type { StreamingLayerRenderData as StreamLayerRenderData } from '../../internal/streaming-layer-state.js';
import type { PrimitiveKind } from '../../internal/primitive-geometry.js';
import { lineSegmentCount, type LineTopology, type LineWidthUnit } from '../../internal/line-data.js';
import type { PointSizeUnit } from '../../internal/point-data.js';
import type { SharedDeviceLease } from '../../internal/gpu/device-manager.js';
import type { LabelTextureRenderer, LabelTextureRenderFrame, LabelTextureRenderItem } from '../label/renderer.js';
import type { MarkerGeometry, MarkerPipelines } from '../rendering/marker/pipelines.js';
import type { MeshRenderer, MeshRendererDevice } from '../rendering/mesh/renderer.js';
import { PICK_UNIFORM_OFFSETS } from '../pick/uniform-offsets.js';
import type { PickPipelines } from '../pick/pipelines.js';
import type { StreamPipelines } from '../rendering/stream-pipelines.js';
import {
  createOitCompositePipeline,
  OIT_ACCUMULATION_FORMAT,
  OIT_REVEALAGE_FORMAT
} from '../rendering/transparency.js';
import type { Mat4, Vec3 } from '../../internal/types.js';
import {
  getSrgbCanvasViewFormat,
  scenePlatform,
  type SceneGPUBindGroup,
  type SceneGPUBuffer,
  type SceneGPUCanvasContext,
  type SceneGPUDevice,
  type SceneGPUQueue,
  type SceneGPURenderPass,
  type SceneGPURenderPipeline,
  type SceneGPUTexture
} from '../../internal/gpu/platform.js';

interface LinearColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

/** A completed geometry ID/depth sample retained for depth-aware label input. */
interface CompletedGeometryPixel extends PickPixel {
  readonly pixelX: number;
  readonly pixelY: number;
}

export interface MarkerRenderItem {
  readonly data: MarkerLayerRenderData;
  readonly frameMatrix: Mat4;
  readonly layer: HTMLElement;
}

export interface PointRenderItem {
  readonly data: StreamLayerRenderData;
  readonly frameMatrix: Mat4;
  readonly layer: HTMLElement;
  /** CSS pixels or world units, as selected by sizeUnit. */
  readonly size: number;
  readonly sizeUnit: PointSizeUnit;
  readonly type: 'point';
}

export interface LineRenderItem {
  readonly data: StreamLayerRenderData;
  readonly frameMatrix: Mat4;
  readonly layer: HTMLElement;
  readonly topology: LineTopology;
  readonly type: 'line';
  readonly widthUnit: LineWidthUnit;
}

export interface TriangleRenderItem {
  readonly data: StreamLayerRenderData;
  readonly frameMatrix: Mat4;
  readonly layer: HTMLElement;
  readonly type: 'triangle';
}

/** A mesh keeps geometry planar until the lazy mesh renderer uploads it. */
export interface MeshRenderItem {
  readonly data: MeshRenderData;
  readonly frameMatrix: Mat4;
  readonly instances: MarkerLayerRenderData | undefined;
  readonly layer: HTMLElement;
  readonly type: 'mesh';
}

export type SceneRenderItem = MarkerRenderItem | PointRenderItem | LineRenderItem | TriangleRenderItem | MeshRenderItem;

interface GeometryDevice extends SceneGPUDevice {
  readonly queue: SceneGPUQueue & { writeBuffer(buffer: SceneGPUBuffer, offset: number, data: ArrayBufferView): void };
  createBindGroup(descriptor: unknown): SceneGPUBindGroup;
  createBuffer(descriptor: unknown): SceneGPUBuffer;
  createRenderPipeline(descriptor: unknown): SceneGPURenderPipeline;
  createShaderModule(descriptor: unknown): unknown;
  createTexture(descriptor: unknown): SceneGPUTexture;
}

interface GeometryResources {
  readonly index: SceneGPUBuffer;
  readonly indexCount: number;
  readonly outlineIndex?: SceneGPUBuffer;
  readonly outlineIndexCount?: number;
  readonly outlineVertex?: SceneGPUBuffer;
  readonly vertex: SceneGPUBuffer;
}

interface OitResources {
  readonly accumulation: SceneGPUTexture;
  readonly bindGroup: SceneGPUBindGroup;
  readonly revealage: SceneGPUTexture;
}

interface LayerResources {
  readonly instance: SceneGPUBuffer;
  readonly instanceBytes: number;
  readonly uniform: SceneGPUBuffer;
}

interface RenderPipelines {
  readonly opaque: SceneGPURenderPipeline;
  readonly transparent: SceneGPURenderPipeline;
}

/** Immutable render state used by one asynchronous on-demand pick pass. */
interface PickFrameSnapshot {
  readonly canvas: HTMLCanvasElement;
  readonly device: GeometryDevice;
  readonly generation: number;
  readonly frameGeneration: number;
  readonly height: number;
  readonly items: readonly SceneRenderItem[];
  readonly projection: Mat4;
  readonly width: number;
}

interface CachedGeometryPixel extends CompletedGeometryPixel {
  readonly frameGeneration: number;
}

type PickSnapshotStatus = 'current' | 'frame-changed' | 'unavailable';

interface GeometryPass extends SceneGPURenderPass {
  draw(vertexCount: number, instanceCount?: number): void;
  drawIndexed(indexCount: number, instanceCount?: number): void;
  setBindGroup(index: number, bindGroup: SceneGPUBindGroup): void;
  setIndexBuffer(buffer: SceneGPUBuffer, indexFormat: 'uint32'): void;
  setPipeline(pipeline: SceneGPURenderPipeline): void;
  setVertexBuffer(slot: number, buffer: SceneGPUBuffer): void;
}

const BUFFER_COPY_DST = 0x08;
const BUFFER_INDEX = 0x10;
const BUFFER_VERTEX = 0x20;
const BUFFER_UNIFORM = 0x40;
const BUFFER_STORAGE = 0x80;
const TEXTURE_RENDER_ATTACHMENT = 0x10;
const TEXTURE_COPY_SRC = 0x01;
const TEXTURE_BINDING = 0x04;
const PICK_FRAME_CHANGED = Symbol('pick-frame-changed');
const PICK_ATTEMPTS = 2;
const renderersByScene = new WeakMap<HTMLElement, SceneRenderer>();

export function registerSceneRenderer(scene: HTMLElement, renderer: SceneRenderer): void {
  renderersByScene.set(scene, renderer);
}

export function getSceneInstanceUploadCount(scene: HTMLElement): number {
  return renderersByScene.get(scene)?.instanceUploadCount ?? 0;
}

export function getSceneMeshUploadSnapshot(scene: HTMLElement): {
  rebuilds: number;
  uploads: number;
} {
  const renderer = renderersByScene.get(scene);
  return {
    rebuilds: renderer?.meshRebuildCount ?? 0,
    uploads: renderer?.meshUploadCount ?? 0
  };
}

export class SceneRenderer {
  #canvas?: HTMLCanvasElement;
  #clearColor: LinearColor = { r: 0, g: 0, b: 0, a: 0 };
  #clearColorSource?: string;
  #context?: SceneGPUCanvasContext;
  #depthSize = '';
  #depthTexture?: SceneGPUTexture;
  #lastItems: readonly SceneRenderItem[] = [];
  #latestGeometryPixels = new Map<string, CachedGeometryPixel>();
  #lastProjection?: Mat4;
  #pickDepthTexture?: SceneGPUTexture;
  #pickIdTexture?: SceneGPUTexture;
  #pickLoad?: Promise<void>;
  #pickPipelines?: PickPipelines;
  #pickFrameGeneration = 0;
  #pickToken = 0;
  #pickResourceGeneration = 0;
  #device?: SceneGPUDevice;
  #renderFormat?: string;
  #geometries = new Map<PrimitiveKind, GeometryResources>();
  #geometryDevice?: GeometryDevice;
  #instanceUploadCount = 0;
  #layers = new Map<HTMLElement, LayerResources>();
  #labelLoad?: Promise<void>;
  #labelRenderer?: LabelTextureRenderer;
  #labelToken = 0;
  #markerLoad?: Promise<void>;
  #createMarkerGeometry?: (kind: PrimitiveKind) => MarkerGeometry;
  #markerPipelines?: MarkerPipelines;
  #oitAccumulationTexture?: SceneGPUTexture;
  #oitBindGroup?: SceneGPUBindGroup;
  #oitCompositePipeline?: SceneGPURenderPipeline;
  #oitRevealageTexture?: SceneGPUTexture;
  #oitSize = '';
  #meshLoad?: Promise<void>;
  #meshRenderer?: MeshRenderer;
  #meshToken = 0;
  #renderRequested = false;
  #streamLoad?: Promise<void>;
  #streamPipelines?: StreamPipelines;
  #streamToken = 0;

  get active(): boolean {
    return this.#context !== undefined && this.#device !== undefined;
  }

  get instanceUploadCount(): number {
    return this.#instanceUploadCount;
  }

  get meshRebuildCount(): number {
    return this.#meshRenderer?.rebuildCount ?? 0;
  }
  get meshUploadCount(): number {
    return this.#meshRenderer?.uploadCount ?? 0;
  }

  /**
   * Returns a normalized-depth geometry result from this or the immediately
   * preceding rendered frame. Callers compare `depth < labelDepth` to decide
   * whether geometry sits in front of a texture label. A missing result must
   * favor the label.
   */
  getCompletedGeometryPixel(pixelX: number, pixelY: number): CompletedGeometryPixel | undefined {
    const key = geometryPixelKey(pixelX, pixelY);
    const cached = this.#latestGeometryPixels.get(key);
    if (!cached) return undefined;
    if (this.#pickFrameGeneration - cached.frameGeneration > 1) {
      this.#latestGeometryPixels.delete(key);
      return undefined;
    }
    const { frameGeneration: _frameGeneration, ...pixel } = cached;
    return pixel;
  }

  /**
   * Starts an internal ID/depth sample without dispatching any Scene events.
   * This lets Scene warm the pointer-location cache before a label pointerdown.
   */
  prefetchGeometryPixel(request: ScenePickRequest): Promise<void> {
    return this.pick(request).then(
      () => undefined,
      () => undefined
    );
  }

  /** Starts an asynchronous aligned ID/depth readback for the latest stable rendered frame. */
  async pick(request: ScenePickRequest): Promise<ScenePickResult | null> {
    for (let attempt = 0; attempt < PICK_ATTEMPTS; attempt += 1) {
      const result = await this.#pickFrame(request);
      if (result !== PICK_FRAME_CHANGED) {
        return result;
      }
    }
    throw new DOMException('The scene changed while picking.', 'AbortError');
  }

  // eslint-disable-next-line complexity, max-statements -- Readback needs explicit lifecycle and canvas bounds guards.
  async #pickFrame(request: ScenePickRequest): Promise<ScenePickResult | null | typeof PICK_FRAME_CHANGED> {
    const snapshot = this.#createPickSnapshot(request);
    if (!snapshot) {
      return null;
    }
    const targets = createPickTargets(snapshot.items);
    const inverseViewProjection = invertMat4(snapshot.projection);
    const textures = this.#getPickTextures(snapshot);
    if (targets.length === 0 || !inverseViewProjection || !textures) return null;
    snapshot.device.pushErrorScope?.('validation');
    try {
      await this.#loadPickPipelines();
      if (!this.#pickPipelines) return null;
      const readyStatus = this.#getPickSnapshotStatus(snapshot);
      if (readyStatus !== 'current') return readyStatus === 'frame-changed' ? PICK_FRAME_CHANGED : null;
      const encoder = snapshot.device.createCommandEncoder();
      const pass = encoder.beginRenderPass(this.#createPickPassDescriptor(textures));
      this.#drawPickItems(pass, snapshot.items);
      pass.end();
      const result = new PickReadback<ScenePickResult>(snapshot.device as PickReadbackDevice).copy({
        encoder,
        frame: { inverseViewProjection, targets },
        onPixel: sample =>
          this.#storeCompletedGeometryPixel({ pixelX: request.pixelX, pixelY: request.pixelY, sample, snapshot }),
        pixel: { x: request.pixelX, y: request.pixelY },
        size: { height: snapshot.height, width: snapshot.width },
        textures
      });
      snapshot.device.queue.submit([encoder.finish()]);
      const hit = await result;
      const completedStatus = this.#getPickSnapshotStatus(snapshot);
      if (completedStatus !== 'current') return completedStatus === 'frame-changed' ? PICK_FRAME_CHANGED : null;
      return hit === null ? null : { ...hit.target, worldPosition: hit.worldPosition as Vec3 };
    } catch (error) {
      const failedStatus = this.#getPickSnapshotStatus(snapshot);
      if (failedStatus !== 'current') return failedStatus === 'frame-changed' ? PICK_FRAME_CHANGED : null;
      throw error;
    } finally {
      this.#reportValidationError(snapshot.device.popErrorScope?.());
    }
  }

  #createPickSnapshot(request: ScenePickRequest): PickFrameSnapshot | undefined {
    const device = this.#geometryDevice;
    const canvas = this.#canvas;
    const projection = this.#lastProjection;
    if (!device || !canvas || request.canvas !== canvas || !projection || !device.createBuffer) return undefined;
    const { width, height } = canvas;
    if (request.pixelX < 0 || request.pixelY < 0 || request.pixelX >= width || request.pixelY >= height)
      return undefined;
    return {
      canvas,
      device,
      generation: this.#pickResourceGeneration,
      frameGeneration: this.#pickFrameGeneration,
      height,
      items: this.#lastItems,
      projection,
      width
    };
  }

  #isPickSnapshotCurrent(snapshot: PickFrameSnapshot): boolean {
    return this.#getPickSnapshotStatus(snapshot) === 'current';
  }

  #getPickSnapshotStatus(snapshot: PickFrameSnapshot): PickSnapshotStatus {
    if (
      snapshot.generation !== this.#pickResourceGeneration ||
      snapshot.canvas !== this.#canvas ||
      snapshot.device !== this.#geometryDevice ||
      snapshot.width !== snapshot.canvas.width ||
      snapshot.height !== snapshot.canvas.height
    ) {
      return 'unavailable';
    }
    return snapshot.frameGeneration === this.#pickFrameGeneration ? 'current' : 'frame-changed';
  }

  consumeRenderRequest(): boolean {
    const requested = this.#renderRequested;
    this.#renderRequested = false;
    return requested;
  }

  // eslint-disable-next-line max-statements -- Device replacement explicitly retires every renderer-owned resource.
  initialize(canvas: HTMLCanvasElement, lease: SharedDeviceLease): void {
    const context = scenePlatform.getCanvasContext(canvas);
    if (!context) {
      throw new DOMException('A WebGPU canvas context is unavailable.', 'NotSupportedError');
    }
    if (this.#device) this.#destroyGeometryResources();
    this.#resetDeferredPipelines();
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
    this.#geometryDevice = undefined;
    this.#oitCompositePipeline = undefined;
    if (supportsGeometryRendering(lease.device)) {
      this.#geometryDevice = lease.device;
      this.#oitCompositePipeline = createOitCompositePipeline(lease.device, renderFormat);
    }
  }

  // eslint-disable-next-line max-statements -- Resetting independently lazy renderer resources must be explicit.
  disconnect(): void {
    this.#context?.unconfigure();
    this.#destroyGeometryResources();
    this.#canvas = undefined;
    this.#context = undefined;
    this.#device = undefined;
    this.#renderFormat = undefined;
    this.#geometryDevice = undefined;
    this.#markerPipelines = undefined;
    this.#oitCompositePipeline = undefined;
    this.#markerLoad = undefined;
    this.#createMarkerGeometry = undefined;
    this.#streamPipelines = undefined;
    this.#streamLoad = undefined;
    this.#meshLoad = undefined;
    this.#meshRenderer = undefined;
    this.#meshToken += 1;
    this.#pickLoad = undefined;
    this.#pickPipelines = undefined;
    this.#pickToken += 1;
    this.#pickResourceGeneration += 1;
    this.#streamToken += 1;
    this.#latestGeometryPixels.clear();
    this.#renderRequested = false;
  }

  resize(width: number, height: number): boolean {
    if (!this.#canvas) {
      return false;
    }
    const pixelWidth = normalizeCanvasDimension(width);
    const pixelHeight = normalizeCanvasDimension(height);
    if (this.#canvas.width === pixelWidth && this.#canvas.height === pixelHeight) {
      return false;
    }
    this.#canvas.width = pixelWidth;
    this.#canvas.height = pixelHeight;
    this.#destroyDepthTexture();
    return true;
  }

  setBackgroundColor(source: string): boolean {
    if (source === this.#clearColorSource) {
      return false;
    }
    this.#clearColorSource = source;
    this.#clearColor = parseComputedBackgroundColor(source);
    return true;
  }

  // eslint-disable-next-line max-statements, complexity -- Rendering updates the current frame snapshot and shared GPU resources together.
  render(
    items: readonly SceneRenderItem[] = [],
    viewProjection?: Mat4,
    labels: readonly LabelTextureRenderItem[] = []
  ): boolean {
    if (!this.#context || !this.#device) {
      return false;
    }
    this.#pickFrameGeneration += 1;
    this.#lastItems = items;
    this.#prepareGeometry(items, viewProjection);
    this.#loadMarkerPipelines(items);
    this.#loadStreamPipelines(items);
    this.#loadMeshPipelines(items);
    this.#loadLabelRenderer(labels);
    const labelFrame = this.#labelRenderer?.beginFrame(labels);
    const encoder = this.#device.createCommandEncoder();
    this.#device.pushErrorScope?.('validation');
    const colorView = this.#context.getCurrentTexture().createView({ format: this.#renderFormat });
    const depthView = this.#getDepthView();
    const oit = items.some(isTransparentItem) ? this.#getOitResources() : undefined;
    const opaquePass = encoder.beginRenderPass(
      this.#createOpaquePassDescriptor(colorView, depthView, oit ? undefined : labelFrame)
    );
    this.#drawItems(opaquePass, items, false);
    if (!oit && labelFrame) this.#labelRenderer?.draw(opaquePass, labelFrame);
    opaquePass.end();
    if (oit) {
      const transparentPass = encoder.beginRenderPass(this.#createOitPassDescriptor(oit, depthView));
      this.#drawItems(transparentPass, items, true);
      transparentPass.end();
      const compositePass = encoder.beginRenderPass(
        this.#createCompositePassDescriptor(colorView, depthView, labelFrame)
      );
      this.#drawOitComposite(compositePass, oit);
      if (labelFrame) this.#labelRenderer?.draw(compositePass, labelFrame);
      compositePass.end();
    }
    if (labelFrame) this.#labelRenderer?.resolveOcclusion(encoder, labelFrame);
    this.#device.queue.submit([encoder.finish()]);
    if (labelFrame) {
      this.#labelRenderer?.readOcclusion(labelFrame);
      this.#labelRenderer?.afterSubmission();
    }
    this.#reportValidationError(this.#device.popErrorScope?.());
    return true;
  }

  #reportValidationError(errorScope: Promise<unknown | null> | undefined): void {
    if (!errorScope) return;
    void errorScope
      .then(error => {
        if (error) console.error('Scene WebGPU validation error.', getValidationErrorMessage(error));
      })
      .catch(() => undefined);
  }

  #createOpaquePassDescriptor(
    colorView: unknown,
    depthView: unknown | null,
    labelFrame?: LabelTextureRenderFrame
  ): unknown {
    const descriptor: Record<string, unknown> = {
      colorAttachments: [
        {
          view: colorView,
          clearValue: this.#clearColor,
          loadOp: 'clear',
          storeOp: 'store'
        }
      ]
    };
    if (depthView) {
      descriptor.depthStencilAttachment = {
        view: depthView,
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'store'
      };
    }
    const querySet = labelFrame && this.#labelRenderer?.getQuerySet(labelFrame);
    if (querySet) descriptor.occlusionQuerySet = querySet;
    return descriptor;
  }

  #createOitPassDescriptor(oit: OitResources, depthView: unknown | null): unknown {
    const descriptor: Record<string, unknown> = {
      colorAttachments: [
        {
          view: oit.accumulation.createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store'
        },
        {
          view: oit.revealage.createView(),
          clearValue: { r: 1, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store'
        }
      ]
    };
    if (depthView) {
      descriptor.depthStencilAttachment = {
        view: depthView,
        depthLoadOp: 'load',
        depthStoreOp: 'store'
      };
    }
    return descriptor;
  }

  #createCompositePassDescriptor(
    colorView: unknown,
    depthView: unknown | null,
    labelFrame?: LabelTextureRenderFrame
  ): unknown {
    const descriptor: Record<string, unknown> = {
      colorAttachments: [{ view: colorView, loadOp: 'load', storeOp: 'store' }]
    };
    if (depthView) {
      descriptor.depthStencilAttachment = {
        view: depthView,
        depthLoadOp: 'load',
        depthStoreOp: 'store'
      };
    }
    const querySet = labelFrame && this.#labelRenderer?.getQuerySet(labelFrame);
    if (querySet) descriptor.occlusionQuerySet = querySet;
    return descriptor;
  }

  #getDepthView(): unknown | null {
    if (!this.#geometryDevice || !this.#canvas) {
      return null;
    }
    const size = `${this.#canvas.width}x${this.#canvas.height}`;
    if (!this.#depthTexture || this.#depthSize !== size) {
      this.#destroyDepthTexture();
      this.#depthTexture = this.#geometryDevice.createTexture({
        size: [this.#canvas.width, this.#canvas.height],
        format: 'depth24plus',
        usage: TEXTURE_RENDER_ATTACHMENT
      });
      this.#depthSize = size;
    }
    return this.#depthTexture.createView();
  }

  #getOitResources(): OitResources | undefined {
    const device = this.#geometryDevice;
    const canvas = this.#canvas;
    const pipeline = this.#oitCompositePipeline;
    if (!device || !canvas || !pipeline) return undefined;
    const size = `${canvas.width}x${canvas.height}`;
    if (!this.#oitAccumulationTexture || !this.#oitRevealageTexture || this.#oitSize !== size) {
      this.#destroyOitTargets();
      this.#oitAccumulationTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: OIT_ACCUMULATION_FORMAT,
        usage: TEXTURE_RENDER_ATTACHMENT | TEXTURE_BINDING
      });
      this.#oitRevealageTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: OIT_REVEALAGE_FORMAT,
        usage: TEXTURE_RENDER_ATTACHMENT | TEXTURE_BINDING
      });
      this.#oitBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: this.#oitAccumulationTexture.createView() },
          { binding: 1, resource: this.#oitRevealageTexture.createView() }
        ]
      });
      this.#oitSize = size;
    }
    if (!this.#oitAccumulationTexture || !this.#oitRevealageTexture || !this.#oitBindGroup) return undefined;
    return {
      accumulation: this.#oitAccumulationTexture,
      bindGroup: this.#oitBindGroup,
      revealage: this.#oitRevealageTexture
    };
  }

  #prepareGeometry(items: readonly SceneRenderItem[], viewProjection?: Mat4): void {
    if (!this.#geometryDevice || !this.#canvas) {
      return;
    }
    this.#pruneLayerResources(items);
    const projection = viewProjection ?? createDefaultViewProjection(this.#canvas.width / this.#canvas.height);
    this.#lastProjection = projection;
    for (const item of items) {
      this.#prepareItem(item, projection);
    }
  }

  #pruneLayerResources(items: readonly SceneRenderItem[]): void {
    const liveLayers = new Set(items.map(item => item.layer));
    for (const [layer, resources] of this.#layers) {
      if (!liveLayers.has(layer)) {
        destroyLayerResources(resources);
        this.#layers.delete(layer);
      }
    }
    this.#meshRenderer?.prune(liveLayers);
  }

  #prepareItem(item: SceneRenderItem, projection: Float32Array): void {
    if (isMeshRenderItem(item)) {
      this.#meshRenderer?.prepare(item, projection);
      return;
    }
    const bytes = item.data.bytes;
    if (!this.#geometryDevice || !bytes || !item.data.ready || bytes.byteLength === 0) {
      return;
    }
    if (isMarkerRenderItem(item)) {
      this.#ensureGeometry(item.data.kind);
    }
    const resources = this.#ensureLayerResources(item);
    this.#writeLayerUniforms(resources.uniform, item, projection);
  }

  #writeLayerUniforms(buffer: SceneGPUBuffer, item: SceneRenderItem, projection: Float32Array): void {
    const uniforms = new Float32Array(40);
    uniforms.set(projection, 0);
    uniforms.set(item.frameMatrix, 16);
    if (!isMarkerRenderItem(item) && !isMeshRenderItem(item)) {
      this.#writeStreamUniforms(uniforms, item);
    }
    this.#geometryDevice?.queue.writeBuffer(buffer, 0, uniforms);
  }

  #writeStreamUniforms(uniforms: Float32Array, item: PointRenderItem | LineRenderItem | TriangleRenderItem): void {
    const canvas = this.#canvas;
    uniforms[32] = this.#canvasPixelRatio();
    uniforms[33] = canvas?.width ?? 1;
    uniforms[34] = canvas?.height ?? 1;
    uniforms[35] = getStreamSize(item);
    uniforms[36] = item.data.count;
    uniforms[37] = item.type === 'line' ? topologyUniform(item.topology) : 0;
    uniforms[38] =
      (item.type === 'point' && item.sizeUnit === 'world') || (item.type === 'line' && item.widthUnit === 'world')
        ? 1
        : 0;
  }

  #canvasPixelRatio(): number {
    if (!this.#canvas) {
      return 1;
    }
    const cssWidth = this.#canvas.getBoundingClientRect().width;
    return cssWidth > 0 ? this.#canvas.width / cssWidth : 1;
  }

  #ensureGeometry(kind: PrimitiveKind): GeometryResources | undefined {
    if (!this.#geometryDevice) {
      return undefined;
    }
    const existing = this.#geometries.get(kind);
    if (existing) {
      return existing;
    }
    const geometry = this.#createMarkerGeometry?.(kind);
    if (!geometry) {
      return undefined;
    }
    const vertex = createUploadedGeometryBuffer(this.#geometryDevice, geometry.vertices, BUFFER_VERTEX);
    const index = createUploadedGeometryBuffer(this.#geometryDevice, geometry.indices, BUFFER_INDEX);
    const outlineVertex = geometry.outlineVertices
      ? createUploadedGeometryBuffer(this.#geometryDevice, geometry.outlineVertices, BUFFER_VERTEX)
      : undefined;
    const outlineIndex = geometry.outlineIndices
      ? createUploadedGeometryBuffer(this.#geometryDevice, geometry.outlineIndices, BUFFER_INDEX)
      : undefined;
    const resources = {
      index,
      indexCount: geometry.indices.length,
      outlineIndex,
      outlineIndexCount: geometry.outlineIndices?.length,
      outlineVertex,
      vertex
    };
    this.#geometries.set(kind, resources);
    return resources;
  }

  #ensureLayerResources(item: SceneRenderItem): LayerResources {
    const device = this.#geometryDevice;
    const bytes = item.data.bytes;
    if (!device || !bytes) {
      throw new TypeError('Marker geometry resources are unavailable.');
    }
    let resources = this.#layers.get(item.layer);
    if (!resources || resources.instanceBytes !== bytes.byteLength) {
      resources = this.#replaceLayerResources({ bytes, device, layer: item.layer, resources });
      return resources;
    }
    for (const range of item.data.uploadRanges) {
      this.#writeInstances({ buffer: resources.instance, bytes, offset: range.offset, size: range.size });
    }
    return resources;
  }

  #replaceLayerResources(options: {
    bytes: Uint8Array;
    device: GeometryDevice;
    layer: HTMLElement;
    resources: LayerResources | undefined;
  }): LayerResources {
    if (options.resources) {
      destroyLayerResources(options.resources);
    }
    const instance = options.device.createBuffer({
      size: options.bytes.byteLength,
      usage: BUFFER_COPY_DST | BUFFER_STORAGE
    });
    const uniform = options.device.createBuffer({ size: 160, usage: BUFFER_COPY_DST | BUFFER_UNIFORM });
    const replacement = {
      instance,
      instanceBytes: options.bytes.byteLength,
      uniform
    };
    this.#layers.set(options.layer, replacement);
    this.#writeInstances({ buffer: instance, bytes: options.bytes, offset: 0, size: options.bytes.byteLength });
    return replacement;
  }

  #writeInstances(options: { buffer: SceneGPUBuffer; bytes: Uint8Array; offset: number; size: number }): void {
    const upload = options.bytes.subarray(options.offset, options.offset + options.size);
    this.#geometryDevice?.queue.writeBuffer(options.buffer, options.offset, upload);
    this.#instanceUploadCount += 1;
  }

  #drawItems(pass: SceneGPURenderPass, items: readonly SceneRenderItem[], transparent: boolean): void {
    if (!this.#geometryDevice || !supportsGeometryPass(pass)) {
      return;
    }
    const faceItems = transparent ? items.filter(isTransparentItem) : items;
    faceItems.forEach(item => this.#drawItem(pass, item, transparent));
    items.filter(isCubeMarkerRenderItem).forEach(item => this.#drawMarkerOutline(pass, item, transparent));
  }

  #drawItem(pass: GeometryPass, item: SceneRenderItem, transparent: boolean): void {
    if (isMeshRenderItem(item)) {
      this.#meshRenderer?.draw(pass, item, transparent);
      return;
    }
    const draw = this.#getDrawResources(item, transparent);
    if (!draw) {
      return;
    }
    this.#bindLayer(pass, draw);
    if (isMarkerRenderItem(item)) {
      this.#drawMarker(pass, item, draw.geometry);
      return;
    }
    this.#drawStream(pass, item);
  }

  #getDrawResources(
    item: SceneRenderItem,
    transparent: boolean
  ):
    | {
        geometry?: GeometryResources;
        groups: readonly [SceneGPUBindGroup, SceneGPUBindGroup];
        pipeline: SceneGPURenderPipeline;
      }
    | undefined {
    const device = this.#geometryDevice;
    const resources = this.#layers.get(item.layer);
    const pipelineSet = this.#pipelineSetFor(item);
    const pipeline = transparent ? pipelineSet?.transparent : pipelineSet?.opaque;
    if (!device || !resources || !pipeline) {
      return undefined;
    }
    return {
      geometry: isMarkerRenderItem(item) ? this.#geometries.get(item.data.kind) : undefined,
      groups: createLayerBindGroups({ device, pipeline, uniform: resources.uniform, instance: resources.instance }),
      pipeline
    };
  }

  #bindLayer(
    pass: GeometryPass,
    draw: { groups: readonly [SceneGPUBindGroup, SceneGPUBindGroup]; pipeline: SceneGPURenderPipeline }
  ): void {
    pass.setPipeline(draw.pipeline);
    pass.setBindGroup(0, draw.groups[0]);
    pass.setBindGroup(1, draw.groups[1]);
  }

  #drawMarker(pass: GeometryPass, item: MarkerRenderItem, geometry?: GeometryResources): void {
    if (!geometry) {
      return;
    }
    pass.setVertexBuffer(0, geometry.vertex);
    pass.setIndexBuffer(geometry.index, 'uint32');
    pass.drawIndexed(geometry.indexCount, item.data.count);
  }

  // eslint-disable-next-line complexity -- Optional outline resources are all required for one draw.
  #drawMarkerOutline(pass: GeometryPass, item: MarkerRenderItem, transparent: boolean): void {
    const resources = this.#layers.get(item.layer);
    const geometry = this.#geometries.get(item.data.kind);
    const pipeline = transparent ? this.#markerPipelines?.outlineTransparent : this.#markerPipelines?.outlineOpaque;
    const visible = transparent ? item.data.outlineTransparent : item.data.outlineVisible;
    if (
      !resources ||
      !geometry?.outlineVertex ||
      !geometry.outlineIndex ||
      !geometry.outlineIndexCount ||
      !pipeline ||
      !visible
    ) {
      return;
    }
    this.#bindLayer(pass, {
      groups: createLayerBindGroups({
        device: this.#geometryDevice as GeometryDevice,
        pipeline,
        uniform: resources.uniform,
        instance: resources.instance
      }),
      pipeline
    });
    pass.setVertexBuffer(0, geometry.outlineVertex);
    pass.setIndexBuffer(geometry.outlineIndex, 'uint32');
    pass.drawIndexed(geometry.outlineIndexCount, item.data.count);
  }

  #drawOitComposite(pass: SceneGPURenderPass, oit: OitResources): void {
    const pipeline = this.#oitCompositePipeline;
    if (!pipeline || !supportsCompositePass(pass)) return;
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, oit.bindGroup);
    pass.draw(3);
  }

  #drawStream(pass: GeometryPass, item: PointRenderItem | LineRenderItem | TriangleRenderItem): void {
    if (item.type === 'point') {
      pass.draw(item.data.count * 6);
      return;
    }
    if (item.type === 'triangle') {
      pass.draw(item.data.count);
      return;
    }
    pass.draw(getLineVertexCount(item));
  }

  #pipelineSetFor(item: SceneRenderItem): RenderPipelines | undefined {
    if (isMarkerRenderItem(item)) {
      return this.#markerPipelines;
    }
    if (isMeshRenderItem(item)) {
      return undefined;
    }
    return item.type === 'line' && item.data.depthBias
      ? this.#streamPipelines?.biasedLine
      : this.#streamPipelines?.[item.type];
  }

  #loadStreamPipelines(items: readonly SceneRenderItem[]): void {
    if (
      this.#streamPipelines ||
      this.#streamLoad ||
      !items.some(item => !isMarkerRenderItem(item) && !isMeshRenderItem(item))
    ) {
      return;
    }
    const device = this.#geometryDevice;
    const format = this.#renderFormat;
    if (!device || !format) {
      return;
    }
    const token = this.#streamToken;
    this.#streamLoad = import('../rendering/stream-pipelines.js')
      .then(({ createStreamPipelines }) => {
        if (token === this.#streamToken && device === this.#geometryDevice) {
          this.#streamPipelines = createStreamPipelines(device, format);
          this.#renderRequested = true;
        }
      })
      .catch(error => console.error('Scene mesh pipeline initialization failed.', error))
      .finally(() => {
        if (token === this.#streamToken) {
          this.#streamLoad = undefined;
        }
      });
  }

  #loadMarkerPipelines(items: readonly SceneRenderItem[]): void {
    if (this.#markerPipelines || this.#markerLoad || !items.some(isMarkerRenderItem)) {
      return;
    }
    const device = this.#geometryDevice;
    const format = this.#renderFormat;
    if (!device || !format) {
      return;
    }
    const token = this.#streamToken;
    this.#markerLoad = import('../rendering/marker/pipelines.js')
      .then(({ createMarkerGeometry, createMarkerPipelines }) => {
        if (token === this.#streamToken && device === this.#geometryDevice) {
          this.#createMarkerGeometry = createMarkerGeometry;
          this.#markerPipelines = createMarkerPipelines(device, format);
          this.#renderRequested = true;
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (token === this.#streamToken) {
          this.#markerLoad = undefined;
        }
      });
  }

  #loadMeshPipelines(items: readonly SceneRenderItem[]): void {
    if (this.#meshRenderer || this.#meshLoad || !items.some(isMeshRenderItem)) return;
    const device = this.#meshDevice();
    const format = this.#renderFormat;
    if (!device || !format) return;
    const token = this.#meshToken;
    this.#meshLoad = import('../rendering/mesh/renderer.js')
      .then(({ MeshRenderer }) => {
        if (token !== this.#meshToken || device !== this.#geometryDevice) return;
        this.#meshRenderer = new MeshRenderer(device, format);
        this.#renderRequested = true;
      })
      .catch(() => undefined)
      .finally(() => {
        if (token === this.#meshToken) this.#meshLoad = undefined;
      });
  }

  #loadLabelRenderer(labels: readonly LabelTextureRenderItem[]): void {
    if (this.#labelRenderer || this.#labelLoad || labels.length === 0) return;
    const device = this.#geometryDevice;
    const format = this.#renderFormat;
    if (!device || !format) return;
    const token = this.#labelToken;
    this.#labelLoad = import('../label/renderer.js')
      .then(({ LabelTextureRenderer, supportsLabelTextureRendering }) => {
        if (token === this.#labelToken && device === this.#geometryDevice && supportsLabelTextureRendering(device)) {
          this.#labelRenderer = new LabelTextureRenderer(device, format);
          this.#renderRequested = true;
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (token === this.#labelToken) this.#labelLoad = undefined;
      });
  }

  #meshDevice(): MeshRendererDevice | undefined {
    const device = this.#geometryDevice;
    return device &&
      'createSampler' in device &&
      typeof device.createSampler === 'function' &&
      'copyExternalImageToTexture' in device.queue &&
      typeof device.queue.copyExternalImageToTexture === 'function' &&
      'writeTexture' in device.queue &&
      typeof device.queue.writeTexture === 'function'
      ? (device as MeshRendererDevice & {
          createSampler(descriptor?: unknown): object;
          queue: GeometryDevice['queue'] & {
            copyExternalImageToTexture(
              source: { source: ImageBitmap },
              destination: { texture: SceneGPUTexture },
              copySize: { width: number; height: number }
            ): void;
            writeTexture(
              destination: { texture: SceneGPUTexture },
              data: ArrayBufferView,
              layout: { bytesPerRow: number },
              size: { width: number; height: number }
            ): void;
          };
        })
      : undefined;
  }

  // eslint-disable-next-line max-statements -- Resetting independently lazy renderer resources must be explicit.
  #resetDeferredPipelines(): void {
    this.#streamToken += 1;
    this.#markerLoad = undefined;
    this.#createMarkerGeometry = undefined;
    this.#markerPipelines = undefined;
    this.#streamLoad = undefined;
    this.#streamPipelines = undefined;
    this.#meshLoad = undefined;
    this.#meshRenderer?.disconnect();
    this.#meshRenderer = undefined;
    this.#labelLoad = undefined;
    this.#labelRenderer?.disconnect();
    this.#labelRenderer = undefined;
    this.#labelToken += 1;
    this.#pickLoad = undefined;
    this.#pickPipelines = undefined;
    this.#pickToken += 1;
    this.#meshToken += 1;
    this.#renderRequested = false;
  }

  #destroyDepthTexture(): void {
    this.#depthTexture?.destroy?.();
    this.#depthTexture = undefined;
    this.#depthSize = '';
    this.#destroyOitTargets();
    this.#pickDepthTexture?.destroy?.();
    this.#pickDepthTexture = undefined;
    this.#pickIdTexture?.destroy?.();
    this.#pickIdTexture = undefined;
    this.#lastProjection = undefined;
    this.#latestGeometryPixels.clear();
    this.#pickResourceGeneration += 1;
  }

  #destroyOitTargets(): void {
    this.#oitAccumulationTexture?.destroy?.();
    this.#oitRevealageTexture?.destroy?.();
    this.#oitAccumulationTexture = undefined;
    this.#oitRevealageTexture = undefined;
    this.#oitBindGroup = undefined;
    this.#oitSize = '';
  }

  #getPickTextures(
    snapshot: PickFrameSnapshot
  ): { readonly depth: SceneGPUTexture; readonly id: SceneGPUTexture } | undefined {
    if (!this.#isPickSnapshotCurrent(snapshot)) return undefined;
    if (!this.#pickIdTexture || !this.#pickDepthTexture) {
      this.#pickIdTexture = snapshot.device.createTexture({
        size: [snapshot.width, snapshot.height],
        format: 'rgba8uint',
        usage: TEXTURE_COPY_SRC | TEXTURE_RENDER_ATTACHMENT
      });
      this.#pickDepthTexture = snapshot.device.createTexture({
        size: [snapshot.width, snapshot.height],
        format: 'r32float',
        usage: TEXTURE_COPY_SRC | TEXTURE_RENDER_ATTACHMENT
      });
    }
    return { depth: this.#pickDepthTexture, id: this.#pickIdTexture };
  }

  #createPickPassDescriptor(textures: { readonly depth: SceneGPUTexture; readonly id: SceneGPUTexture }): unknown {
    return {
      colorAttachments: [
        { clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store', view: textures.id.createView() },
        { clearValue: { r: 1, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store', view: textures.depth.createView() }
      ],
      depthStencilAttachment: {
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'discard',
        view: this.#getDepthView()
      }
    };
  }

  #drawPickItems(pass: SceneGPURenderPass, items: readonly SceneRenderItem[]): void {
    if (!supportsGeometryPass(pass) || !this.#geometryDevice || !this.#pickPipelines) return;
    let pickId = 1;
    for (const entry of orderPickItems(items)) {
      const transparent = isTransparentItem(entry);
      const count = getPickItemCount(entry);
      this.#drawPickItem({ pass, item: entry, transparent, pickId });
      pickId += count;
    }
  }

  // eslint-disable-next-line max-statements -- Pick binding and optional outline drawing share one ID write.
  #drawPickItem(options: {
    readonly pass: GeometryPass;
    readonly item: SceneRenderItem;
    readonly transparent: boolean;
    readonly pickId: number;
  }): void {
    const { pass, item, transparent, pickId } = options;
    const pipelines = this.#pickPipelines;
    if (!pipelines) return;
    if (isMeshRenderItem(item)) {
      this.#meshRenderer?.drawPick({ item, pass, pickId, pipelines: pipelines.mesh, transparent });
      return;
    }
    const resources = this.#layers.get(item.layer);
    if (!resources) return;
    const pair = isMarkerRenderItem(item) ? pipelines.marker : pipelines[item.type];
    const pipeline = transparent ? pair.transparent : pair.opaque;
    const offset = isMarkerRenderItem(item) ? PICK_UNIFORM_OFFSETS.marker : PICK_UNIFORM_OFFSETS.stream;
    this.#geometryDevice?.queue.writeBuffer(resources.uniform, offset, new Uint32Array([pickId]));
    this.#bindLayer(pass, {
      groups: createLayerBindGroups({
        device: this.#geometryDevice as GeometryDevice,
        pipeline,
        uniform: resources.uniform,
        instance: resources.instance
      }),
      pipeline
    });
    if (isMarkerRenderItem(item)) {
      this.#drawMarker(pass, item, this.#geometries.get(item.data.kind));
      this.#drawPickMarkerOutline(pass, item);
    } else this.#drawStream(pass, item);
  }

  #drawPickMarkerOutline(pass: GeometryPass, item: MarkerRenderItem): void {
    const pipeline = this.#pickPipelines?.outline.opaque;
    const resources = this.#layers.get(item.layer);
    const geometry = this.#geometries.get(item.data.kind);
    const device = this.#geometryDevice;
    if (
      !pipeline ||
      !resources ||
      !geometry?.outlineVertex ||
      !geometry.outlineIndex ||
      !geometry.outlineIndexCount ||
      !device ||
      !item.data.outlineVisible
    ) {
      return;
    }
    this.#bindLayer(pass, {
      groups: createLayerBindGroups({
        device,
        pipeline,
        uniform: resources.uniform,
        instance: resources.instance
      }),
      pipeline
    });
    pass.setVertexBuffer(0, geometry.outlineVertex);
    pass.setIndexBuffer(geometry.outlineIndex, 'uint32');
    pass.drawIndexed(geometry.outlineIndexCount, item.data.count);
  }

  async #loadPickPipelines(): Promise<void> {
    if (this.#pickPipelines) return;
    if (!this.#pickLoad) {
      const device = this.#geometryDevice;
      const token = this.#pickToken;
      if (!device) return;
      this.#pickLoad = import('../pick/pipelines.js')
        .then(({ createPickPipelines }) => {
          if (token === this.#pickToken && device === this.#geometryDevice)
            this.#pickPipelines = createPickPipelines(device);
        })
        .finally(() => {
          if (token === this.#pickToken) this.#pickLoad = undefined;
        });
    }
    await this.#pickLoad;
  }

  #destroyGeometryResources(): void {
    this.#destroyDepthTexture();
    this.#geometries.forEach(resources => {
      resources.vertex.destroy();
      resources.index.destroy();
      resources.outlineVertex?.destroy();
      resources.outlineIndex?.destroy();
    });
    this.#geometries.clear();
    this.#layers.forEach(destroyLayerResources);
    this.#layers.clear();
    this.#meshRenderer?.disconnect();
    this.#meshRenderer = undefined;
    this.#labelRenderer?.disconnect();
    this.#labelRenderer = undefined;
    this.#latestGeometryPixels.clear();
  }

  #storeCompletedGeometryPixel(options: {
    readonly pixelX: number;
    readonly pixelY: number;
    readonly sample: PickPixel;
    readonly snapshot: PickFrameSnapshot;
  }): void {
    const { pixelX, pixelY, sample, snapshot } = options;
    if (!this.#isPickSnapshotCurrent(snapshot)) return;
    const key = geometryPixelKey(pixelX, pixelY);
    this.#latestGeometryPixels.set(key, { ...sample, frameGeneration: snapshot.frameGeneration, pixelX, pixelY });
    // Pointer motion produces nearby samples. Bound storage for long scenes.
    if (this.#latestGeometryPixels.size > 128) {
      this.#latestGeometryPixels.delete(this.#latestGeometryPixels.keys().next().value ?? key);
    }
  }
}

export function parseComputedBackgroundColor(source: string): LinearColor {
  if (source === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

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

function createLayerBindGroups(options: {
  device: GeometryDevice;
  pipeline: SceneGPURenderPipeline;
  uniform: SceneGPUBuffer;
  instance: SceneGPUBuffer;
}): readonly [SceneGPUBindGroup, SceneGPUBindGroup] {
  return [
    options.device.createBindGroup({
      layout: options.pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: options.uniform } }]
    }),
    options.device.createBindGroup({
      layout: options.pipeline.getBindGroupLayout(1),
      entries: [{ binding: 0, resource: { buffer: options.instance } }]
    })
  ];
}

function supportsGeometryPass(pass: SceneGPURenderPass): pass is GeometryPass {
  return (
    typeof pass.draw === 'function' &&
    typeof pass.drawIndexed === 'function' &&
    typeof pass.setBindGroup === 'function' &&
    typeof pass.setIndexBuffer === 'function' &&
    typeof pass.setPipeline === 'function' &&
    typeof pass.setVertexBuffer === 'function'
  );
}

function supportsCompositePass(pass: SceneGPURenderPass): pass is SceneGPURenderPass & {
  draw(vertexCount: number): void;
  setBindGroup(index: number, bindGroup: SceneGPUBindGroup): void;
  setPipeline(pipeline: SceneGPURenderPipeline): void;
} {
  return (
    typeof pass.draw === 'function' && typeof pass.setBindGroup === 'function' && typeof pass.setPipeline === 'function'
  );
}

function isMarkerRenderItem(item: SceneRenderItem): item is MarkerRenderItem {
  return !('type' in item);
}

function isCubeMarkerRenderItem(item: SceneRenderItem): item is MarkerRenderItem {
  return isMarkerRenderItem(item) && item.data.kind === 'cube';
}

function createPickTargets(items: readonly SceneRenderItem[]): ScenePickResult[] {
  return orderPickItems(items).flatMap(item => {
    const count = getPickItemCount(item);
    return Array.from({ length: count }, (_, instanceIndex) => ({
      instanceIndex,
      layer: item.layer,
      marker:
        (isMarkerRenderItem(item) || isMeshRenderItem(item)) && isMarkerLayerRegistered(item.layer)
          ? getMarkerLayerMarker(item.layer, instanceIndex)
          : undefined,
      worldPosition: [0, 0, 0] as const
    }));
  });
}

function orderPickItems(items: readonly SceneRenderItem[]): readonly SceneRenderItem[] {
  return items.filter(isPickableItem);
}

function isPickableItem(item: SceneRenderItem): boolean {
  return isMarkerRenderItem(item) || isMeshRenderItem(item) || item.data.pickable;
}

function invertMat4(matrix: Mat4): Mat4 | null {
  return invertFiniteMat4(matrix);
}

// eslint-disable-next-line complexity -- Gaussian elimination has one pivot and one row-reduction loop.
function invertFiniteMat4(matrix: Mat4): Mat4 | null {
  const values = [...matrix];
  if (values.length !== 16 || values.some(value => !Number.isFinite(value))) return null;
  const augmented = Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 8 }, (_, column) =>
      column < 4 ? (values[column * 4 + row] ?? 0) : column - 4 === row ? 1 : 0
    )
  );
  for (let pivot = 0; pivot < 4; pivot += 1) {
    const row = augmented.slice(pivot).findIndex(candidate => Math.abs(candidate[pivot] ?? 0) > Number.EPSILON) + pivot;
    if (row < pivot) return null;
    [augmented[pivot], augmented[row]] = [augmented[row] ?? [], augmented[pivot] ?? []];
    const divisor = augmented[pivot]?.[pivot] ?? 0;
    if (divisor === 0) return null;
    augmented[pivot] = (augmented[pivot] ?? []).map(value => value / divisor);
    for (let other = 0; other < 4; other += 1) {
      if (other === pivot) continue;
      const factor = augmented[other]?.[pivot] ?? 0;
      augmented[other] = (augmented[other] ?? []).map(
        (value, column) => value - factor * (augmented[pivot]?.[column] ?? 0)
      );
    }
  }
  return new Float32Array(
    Array.from({ length: 16 }, (_, index) => augmented[index % 4]?.[4 + Math.floor(index / 4)] ?? 0)
  );
}

function isMeshRenderItem(item: SceneRenderItem): item is MeshRenderItem {
  return 'type' in item && item.type === 'mesh';
}

function isTransparentItem(item: SceneRenderItem): boolean {
  return (
    item.data.transparent ||
    (isMarkerRenderItem(item) && item.data.outlineTransparent) ||
    (isMeshRenderItem(item) && item.instances?.transparent === true)
  );
}

function getStreamSize(item: PointRenderItem | LineRenderItem | TriangleRenderItem): number {
  return item.type === 'point' ? item.size : 0;
}

function getLineVertexCount(item: LineRenderItem): number {
  const segments = lineSegmentCount(item.data.count, item.topology);
  const joins =
    item.topology === 'segments' ? 0 : item.topology === 'loop' ? item.data.count : Math.max(0, item.data.count - 2);
  return segments * 6 + joins * 3;
}

function getPickItemCount(item: SceneRenderItem): number {
  if (isMeshRenderItem(item)) return item.data.identityInstance ? 1 : (item.instances?.count ?? 0);
  if ('type' in item && item.type === 'line') return lineSegmentCount(item.data.count, item.topology);
  return item.data.count;
}

function topologyUniform(topology: LineTopology): number {
  if (topology === 'loop') return 1;
  if (topology === 'segments') return 2;
  return 0;
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

function destroyLayerResources(resources: LayerResources): void {
  resources.instance.destroy();
  resources.uniform.destroy();
}

function createUploadedGeometryBuffer(
  device: GeometryDevice,
  data: Float32Array | Uint32Array,
  usage: number
): SceneGPUBuffer {
  const buffer = device.createBuffer({ size: data.byteLength, usage: BUFFER_COPY_DST | usage });
  device.queue.writeBuffer(buffer, 0, data);
  return buffer;
}

function createPerspectiveMatrix(aspect: number): Float32Array {
  const near = 0.01;
  const far = 10_000;
  const focal = 1 / Math.tan(Math.PI / 8);
  return new Float32Array([
    focal / Math.max(aspect, Number.EPSILON),
    0,
    0,
    0,
    0,
    focal,
    0,
    0,
    0,
    0,
    far / (near - far),
    -1,
    0,
    0,
    (near * far) / (near - far),
    0
  ]);
}

function createDefaultViewProjection(aspect: number): Float32Array {
  const inverseSqrt2 = Math.SQRT1_2;
  const view = new Float32Array([
    1,
    0,
    0,
    0,
    0,
    inverseSqrt2,
    -inverseSqrt2,
    0,
    0,
    inverseSqrt2,
    inverseSqrt2,
    0,
    0,
    0,
    -12,
    1
  ]);
  return multiplyMat4(createPerspectiveMatrix(aspect), view);
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

function getValidationErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const message = Reflect.get(error, 'message');
    if (typeof message === 'string') return message;
  }
  return typeof error === 'string' ? error : String(error);
}

function geometryPixelKey(pixelX: number, pixelY: number): string {
  return `${pixelX}:${pixelY}`;
}
