// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable max-lines -- This renderer coordinates the shared lazy geometry subsystems. */
import {
  type SceneGPUBindGroup,
  type SceneGPUBuffer,
  type SceneGPUCommandEncoder,
  type SceneGPUDevice,
  type SceneGPURenderPass,
  type SceneGPURenderPipeline,
  type SceneGeometryDevice,
  supportsSceneGeometryRendering
} from '../gpu/platform.js';
import {
  acquireSharedInstanceBuffer,
  writeSharedInstanceBuffer,
  type SharedInstanceBufferLease
} from '../gpu/shared-instance-buffer.js';
import { createPerspectiveMatrix } from '../math/camera.js';
import { identityMat4, multiplyPreciseMat4, writeMat4ToFloat32 } from '../math/mat4.js';
import type { MeshRenderer, MeshRendererDevice } from '../mesh/renderer.js';
import type { MarkerGeometry, MarkerPipelines } from '../markers/pipelines.js';
import { MarkerBoundsClassifier, type MarkerFrustumRelation } from '../markers/bounds.js';
import {
  destroyMarkerCompactionResources,
  MarkerCompactor,
  markerCompactionIsEligible,
  supportsMarkerCompaction,
  type MarkerCompactionResources
} from '../markers/compaction.js';
import { PICK_UNIFORM_OFFSETS } from '../pick/uniform-offsets.js';
import type { PickPipelines } from '../pick/pipelines.js';
import type { PrimitiveKind } from '../primitive-geometry.js';
import type { Matrix4 } from '../types.js';
import type { LabelRenderer } from '../labels/renderer.js';
import {
  getPickItemCount,
  getStreamSize,
  isCubeMarkerRenderItem,
  isLabelRenderItem,
  isMarkerRenderItem,
  isMeshRenderItem,
  isOpaqueItem,
  isPickableItem,
  isTransparentItem,
  markerOutlinePassIsVisible,
  topologyUniform,
  type LineRenderItem,
  type MarkerRenderItem,
  type PointRenderItem,
  type SceneRenderItem,
  type TriangleRenderItem
} from './render-items.js';
import type { StreamPipelines } from './stream-pipelines.js';
import {
  getInstanceAllocation,
  getPartitionPickId,
  getPickUniformOffset,
  itemRequiresGeometry,
  writeInstancePartitionUniforms,
  type ConnectedLineDrawPartition,
  type InstanceAllocation
} from './instance-partitions.js';
import { createDeferredResource, DeferredResourceTask, type DeferredResource } from './deferred-resource.js';
import {
  createPartitionUniformResources,
  destroyPartitionUniformResources,
  hasSameUniformValues
} from './partition-resources.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_INDEX = 0x10;
const BUFFER_VERTEX = 0x20;
const BUFFER_UNIFORM = 0x40;

export type GeometryDevice = SceneGeometryDevice;

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
  readonly allocationKey: string;
  compactOpaqueBindGroups: WeakMap<SceneGPURenderPipeline, LayerBindGroups>;
  compactTransparentBindGroups: WeakMap<SceneGPURenderPipeline, LayerBindGroups>;
  compaction?: MarkerCompactionResources;
  compactionReady: boolean;
  frustumRelation: MarkerFrustumRelation;
  readonly instance: SharedInstanceBufferLease;
  readonly linePartitions?: readonly ConnectedLineDrawPartition[];
  readonly partitions: readonly LayerPartitionResources[];
}

