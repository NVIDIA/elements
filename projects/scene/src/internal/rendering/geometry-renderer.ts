// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  type SceneGPUBindGroup,
  type SceneGPUBuffer,
  type SceneGPUCommandEncoder,
  type SceneGPUDevice,
  type SceneGPUQueue,
  type SceneGPURenderPass,
  type SceneGPURenderPipeline,
  type SceneGPUTexture
} from '../gpu/platform.js';
import { acquireSharedInstanceBuffer, type SharedInstanceBufferLease } from '../gpu/shared-instance-buffer.js';
import { multiplyMat4 } from '../math/mat4.js';
import type { MeshRenderer, MeshRendererDevice } from '../mesh/renderer.js';
import type { MarkerGeometry, MarkerPipelines } from '../markers/pipelines.js';
import { MarkerBoundsClassifier, type MarkerFrustumRelation } from '../markers/bounds.js';
import {
  destroyMarkerCompactionResources,
  MARKER_COMPACTION_THRESHOLD,
  MarkerCompactor,
  supportsMarkerCompaction,
  type MarkerCompactionResources
} from '../markers/compaction.js';
import { PICK_UNIFORM_OFFSETS } from '../pick/uniform-offsets.js';
import type { PickPipelines } from '../pick/pipelines.js';
import type { PrimitiveKind } from '../primitive-geometry.js';
import type { Mat4 } from '../types.js';
import {
  getLineVertexCount,
  getPickItemCount,
  getStreamSize,
  isCubeMarkerRenderItem,
  isMarkerRenderItem,
  isMeshRenderItem,
  isOpaqueItem,
  isPickableItem,
  isTransparentItem,
  topologyUniform,
  type LineRenderItem,
  type MarkerRenderItem,
  type PointRenderItem,
  type SceneRenderItem,
  type TriangleRenderItem
} from './render-items.js';
import type { StreamPipelines } from './stream-pipelines.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_INDEX = 0x10;
const BUFFER_VERTEX = 0x20;
const BUFFER_UNIFORM = 0x40;

export interface GeometryDevice extends SceneGPUDevice {
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

type LayerBindGroups = readonly [SceneGPUBindGroup, SceneGPUBindGroup, SceneGPUBindGroup?];

interface LayerResources {
  readonly bindGroups: WeakMap<SceneGPURenderPipeline, LayerBindGroups>;
  compactOpaqueBindGroups: WeakMap<SceneGPURenderPipeline, LayerBindGroups>;
  compactTransparentBindGroups: WeakMap<SceneGPURenderPipeline, LayerBindGroups>;
  compaction?: MarkerCompactionResources;
  compactionReady: boolean;
  frustumRelation: MarkerFrustumRelation;
  readonly instance: SharedInstanceBufferLease;
  readonly uniform: SceneGPUBuffer;
  readonly uniformValues: Float32Array;
}

interface RenderPipelines {
  readonly opaque: SceneGPURenderPipeline;
  readonly transparent: SceneGPURenderPipeline;
}

interface GeometryPass extends SceneGPURenderPass {
  draw(vertexCount: number, instanceCount?: number): void;
  drawIndexed(indexCount: number, instanceCount?: number): void;
  setBindGroup(index: number, bindGroup: SceneGPUBindGroup): void;
  setIndexBuffer(buffer: SceneGPUBuffer, indexFormat: 'uint32'): void;
  setPipeline(pipeline: SceneGPURenderPipeline): void;
  setVertexBuffer(slot: number, buffer: SceneGPUBuffer): void;
}

export class GeometryRenderer {
  #canvas?: HTMLCanvasElement;
  #createMarkerGeometry?: (kind: PrimitiveKind) => MarkerGeometry;
  #device?: GeometryDevice;
  #format?: string;
  #geometries = new Map<PrimitiveKind, GeometryResources>();
  #layers = new Map<HTMLElement, LayerResources>();
  #markerLoad?: Promise<void>;
  #markerCompactor?: MarkerCompactor;
  #markerCompactionDisabled = false;
  #markerBoundsClassifier = new MarkerBoundsClassifier();
  #markerPipelines?: MarkerPipelines;
  #meshLoad?: Promise<void>;
  #meshRenderer?: MeshRenderer;
  #meshToken = 0;
  #pickIdScratch = new Uint32Array(1);
  #streamLoad?: Promise<void>;
  #streamPipelines?: StreamPipelines;
  #streamToken = 0;
  #uniformScratch = new Float32Array(40);
  readonly #requestRender: () => void;