interface LayerPartitionResources {
  readonly bindGroups: WeakMap<SceneGPURenderPipeline, LayerBindGroups>;
  readonly buffer: SceneGPUBuffer;
  readonly firstRecord: number;
  readonly recordCount: number;
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
  #cssViewport?: { readonly height: number; readonly width: number };
  #createMarkerGeometry?: (kind: PrimitiveKind) => MarkerGeometry;
  #device?: GeometryDevice;
  #format?: string;
  #generation = 0;
  #geometries = new Map<PrimitiveKind, GeometryResources>();
  #layers = new Map<HTMLElement, LayerResources>();
  readonly #labelTask = new DeferredResourceTask();
  #labelRenderer?: LabelRenderer;
  readonly #markerTask = new DeferredResourceTask();
  #markerCompactor?: MarkerCompactor;
  #markerCompactionDisabled = false;
  #markerBoundsClassifier = new MarkerBoundsClassifier();
  #markerPipelines?: MarkerPipelines;
  readonly #meshTask = new DeferredResourceTask();
  #meshRenderer?: MeshRenderer;
  #pickIdScratch = new Uint32Array(1);
  readonly #streamTask = new DeferredResourceTask();
  #streamPipelines?: StreamPipelines;
  #lineUniformScratch = new Float32Array(48);
  #uniformScratch = new Float32Array(40);
  #failure?: unknown;
  readonly #onFailure: (error: unknown) => void;
  readonly #requestRender: () => void;

  constructor(requestRender: () => void, onFailure: (error: unknown) => void = () => undefined) {
    this.#requestRender = requestRender;
    this.#onFailure = onFailure;
  }

  get active(): boolean {
    return this.#device !== undefined;
  }

  initialize(canvas: HTMLCanvasElement, device: SceneGPUDevice, format: string): void {
    this.disconnect();
    if (!supportsSceneGeometryRendering(device)) return;
    this.#canvas = canvas;
    this.#device = device;
    this.#format = format;
  }

  disconnect(): void {
    this.#resetDeferredPipelines();
    this.#destroyResources();
    this.#canvas = undefined;
    this.#cssViewport = undefined;
    this.#device = undefined;
    this.#format = undefined;
    this.#failure = undefined;
  }

  prepare(items: readonly SceneRenderItem[], viewProjection?: Matrix4): Matrix4 | undefined {
    const canvas = this.#canvas;
    if (!this.#device || !canvas) return undefined;
    this.#cssViewport = undefined;
    this.#pruneLayerResources(items);
    const projection = viewProjection ?? createDefaultViewProjection(canvas.width / canvas.height);
    const pixelRatio = items.some(item => !isMarkerRenderItem(item) && !isMeshRenderItem(item))
      ? this.#canvasPixelRatio()
      : 1;
    for (const item of items) this.#prepareItem(item, projection, pixelRatio);
    this.#loadLabelRenderer(items);
    this.#loadMarkerPipelines(items);
    this.#loadStreamPipelines(items);
    this.#loadMeshPipelines(items);
    return projection;
  }

  readyFor(items: readonly SceneRenderItem[], currentItems: readonly SceneRenderItem[] = items): boolean {
    this.#loadLabelRenderer(items);
    this.#loadMarkerPipelines(items);
    this.#loadStreamPipelines(items);
    this.#loadMeshPipelines(items);
    if (this.#failure !== undefined) return false;
    const currentByLayer = new Map(currentItems.map(item => [item.layer, item]));
    return items.filter(itemRequiresGeometry).every(item => {
      const current = currentByLayer.get(item.layer);
      if (isLabelRenderItem(item)) return this.#labelsReady(current);
      if (isMarkerRenderItem(item)) return Boolean(this.#markerPipelines && this.#createMarkerGeometry);
      if (isMeshRenderItem(item)) return this.#meshesReady(current);
      return this.#streamPipelines !== undefined;
    });
  }

  #labelsReady(item: SceneRenderItem | undefined): boolean {
    if (!this.#labelRenderer) return false;
    return !item || (isLabelRenderItem(item) && this.#labelRenderer.readyFor(item));
  }

  #meshesReady(item: SceneRenderItem | undefined): boolean {
    if (!this.#meshRenderer) return false;
    return !item || (isMeshRenderItem(item) && this.#meshRenderer.readyFor(item));
  }

  getPreparedCssViewport(): { readonly height: number; readonly width: number } | undefined {
    return this.#cssViewport;
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
    this.#labelRenderer?.prune(liveLayers);
  }

  // eslint-disable-next-line complexity, max-statements -- Each render-item family has an isolated preparation branch.
  #prepareItem(item: SceneRenderItem, projection: Matrix4, pixelRatio: number): void {
    if (isLabelRenderItem(item)) {
      const canvas = this.#canvas;
      if (canvas) {
        this.#labelRenderer?.prepare(item, projection, {
          pixelRatio,
          viewportHeight: canvas.height,
          viewportWidth: canvas.width
        });
      }
      return;
    }
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
    frame: { readonly pixelRatio: number; readonly projection: Matrix4 }
  ): void {
    for (let index = 0; index < resources.instance.partitions.length; index += 1) {
      const partition = resources.partitions[index]!;
      const uniforms = 'type' in item && item.type === 'line' ? this.#lineUniformScratch : this.#uniformScratch;
      uniforms.fill(0);
      writeMat4ToFloat32(uniforms, multiplyPreciseMat4(frame.projection, item.frameMatrix));
      uniforms.set(identityMat4(), 16);
      if (isMarkerRenderItem(item)) uniforms[32] = partition.recordCount;
      else if (!isMeshRenderItem(item) && !isLabelRenderItem(item)) {
        this.#writeStreamUniforms(uniforms, item, frame.pixelRatio);
        writeInstancePartitionUniforms(uniforms, {
          item,
          line: resources.linePartitions?.[index],
          recordCount: partition.recordCount
        });
      }
      if (hasSameUniformValues(partition.uniformValues, uniforms)) continue;
      partition.uniformValues.set(uniforms);
      // eslint-disable-next-line local-performance/no-gpu-upload-in-loop -- @hotpath Each partition owns one uniform buffer.
      this.#device?.queue.writeBuffer(partition.uniform, 0, uniforms);
    }
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
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    this.#cssViewport = { height: rect.height, width: rect.width };
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
    const allocation = getInstanceAllocation(item, device);
    if (!resources) {
      resources = this.#replaceLayerResources({ allocation, bytes, device, item, resources });
      return resources;
    }
    if (
      resources.instance.byteLength !== allocation.byteLength ||
      resources.allocationKey !== allocation.key ||
      (resources.instance.bytes !== bytes && !resources.instance.tryReassign(bytes))
    ) {
      return this.#replaceLayerResources({ allocation, bytes, device, item, resources });
    }
    for (const range of item.data.uploadRanges) {
      writeSharedInstanceBuffer({ bytes, device, lease: resources.instance, range });
    }
    return resources;
  }

  #replaceLayerResources(options: {
    allocation: InstanceAllocation;
    bytes: Uint8Array;
    device: GeometryDevice;
    item: SceneRenderItem;
    resources: LayerResources | undefined;
  }): LayerResources {
    const instance = acquireSharedInstanceBuffer(options.device, options.bytes, {
      ...options.allocation,
      onValidationError: error => this.#reportFailure(error)
    });
    const uniformLength = 'type' in options.item && options.item.type === 'line' ? 48 : 40;
    const uniformResources = createPartitionUniformResources({
      device: options.device,
      instance,
      uniformLength,
      uniformUsage: BUFFER_COPY_DST | BUFFER_UNIFORM
    });
    const replacement = {
      allocationKey: options.allocation.key,
      partitions: uniformResources.map(partition => ({
        bindGroups: new WeakMap<SceneGPURenderPipeline, LayerBindGroups>(),
        ...partition
      })),
      compactOpaqueBindGroups: new WeakMap<SceneGPURenderPipeline, LayerBindGroups>(),
      compactTransparentBindGroups: new WeakMap<SceneGPURenderPipeline, LayerBindGroups>(),
      compactionReady: false,
      frustumRelation: 'intersecting' as const,
      instance,
      linePartitions: options.allocation.linePartitions
    };
    if (options.resources) destroyLayerResources(options.resources);
    this.#layers.set(options.item.layer, replacement);
    return replacement;
  }