  constructor(requestRender: () => void) {
    this.#requestRender = requestRender;
  }

  get active(): boolean {
    return this.#device !== undefined;
  }

  initialize(canvas: HTMLCanvasElement, device: SceneGPUDevice, format: string): void {
    this.disconnect();
    if (!supportsGeometryRendering(device)) return;
    this.#canvas = canvas;
    this.#device = device;
    this.#format = format;
  }

  disconnect(): void {
    this.#destroyResources();
    this.#resetDeferredPipelines();
    this.#canvas = undefined;
    this.#device = undefined;
    this.#format = undefined;
  }

  prepare(items: readonly SceneRenderItem[], viewProjection?: Mat4): Mat4 | undefined {
    const canvas = this.#canvas;
    if (!this.#device || !canvas) return undefined;
    this.#pruneLayerResources(items);
    const projection = viewProjection ?? createDefaultViewProjection(canvas.width / canvas.height);
    const pixelRatio = items.some(item => !isMarkerRenderItem(item) && !isMeshRenderItem(item))
      ? this.#canvasPixelRatio()
      : 1;
    for (const item of items) this.#prepareItem(item, projection, pixelRatio);
    this.#loadMarkerPipelines(items);
    this.#loadStreamPipelines(items);
    this.#loadMeshPipelines(items);
    return projection;
  }

  encodeCompaction(encoder: SceneGPUCommandEncoder, items: readonly SceneRenderItem[]): void {
    const compactor = this.#markerCompactor;
    if (compactor) {
      for (const item of items) {
        if (!isMarkerRenderItem(item)) continue;
        const resources = this.#layers.get(item.layer);
        const geometry = this.#geometries.get(item.data.kind);
        if (!resources?.compaction || resources.frustumRelation !== 'intersecting' || !geometry) continue;
        resources.compactionReady = compactor.encode({
          count: item.data.count,
          encoder,
          indexCount: geometry.indexCount,
          resources: resources.compaction
        });
      }
    }
    this.#meshRenderer?.encodeCompute(encoder);
  }

  drawItems(pass: SceneGPURenderPass, items: readonly SceneRenderItem[], transparent: boolean): void {
    if (!this.#device || !supportsGeometryPass(pass)) return;
    for (const item of items) {
      if (transparent ? isTransparentItem(item) : isOpaqueItem(item)) this.#drawItem(pass, item, transparent);
    }
    for (const item of items) {
      if (isCubeMarkerRenderItem(item)) this.#drawMarkerOutline(pass, item, transparent);
    }
  }

  drawPickItems(pass: SceneGPURenderPass, items: readonly SceneRenderItem[], pipelines: PickPipelines): void {
    if (!supportsGeometryPass(pass) || !this.#device) return;
    let pickId = 1;
    for (const item of items) {
      if (!isPickableItem(item)) continue;
      const transparent = isTransparentItem(item);
      this.#drawPickItem({ item, pass, pickId, pipelines, transparent });
      pickId += getPickItemCount(item);
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

  #prepareItem(item: SceneRenderItem, projection: Mat4, pixelRatio: number): void {
    if (isMeshRenderItem(item)) {
      this.#meshRenderer?.prepare(item, projection);
      return;
    }
    const bytes = item.data.bytes;
    if (!this.#device || !bytes || !item.data.ready || bytes.byteLength === 0) return;
    if (isMarkerRenderItem(item)) this.#ensureGeometry(item.data.kind);
    const resources = this.#ensureLayerResources(item);
    this.#writeLayerUniforms(resources, item, { pixelRatio, projection });
    resources.compactionReady = false;
    if (isMarkerRenderItem(item)) {
      resources.frustumRelation = this.#markerBoundsClassifier.classify(item.data.bounds, projection, item.frameMatrix);
      this.#prepareMarkerCompaction(resources, item);
    }
  }

  #writeLayerUniforms(
    resources: LayerResources,
    item: SceneRenderItem,
    frame: { readonly pixelRatio: number; readonly projection: Mat4 }
  ): void {
    const uniforms = this.#uniformScratch;
    uniforms.fill(0);
    uniforms.set(frame.projection, 0);
    uniforms.set(item.frameMatrix, 16);
    if (isMarkerRenderItem(item)) uniforms[32] = item.data.count;
    else if (!isMeshRenderItem(item)) this.#writeStreamUniforms(uniforms, item, frame.pixelRatio);
    if (sameFloatValues(resources.uniformValues, uniforms)) return;
    resources.uniformValues.set(uniforms);
    this.#device?.queue.writeBuffer(resources.uniform, 0, uniforms);
  }

  #writeStreamUniforms(
    uniforms: Float32Array,
    item: PointRenderItem | LineRenderItem | TriangleRenderItem,
    pixelRatio: number
  ): void {
    const canvas = this.#canvas;
    uniforms[32] = pixelRatio;
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
    const canvas = this.#canvas;
    if (!canvas) return 1;
    const cssWidth = canvas.getBoundingClientRect().width;
    return cssWidth > 0 ? canvas.width / cssWidth : 1;
  }

  #ensureGeometry(kind: PrimitiveKind): GeometryResources | undefined {
    const device = this.#device;
    if (!device) return undefined;
    const existing = this.#geometries.get(kind);
    if (existing) return existing;
    const geometry = this.#createMarkerGeometry?.(kind);
    if (!geometry) return undefined;
    const resources = createMarkerGeometryResources(device, geometry);
    this.#geometries.set(kind, resources);
    return resources;
  }

  #ensureLayerResources(item: SceneRenderItem): LayerResources {
    const device = this.#device;
    const bytes = item.data.bytes;
    if (!device || !bytes) throw new TypeError('Marker geometry resources are unavailable.');
    let resources = this.#layers.get(item.layer);
    if (!resources) {
      resources = this.#replaceLayerResources({ bytes, device, layer: item.layer, resources });
      return resources;
    }
    if (resources.instance.bytes !== bytes && !resources.instance.tryReassign(bytes)) {
      return this.#replaceLayerResources({ bytes, device, layer: item.layer, resources });
    }
    for (const range of item.data.uploadRanges) {
      this.#writeInstances({ buffer: resources.instance.buffer, bytes, offset: range.offset, size: range.size });
    }
    return resources;
  }

  #replaceLayerResources(options: {
    bytes: Uint8Array;
    device: GeometryDevice;
    layer: HTMLElement;
    resources: LayerResources | undefined;
  }): LayerResources {
    const instance = acquireSharedInstanceBuffer(options.device, options.bytes);
    let uniform: SceneGPUBuffer;
    try {
      uniform = options.device.createBuffer({ size: 160, usage: BUFFER_COPY_DST | BUFFER_UNIFORM });
    } catch (error) {
      instance.release();
      throw error;
    }
    const replacement = {
      bindGroups: new WeakMap<SceneGPURenderPipeline, LayerBindGroups>(),
      compactOpaqueBindGroups: new WeakMap<SceneGPURenderPipeline, LayerBindGroups>(),
      compactTransparentBindGroups: new WeakMap<SceneGPURenderPipeline, LayerBindGroups>(),
      compactionReady: false,
      frustumRelation: 'intersecting' as const,
      instance,
      uniform,
      uniformValues: new Float32Array(40).fill(Number.NaN)
    };
    if (options.resources) destroyLayerResources(options.resources);
    this.#layers.set(options.layer, replacement);
    return replacement;
  }

  #writeInstances(options: { buffer: SceneGPUBuffer; bytes: Uint8Array; offset: number; size: number }): void {
    const upload = options.bytes.subarray(options.offset, options.offset + options.size);
    this.#device?.queue.writeBuffer(options.buffer, options.offset, upload);
  }

  #drawItem(pass: GeometryPass, item: SceneRenderItem, transparent: boolean): void {
    if (isMeshRenderItem(item)) {
      this.#meshRenderer?.draw(pass, item, transparent);
      return;
    }
    if (isMarkerRenderItem(item) && this.#layers.get(item.layer)?.frustumRelation === 'outside') return;
    const draw = this.#getDrawResources(item, transparent, typeof pass.drawIndexedIndirect === 'function');
    if (!draw) return;
    this.#bindLayer(pass, draw);
    if (isMarkerRenderItem(item)) {
      this.#drawMarker(pass, { count: item.data.count, geometry: draw.geometry, indirect: draw.indirect });
    } else this.#drawStream(pass, item);
  }

  #getDrawResources(
    item: SceneRenderItem,
    transparent: boolean,
    useIndirect: boolean
  ):
    | {
        geometry?: GeometryResources;
        groups: LayerBindGroups;
        indirect?: { readonly buffer: SceneGPUBuffer; readonly offset: number };
        pipeline: SceneGPURenderPipeline;
      }
    | undefined {
    const device = this.#device;
    const resources = this.#layers.get(item.layer);
    if (!device || !resources) return undefined;
    const instance = getInstanceDraw({
      marker: isMarkerRenderItem(item),
      resources,
      transparent,
      useIndirect
    });
    const pipeline = this.#pipelineForDraw(item, transparent, instance.indexBuffer !== undefined);
    if (!pipeline) return undefined;
    return {
      geometry: isMarkerRenderItem(item) ? this.#geometries.get(item.data.kind) : undefined,
      groups: getLayerBindGroups({
        cache: instance.cache,
        device,
        instanceBuffer: instance.buffer,
        pipeline,
        uniform: resources.uniform,
        ...(instance.indexBuffer ? { indexBuffer: instance.indexBuffer } : {})
      }),
      ...(instance.indirect ? { indirect: instance.indirect } : {}),
      pipeline
    };
  }

  #bindLayer(pass: GeometryPass, draw: { groups: LayerBindGroups; pipeline: SceneGPURenderPipeline }): void {
    pass.setPipeline(draw.pipeline);
    pass.setBindGroup(0, draw.groups[0]);
    pass.setBindGroup(1, draw.groups[1]);
    if (draw.groups[2]) pass.setBindGroup(2, draw.groups[2]);
  }

  #drawMarker(
    pass: GeometryPass,
    options: {
      readonly count: number;
      readonly geometry?: GeometryResources;
      readonly indirect?: { readonly buffer: SceneGPUBuffer; readonly offset: number };
    }
  ): void {
    if (!options.geometry) return;
    pass.setVertexBuffer(0, options.geometry.vertex);
    pass.setIndexBuffer(options.geometry.index, 'uint32');
    if (options.indirect && pass.drawIndexedIndirect) {
      pass.drawIndexedIndirect(options.indirect.buffer, options.indirect.offset);
      return;
    }
    pass.drawIndexed(options.geometry.indexCount, options.count);
  }

  // eslint-disable-next-line complexity, max-statements -- Optional compaction setup fails open.
  #prepareMarkerCompaction(resources: LayerResources, item: MarkerRenderItem): void {
    if (item.data.count < MARKER_COMPACTION_THRESHOLD || item.data.outlineVisible) {
      this.#clearMarkerCompaction(resources);
      return;
    }
    if (resources.frustumRelation !== 'intersecting') return;
    const device = this.#device;
    if (!device) return;
    if (this.#markerCompactionDisabled) return;
    if (!this.#markerCompactor && supportsMarkerCompaction(device)) {
      try {
        this.#markerCompactor = new MarkerCompactor(device);
      } catch {
        this.#markerCompactionDisabled = true;
        return;
      }
    }
    if (!this.#markerCompactor || resources.compaction) return;
    try {
      resources.compaction = this.#markerCompactor.createResources(
        resources.instance.buffer,
        resources.uniform,
        resources.instance.bytes.byteLength
      );
    } catch {
      this.#markerCompactionDisabled = true;
    }
  }

  #clearMarkerCompaction(resources: LayerResources): void {
    if (!resources.compaction) return;
    destroyMarkerCompactionResources(resources.compaction);
    resources.compaction = undefined;
    resources.compactOpaqueBindGroups = new WeakMap();
    resources.compactTransparentBindGroups = new WeakMap();
  }

  // eslint-disable-next-line complexity -- Optional outline resources are all required for one draw.
  #drawMarkerOutline(pass: GeometryPass, item: MarkerRenderItem, transparent: boolean): void {
    const resources = this.#layers.get(item.layer);
    const geometry = this.#geometries.get(item.data.kind);
    const pipeline = transparent ? this.#markerPipelines?.outlineTransparent : this.#markerPipelines?.outlineOpaque;
    const visible = transparent ? item.data.outlineTransparent : item.data.outlineOpaque;
    const device = this.#device;
    if (
      !resources ||
      resources.frustumRelation === 'outside' ||
      !geometry?.outlineVertex ||
      !geometry.outlineIndex ||
      !geometry.outlineIndexCount ||
      !pipeline ||
      !visible ||
      !device
    ) {
      return;
    }
    this.#bindLayer(pass, { groups: getDirectLayerBindGroups(device, pipeline, resources), pipeline });
    pass.setVertexBuffer(0, geometry.outlineVertex);
    pass.setIndexBuffer(geometry.outlineIndex, 'uint32');
    pass.drawIndexed(geometry.outlineIndexCount, item.data.count);
  }

  #drawStream(pass: GeometryPass, item: PointRenderItem | LineRenderItem | TriangleRenderItem): void {
    if (item.type === 'point') pass.draw(item.data.count * 6);
    else if (item.type === 'triangle') pass.draw(item.data.count);
    else pass.draw(getLineVertexCount(item));
  }

  #pipelineSetFor(item: SceneRenderItem): RenderPipelines | undefined {
    if (isMarkerRenderItem(item)) return this.#markerPipelines;
    if (isMeshRenderItem(item)) return undefined;
    return item.type === 'line' && item.data.depthBias
      ? this.#streamPipelines?.biasedLine
      : this.#streamPipelines?.[item.type];
  }

  #pipelineForDraw(item: SceneRenderItem, transparent: boolean, compact: boolean): SceneGPURenderPipeline | undefined {
    if (compact && isMarkerRenderItem(item)) {
      return transparent ? this.#markerPipelines?.compactTransparent : this.#markerPipelines?.compactOpaque;
    }
    const pipelines = this.#pipelineSetFor(item);
    return transparent ? pipelines?.transparent : pipelines?.opaque;
  }

  #loadStreamPipelines(items: readonly SceneRenderItem[]): void {
    if (
      this.#streamPipelines ||
      this.#streamLoad ||
      !items.some(item => !isMarkerRenderItem(item) && !isMeshRenderItem(item))
    ) {
      return;
    }
    const device = this.#device;
    const format = this.#format;
    if (!device || !format) return;
    const token = this.#streamToken;
    this.#streamLoad = import('./stream-pipelines.js')
      .then(({ createStreamPipelines }) => {
        if (token === this.#streamToken && device === this.#device) {
          this.#streamPipelines = createStreamPipelines(device, format);
          this.#requestRender();
        }
      })
      .catch(error => console.error('Scene mesh pipeline initialization failed.', error))
      .finally(() => {
        if (token === this.#streamToken) this.#streamLoad = undefined;
      });
  }

  #loadMarkerPipelines(items: readonly SceneRenderItem[]): void {
    if (this.#markerPipelines || this.#markerLoad || !items.some(isMarkerRenderItem)) return;
    const device = this.#device;
    const format = this.#format;
    if (!device || !format) return;
    const token = this.#streamToken;
    this.#markerLoad = import('../markers/pipelines.js')
      .then(({ createMarkerGeometry, createMarkerPipelines }) => {
        if (token === this.#streamToken && device === this.#device) {
          this.#createMarkerGeometry = createMarkerGeometry;
          this.#markerPipelines = createMarkerPipelines(device, format);
          this.#requestRender();
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (token === this.#streamToken) this.#markerLoad = undefined;
      });
  }

  #loadMeshPipelines(items: readonly SceneRenderItem[]): void {
    if (this.#meshRenderer || this.#meshLoad || !items.some(isMeshRenderItem)) return;
    const device = this.#meshDevice();
    const format = this.#format;
    if (!device || !format) return;
    const token = this.#meshToken;
    this.#meshLoad = import('../mesh/renderer.js')
      .then(({ MeshRenderer }) => {
        if (token !== this.#meshToken || device !== this.#device) return;
        this.#meshRenderer = new MeshRenderer(device, format);
        this.#requestRender();
      })
      .catch(() => undefined)
      .finally(() => {
        if (token === this.#meshToken) this.#meshLoad = undefined;
      });
  }

  #meshDevice(): MeshRendererDevice | undefined {
    const device = this.#device;
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

  #drawPickItem(options: {
    readonly item: SceneRenderItem;
    readonly pass: GeometryPass;
    readonly pickId: number;
    readonly pipelines: PickPipelines;
    readonly transparent: boolean;
  }): void {
    const { item, pass, pickId, pipelines, transparent } = options;
    if (isMeshRenderItem(item)) {
      this.#meshRenderer?.drawPick({ item, pass, pickId, pipelines: pipelines.mesh, transparent });
      return;
    }
    const resources = this.#layers.get(item.layer);
    const device = this.#device;
    if (!resources || !device || isOutsideMarker(item, resources)) return;
    const pair = isMarkerRenderItem(item) ? pipelines.marker : pipelines[item.type];
    const pipeline = transparent ? pair.transparent : pair.opaque;
    const offset = isMarkerRenderItem(item) ? PICK_UNIFORM_OFFSETS.marker : PICK_UNIFORM_OFFSETS.stream;
    this.#writePickId(resources.uniform, offset, pickId);
    this.#bindLayer(pass, { groups: getDirectLayerBindGroups(device, pipeline, resources), pipeline });
    if (isMarkerRenderItem(item)) {
      this.#drawMarker(pass, { count: item.data.count, geometry: this.#geometries.get(item.data.kind) });
      this.#drawPickMarkerOutline(pass, item, pipelines);
    } else this.#drawStream(pass, item);
  }

  #writePickId(buffer: SceneGPUBuffer, offset: number, pickId: number): void {
    const device = this.#device;
    if (!device) return;
    this.#pickIdScratch[0] = pickId;
    device.queue.writeBuffer(buffer, offset, this.#pickIdScratch);
  }

  #drawPickMarkerOutline(pass: GeometryPass, item: MarkerRenderItem, pipelines: PickPipelines): void {
    const pipeline = pipelines.outline.opaque;
    const resources = this.#layers.get(item.layer);
    const geometry = this.#geometries.get(item.data.kind);
    const device = this.#device;
    if (
      !resources ||
      !geometry?.outlineVertex ||
      !geometry.outlineIndex ||
      !geometry.outlineIndexCount ||
      !device ||
      !item.data.outlineVisible
    ) {
      return;
    }
    this.#bindLayer(pass, { groups: getDirectLayerBindGroups(device, pipeline, resources), pipeline });
    pass.setVertexBuffer(0, geometry.outlineVertex);
    pass.setIndexBuffer(geometry.outlineIndex, 'uint32');
    pass.drawIndexed(geometry.outlineIndexCount, item.data.count);
  }

  #resetDeferredPipelines(): void {
    this.#streamToken += 1;
    this.#meshToken += 1;
    this.#markerLoad = undefined;
    this.#createMarkerGeometry = undefined;
    this.#markerPipelines = undefined;
    this.#markerCompactor = undefined;
    this.#markerCompactionDisabled = false;
    this.#streamLoad = undefined;
    this.#streamPipelines = undefined;
    this.#meshLoad = undefined;
    this.#meshRenderer?.disconnect();
    this.#meshRenderer = undefined;
  }

  #destroyResources(): void {
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
  }
}