  // eslint-disable-next-line complexity -- The draw path dispatches across the closed render-item union.
  #drawItem(pass: GeometryPass, item: SceneRenderItem, transparent: boolean): void {
    if (isLabelRenderItem(item)) {
      if (transparent) this.#labelRenderer?.draw(pass, item);
      return;
    }
    if (isMeshRenderItem(item)) {
      this.#meshRenderer?.draw(pass, item, transparent);
      return;
    }
    const resources = this.#layers.get(item.layer);
    if (!resources || (isMarkerRenderItem(item) && resources.frustumRelation === 'outside')) return;
    for (let partitionIndex = 0; partitionIndex < resources.instance.partitions.length; partitionIndex += 1) {
      const draw = this.#getDrawResources(
        item,
        transparent,
        typeof pass.drawIndexedIndirect === 'function',
        partitionIndex
      );
      if (!draw) continue;
      this.#bindLayer(pass, draw);
      const count = resources.instance.partitions[partitionIndex]!.recordCount;
      if (isMarkerRenderItem(item)) {
        this.#drawMarker(pass, { count, geometry: draw.geometry, indirect: draw.indirect });
      } else this.#drawStream(pass, item, count, resources.linePartitions?.[partitionIndex]);
    }
  }

  // eslint-disable-next-line max-params -- @hotpath This per-partition render path avoids allocating an options object for every draw.
  #getDrawResources(
    item: SceneRenderItem,
    transparent: boolean,
    useIndirect: boolean,
    partitionIndex: number
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
    const partition = resources.partitions[partitionIndex]!;
    const instance = getInstanceDraw({
      marker: isMarkerRenderItem(item),
      partition,
      partitioned: resources.instance.partitions.length > 1,
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
        uniform: partition.uniform,
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

  #prepareMarkerCompaction(resources: LayerResources, item: MarkerRenderItem): void {
    if (!markerCompactionIsEligible(resources.instance.partitions.length, item.data.count, item.data.outlineVisible)) {
      this.#clearMarkerCompaction(resources);
      return;
    }
    if (resources.frustumRelation !== 'intersecting') return;
    const device = this.#device;
    if (!device) return;
    if (this.#markerCompactionDisabled) return;
    this.#initializeMarkerCompactor(device);
    if (!this.#markerCompactor || resources.compaction) return;
    try {
      resources.compaction = this.#markerCompactor.createResources(
        resources.instance.buffer,
        resources.partitions[0]!.uniform,
        resources.instance.byteLength
      );
    } catch {
      this.#markerCompactionDisabled = true;
    }
  }

  #initializeMarkerCompactor(device: GeometryDevice): void {
    if (this.#markerCompactor || !supportsMarkerCompaction(device)) return;
    try {
      this.#markerCompactor = new MarkerCompactor(device);
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

  #drawMarkerOutline(pass: GeometryPass, item: MarkerRenderItem, transparent: boolean): void {
    const draw = this.#getMarkerOutlineDraw(item, transparent);
    if (!draw) return;
    const { device, geometry, pipeline, resources } = draw;
    pass.setVertexBuffer(0, geometry.outlineVertex);
    pass.setIndexBuffer(geometry.outlineIndex, 'uint32');
    resources.instance.partitions.forEach((partition, index) => {
      this.#bindLayer(pass, { groups: getDirectLayerBindGroups(device, pipeline, resources, index), pipeline });
      pass.drawIndexed(geometry.outlineIndexCount!, partition.recordCount);
    });
  }

  #getMarkerOutlineDraw(item: MarkerRenderItem, transparent: boolean) {
    const resources = this.#layers.get(item.layer);
    if (!resources || resources.frustumRelation === 'outside') return undefined;
    const geometry = getOutlineGeometry(this.#geometries.get(item.data.kind));
    if (!geometry) return undefined;
    if (!markerOutlinePassIsVisible(item, transparent)) return undefined;
    const pipeline = transparent ? this.#markerPipelines?.outlineTransparent : this.#markerPipelines?.outlineOpaque;
    const device = this.#device;
    return pipeline && device ? { device, geometry, pipeline, resources } : undefined;
  }

  // eslint-disable-next-line max-params -- @hotpath This per-partition render path avoids allocating an options object for every draw.
  #drawStream(
    pass: GeometryPass,
    item: PointRenderItem | LineRenderItem | TriangleRenderItem,
    count = item.data.count,
    line?: ConnectedLineDrawPartition
  ): void {
    if (item.type === 'point') pass.draw(count * 6);
    else if (item.type === 'triangle') pass.draw(count);
    else if (line) pass.draw(line.segmentCount * 6 + line.joinCount * 3);
  }

  #pipelineSetFor(item: SceneRenderItem): RenderPipelines | undefined {
    if (isMarkerRenderItem(item)) return this.#markerPipelines;
    if (isMeshRenderItem(item) || isLabelRenderItem(item)) return undefined;
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
      this.#streamTask.status === 'loading' ||
      !items.some(item => !isMarkerRenderItem(item) && !isMeshRenderItem(item) && !isLabelRenderItem(item))
    ) {
      return;
    }
    const device = this.#device;
    const format = this.#format;
    if (!device || !format) return;
    const generation = this.#generation;
    void this.#streamTask.start({
      isCurrent: () => this.#isCurrentGeneration(generation, device, format),
      load: async (): Promise<DeferredResource> => {
        const { createStreamPipelines } = await import('./stream-pipelines.js');
        return createDeferredResource(
          () => createStreamPipelines(device, format),
          pipelines => (this.#streamPipelines = pipelines),
          pipelines => {
            if (this.#streamPipelines === pipelines) this.#streamPipelines = undefined;
          }
        );
      },
      onFailure: error => this.#reportFailure(error),
      onReady: () => this.#requestRender()
    });
  }

  #loadMarkerPipelines(items: readonly SceneRenderItem[]): void {
    if (this.#markerPipelines || this.#markerTask.status === 'loading' || !items.some(isMarkerRenderItem)) return;
    const device = this.#device;
    const format = this.#format;
    if (!device || !format) return;
    const generation = this.#generation;
    void this.#markerTask.start({
      isCurrent: () => this.#isCurrentGeneration(generation, device, format),
      load: async (): Promise<DeferredResource> => {
        const { createMarkerGeometry, createMarkerPipelines } = await import('../markers/pipelines.js');
        return createDeferredResource(
          () => ({ createMarkerGeometry, pipelines: createMarkerPipelines(device, format) }),
          value => {
            this.#createMarkerGeometry = value.createMarkerGeometry;
            this.#markerPipelines = value.pipelines;
          },
          value => {
            if (this.#markerPipelines === value.pipelines) {
              this.#createMarkerGeometry = undefined;
              this.#markerPipelines = undefined;
            }
          }
        );
      },
      onFailure: error => this.#reportFailure(error),
      onReady: () => this.#requestRender()
    });
  }

  #loadMeshPipelines(items: readonly SceneRenderItem[]): void {
    if (this.#meshRenderer || this.#meshTask.status === 'loading' || !items.some(isMeshRenderItem)) return;
    const device = this.#meshDevice();
    const format = this.#format;
    if (!device || !format) {
      this.#reportFailure(new DOMException('Scene mesh rendering is unavailable.', 'NotSupportedError'));
      return;
    }
    const generation = this.#generation;
    void this.#meshTask.start({
      isCurrent: () => this.#isCurrentGeneration(generation, device, format),
      load: async (): Promise<DeferredResource> => {
        const { MeshRenderer } = await import('../mesh/renderer.js');
        return createDeferredResource(
          () =>
            new MeshRenderer(device, format, {
              onFailure: error => {
                if (this.#isCurrentGeneration(generation, device, format)) this.#reportFailure(error);
              },
              requestRender: () => this.#requestRender()
            }),
          renderer => (this.#meshRenderer = renderer),
          renderer => {
            if (this.#meshRenderer === renderer) {
              renderer.disconnect();
              this.#meshRenderer = undefined;
            }
          }
        );
      },
      onFailure: error => this.#reportFailure(error),
      onReady: () => this.#requestRender()
    });
  }

  #loadLabelRenderer(items: readonly SceneRenderItem[]): void {
    if (this.#labelRenderer || this.#labelTask.status === 'loading' || !items.some(isLabelRenderItem)) return;
    const device = this.#device;
    const format = this.#format;
    if (!device || !format) return;
    const generation = this.#generation;
    void this.#labelTask.start({
      isCurrent: () => this.#isCurrentGeneration(generation, device, format),
      load: async (): Promise<DeferredResource> => {
        const { LabelRenderer, supportsLabelRenderer } = await import('../labels/renderer.js');
        if (!supportsLabelRenderer(device)) {
          throw new DOMException('Scene label rendering is unavailable.', 'NotSupportedError');
        }
        return createDeferredResource(
          () =>
            new LabelRenderer(
              device,
              () => this.#requestRender(),
              error => {
                if (this.#isCurrentGeneration(generation, device, format)) this.#reportFailure(error);
              }
            ),
          renderer => (this.#labelRenderer = renderer),
          renderer => {
            if (this.#labelRenderer === renderer) {
              renderer.disconnect();
              this.#labelRenderer = undefined;
            }
          }
        );
      },
      onFailure: error => this.#reportFailure(error),
      onReady: () => this.#requestRender()
    });
  }

  #meshDevice(): MeshRendererDevice | undefined {
    const device = this.#device;
    return device && supportsMeshRendererDevice(device) ? device : undefined;
  }

  // eslint-disable-next-line complexity -- Picking mirrors each render-item draw path.
  #drawPickItem(options: {
    readonly item: SceneRenderItem;
    readonly pass: GeometryPass;
    readonly pickId: number;
    readonly pipelines: PickPipelines;
    readonly transparent: boolean;
  }): void {
    const { item, pass, pickId, pipelines, transparent } = options;
    if (isLabelRenderItem(item)) {
      this.#labelRenderer?.drawPick(pass, item, pickId);
      return;
    }
    if (isMeshRenderItem(item)) {
      this.#meshRenderer?.drawPick({ item, pass, pickId, pipelines: pipelines.mesh, transparent });
      return;
    }
    const resources = this.#layers.get(item.layer);
    const device = this.#device;
    if (!resources || !device || isOutsideMarker(item, resources)) return;
    const pair = isMarkerRenderItem(item) ? pipelines.marker : pipelines[item.type];
    const pipeline = transparent ? pair.transparent : pair.opaque;
    const offset = getPickUniformOffset(item);
    resources.instance.partitions.forEach((partition, index) => {
      const layerPartition = resources.partitions[index]!;
      this.#writePickId(layerPartition.uniform, offset, getPartitionPickId(item, partition.firstRecord, pickId));
      this.#bindLayer(pass, {
        groups: getDirectLayerBindGroups(device, pipeline, resources, index),
        pipeline
      });
      if (isMarkerRenderItem(item)) {
        this.#drawMarker(pass, { count: partition.recordCount, geometry: this.#geometries.get(item.data.kind) });
      } else this.#drawStream(pass, item, partition.recordCount, resources.linePartitions?.[index]);
    });
    if (isMarkerRenderItem(item)) this.#drawPickMarkerOutline(pass, item, pipelines, pickId);
  }

  #writePickId(buffer: SceneGPUBuffer, offset: number, pickId: number): void {
    const device = this.#device;
    if (!device) return;
    this.#pickIdScratch[0] = pickId;
    device.queue.writeBuffer(buffer, offset, this.#pickIdScratch);
  }

  // eslint-disable-next-line max-params -- @hotpath This per-partition pick path avoids allocating an options object for every draw.
  #drawPickMarkerOutline(pass: GeometryPass, item: MarkerRenderItem, pipelines: PickPipelines, pickId: number): void {
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
    pass.setVertexBuffer(0, geometry.outlineVertex);
    pass.setIndexBuffer(geometry.outlineIndex, 'uint32');
    resources.instance.partitions.forEach((partition, index) => {
      const layerPartition = resources.partitions[index]!;
      this.#writePickId(layerPartition.uniform, PICK_UNIFORM_OFFSETS.marker, pickId + partition.firstRecord);
      this.#bindLayer(pass, { groups: getDirectLayerBindGroups(device, pipeline, resources, index), pipeline });
      pass.drawIndexed(geometry.outlineIndexCount!, partition.recordCount);
    });
  }

  #resetDeferredPipelines(): void {
    this.#generation += 1;
    this.#markerTask.reset();
    this.#createMarkerGeometry = undefined;
    this.#markerPipelines = undefined;
    this.#markerCompactor = undefined;
    this.#markerCompactionDisabled = false;
    this.#labelTask.reset();
    this.#labelRenderer = undefined;
    this.#streamTask.reset();
    this.#streamPipelines = undefined;
    this.#meshTask.reset();
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
  }

  #reportFailure(error: unknown): void {
    if (this.#failure !== undefined) return;
    this.#failure = error;
    this.#onFailure(error);
  }

  #isCurrentGeneration(generation: number, device: GeometryDevice, format: string): boolean {
    return this.#generation === generation && this.#device === device && this.#format === format;
  }
}