export function supportsGeometryRendering(device: SceneGPUDevice): device is GeometryDevice {
  return (
    typeof device.createBindGroup === 'function' &&
    typeof device.createBuffer === 'function' &&
    typeof device.createRenderPipeline === 'function' &&
    typeof device.createShaderModule === 'function' &&
    typeof device.createTexture === 'function' &&
    typeof device.queue.writeBuffer === 'function'
  );
}

function getInstanceDraw(options: {
  readonly marker: boolean;
  readonly resources: LayerResources;
  readonly transparent: boolean;
  readonly useIndirect: boolean;
}): {
  readonly buffer: SceneGPUBuffer;
  readonly cache: WeakMap<SceneGPURenderPipeline, LayerBindGroups>;
  readonly indexBuffer?: SceneGPUBuffer;
  readonly indirect?: { readonly buffer: SceneGPUBuffer; readonly offset: number };
} {
  const { marker, resources, transparent, useIndirect } = options;
  const compact = marker && useIndirect && resources.compactionReady ? resources.compaction : undefined;
  if (!compact) {
    return { buffer: resources.instance.buffer, cache: resources.bindGroups };
  }
  if (transparent) {
    return {
      buffer: resources.instance.buffer,
      cache: resources.compactTransparentBindGroups,
      indexBuffer: compact.transparent,
      indirect: { buffer: compact.arguments, offset: 20 }
    };
  }
  return {
    buffer: resources.instance.buffer,
    cache: resources.compactOpaqueBindGroups,
    indexBuffer: compact.opaque,
    indirect: { buffer: compact.arguments, offset: 0 }
  };
}

function isOutsideMarker(item: SceneRenderItem, resources: LayerResources): boolean {
  return isMarkerRenderItem(item) && resources.frustumRelation === 'outside';
}

function getDirectLayerBindGroups(
  device: GeometryDevice,
  pipeline: SceneGPURenderPipeline,
  resources: LayerResources
): LayerBindGroups {
  return getLayerBindGroups({
    cache: resources.bindGroups,
    device,
    instanceBuffer: resources.instance.buffer,
    pipeline,
    uniform: resources.uniform
  });
}

function getLayerBindGroups(options: {
  cache: WeakMap<SceneGPURenderPipeline, LayerBindGroups>;
  device: GeometryDevice;
  indexBuffer?: SceneGPUBuffer;
  instanceBuffer: SceneGPUBuffer;
  pipeline: SceneGPURenderPipeline;
  uniform: SceneGPUBuffer;
}): LayerBindGroups {
  const cached = options.cache.get(options.pipeline);
  if (cached) return cached;
  const directGroups: readonly [SceneGPUBindGroup, SceneGPUBindGroup] = [
    options.device.createBindGroup({
      layout: options.pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: options.uniform } }]
    }),
    options.device.createBindGroup({
      layout: options.pipeline.getBindGroupLayout(1),
      entries: [{ binding: 0, resource: { buffer: options.instanceBuffer } }]
    })
  ];
  const groups: LayerBindGroups = options.indexBuffer
    ? [
        ...directGroups,
        options.device.createBindGroup({
          layout: options.pipeline.getBindGroupLayout(2),
          entries: [{ binding: 0, resource: { buffer: options.indexBuffer } }]
        })
      ]
    : directGroups;
  options.cache.set(options.pipeline, groups);
  return groups;
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