function getInstanceDraw(options: {
  readonly marker: boolean;
  readonly partition: LayerPartitionResources;
  readonly partitioned: boolean;
  readonly resources: LayerResources;
  readonly transparent: boolean;
  readonly useIndirect: boolean;
}): {
  readonly buffer: SceneGPUBuffer;
  readonly cache: WeakMap<SceneGPURenderPipeline, LayerBindGroups>;
  readonly indexBuffer?: SceneGPUBuffer;
  readonly indirect?: { readonly buffer: SceneGPUBuffer; readonly offset: number };
} {
  const { marker, partition, partitioned, resources, transparent, useIndirect } = options;
  const compact = marker && !partitioned && useIndirect && resources.compactionReady ? resources.compaction : undefined;
  if (!compact) {
    return { buffer: partition.buffer, cache: partition.bindGroups };
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

function getOutlineGeometry(geometry: GeometryResources | undefined): Required<GeometryResources> | undefined {
  if (!geometry?.outlineVertex || !geometry.outlineIndex || !geometry.outlineIndexCount) return undefined;
  return geometry as Required<GeometryResources>;
}

// eslint-disable-next-line max-params -- @hotpath This per-partition render path avoids allocating an options object for every bind lookup.
function getDirectLayerBindGroups(
  device: GeometryDevice,
  pipeline: SceneGPURenderPipeline,
  resources: LayerResources,
  partitionIndex = 0
): LayerBindGroups {
  const partition = resources.partitions[partitionIndex]!;
  return getLayerBindGroups({
    cache: partition.bindGroups,
    device,
    instanceBuffer: partition.buffer,
    pipeline,
    uniform: partition.uniform
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

function supportsMeshRendererDevice(device: GeometryDevice): device is MeshRendererDevice {
  return (
    typeof device.createSampler === 'function' &&
    typeof device.queue.copyExternalImageToTexture === 'function' &&
    typeof device.queue.writeTexture === 'function'
  );
}

function destroyLayerResources(resources: LayerResources): void {
  destroyMarkerCompactionResources(resources.compaction);
  destroyPartitionUniformResources(resources.instance, resources.partitions);
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

function createDefaultViewProjection(aspect: number): Float64Array {
  const inverseSqrt2 = Math.SQRT1_2;
  const view = new Float64Array([
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
  return multiplyPreciseMat4(createPerspectiveMatrix(Math.PI / 4, aspect, 0.01, 10_000), view);
}