function destroyLayerResources(resources: LayerResources): void {
  destroyMarkerCompactionResources(resources.compaction);
  resources.instance.release();
  resources.uniform.destroy();
}

function sameFloatValues(left: Float32Array, right: Float32Array): boolean {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

function createUploadedGeometryBuffer(
  device: GeometryDevice,
  data: Float32Array | Uint32Array,
  usage: number
): SceneGPUBuffer {
  const buffer = device.createBuffer({ size: data.byteLength, usage: BUFFER_COPY_DST | usage });
  try {
    device.queue.writeBuffer(buffer, 0, data);
  } catch (error) {
    buffer.destroy();
    throw error;
  }
  return buffer;
}

function createMarkerGeometryResources(device: GeometryDevice, geometry: MarkerGeometry): GeometryResources {
  const buffers: SceneGPUBuffer[] = [];
  const createTracked = (data: Float32Array | Uint32Array, usage: number): SceneGPUBuffer => {
    const buffer = createUploadedGeometryBuffer(device, data, usage);
    buffers.push(buffer);
    return buffer;
  };
  try {
    const index = createTracked(geometry.indices, BUFFER_INDEX);
    const outlineIndex = geometry.outlineIndices ? createTracked(geometry.outlineIndices, BUFFER_INDEX) : undefined;
    const outlineVertex = geometry.outlineVertices ? createTracked(geometry.outlineVertices, BUFFER_VERTEX) : undefined;
    const vertex = createTracked(geometry.vertices, BUFFER_VERTEX);
    return {
      index,
      indexCount: geometry.indices.length,
      outlineIndex,
      outlineIndexCount: geometry.outlineIndices?.length,
      outlineVertex,
      vertex
    };
  } catch (error) {
    buffers.forEach(buffer => buffer.destroy());
    throw error;
  }
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
