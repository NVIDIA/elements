// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Mat4 } from '../types.js';
import type { SceneGPUCommandEncoder } from '../gpu/platform.js';
import { compileHeightfield } from '../heightfield/compile.js';
import {
  HeightfieldGPUCompiler,
  sameHeightfieldSource,
  sameHeightfieldTopology,
  supportsHeightfieldGPU,
  type HeightfieldGPUState
} from '../heightfield/gpu.js';
import { createMeshPipelines, type MeshPipelines } from './pipelines.js';
import {
  createMeshGeometryResources,
  createMeshTextureResource,
  createMeshWhiteTexture,
  destroyMeshGeometryResources,
  destroyMeshTextureResource,
  uploadMeshGeometryBuffer,
  type MeshGeometryResources,
  type MeshGeometryUpload,
  type MeshTextureResource
} from './resources.js';
import { processMeshGeometry, updateFlatGeometry, type ProcessedMeshGeometry } from './processing.js';
import type { PickPipelinePair } from '../pick/pipelines.js';
import { PICK_UNIFORM_OFFSETS } from '../pick/uniform-offsets.js';
import type { MeshRenderItem } from '../rendering/render-items.js';
import type { MeshRenderData } from './layer-state.js';
import type {
  SceneGPUBindGroup,
  SceneGPUBuffer,
  SceneGPUDevice,
  SceneGPUQueue,
  SceneGPURenderPass,
  SceneGPURenderPipeline,
  SceneGPUTexture
} from '../gpu/platform.js';
import { acquireSharedInstanceBuffer, type SharedInstanceBufferLease } from '../gpu/shared-instance-buffer.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_UNIFORM = 0x40;
const IDENTITY_MARKER_BYTES = createIdentityMarkerBytes();

export interface MeshRendererDevice extends SceneGPUDevice {
  readonly queue: SceneGPUQueue & {
    copyExternalImageToTexture(
      source: { source: ImageBitmap },
      destination: { texture: SceneGPUTexture },
      copySize: { width: number; height: number }
    ): void;
    writeBuffer(buffer: SceneGPUBuffer, offset: number, data: ArrayBufferView): void;
    writeTexture(
      destination: { texture: SceneGPUTexture },
      data: ArrayBufferView,
      layout: { bytesPerRow: number },
      size: { width: number; height: number }
    ): void;
  };
  createBindGroup(descriptor: unknown): SceneGPUBindGroup;
  createBuffer(descriptor: unknown): SceneGPUBuffer;
  createRenderPipeline(descriptor: unknown): SceneGPURenderPipeline;
  createSampler(descriptor?: unknown): object;
  createShaderModule(descriptor: unknown): unknown;
  createTexture(descriptor: unknown): SceneGPUTexture;
}

interface GeometryPass extends SceneGPURenderPass {
  draw(vertexCount: number, instanceCount?: number): void;
  drawIndexed(indexCount: number, instanceCount?: number): void;
  setBindGroup(index: number, bindGroup: SceneGPUBindGroup): void;
  setIndexBuffer(buffer: SceneGPUBuffer, indexFormat: 'uint32'): void;
  setPipeline(pipeline: SceneGPURenderPipeline): void;
  setVertexBuffer(slot: number, buffer: SceneGPUBuffer): void;
}

type LayerBindGroups = readonly [SceneGPUBindGroup, SceneGPUBindGroup];

interface LayerResources {
  readonly bindGroups: WeakMap<SceneGPURenderPipeline, LayerBindGroups>;
  readonly instance: SharedInstanceBufferLease;
  readonly uniform: SceneGPUBuffer;
  readonly uniformValues: Float32Array;
}

interface MeshLayerResources {
  geometry: MeshGeometryResources;
  processed: ProcessedMeshGeometry;
  source: MeshGeometrySource;
  texture?: MeshTextureResource;
  readonly textureBindGroups: WeakMap<SceneGPURenderPipeline, TextureBindGroup>;
}

interface HeightfieldLayerResources {
  readonly geometry: MeshGeometryResources;
  readonly state: HeightfieldGPUState;
  readonly textureBindGroups: WeakMap<SceneGPURenderPipeline, TextureBindGroup>;
}

type RenderableMeshResources = MeshLayerResources | HeightfieldLayerResources;

interface TextureBindGroup {
  readonly bindGroup: SceneGPUBindGroup;
  readonly texture: SceneGPUTexture;
}

interface MeshGeometrySource {
  readonly colors: Float32Array | null;
  readonly normals: Float32Array | null;
  readonly positions: Float32Array | null;
  readonly topologyVersion: number;
  readonly uvs: Float32Array | null;
}

interface MeshInstanceSource {
  readonly bytes: Uint8Array;
  readonly ranges: readonly { readonly offset: number; readonly size: number }[];
}

/** Deferred mesh-only GPU ownership and draw orchestration. */
export class MeshRenderer {
  #device: MeshRendererDevice;
  #heightfieldCompiler?: HeightfieldGPUCompiler;
  #heightfieldFallbacks = new Map<HTMLElement, { readonly data: MeshRenderData; readonly version: number }>();
  #heightfieldStates = new Set<HeightfieldGPUState>();
  #heightfields = new Map<HTMLElement, HeightfieldLayerResources>();
  #instanceLayers = new Map<HTMLElement, LayerResources>();
  #layers = new Map<HTMLElement, MeshLayerResources>();
  #pickIdScratch = new Uint32Array(1);
  #pipelines: MeshPipelines;
  #sampler: object;
  #uniformScratch = new Float32Array(40);
  #whiteTexture: SceneGPUTexture;

  constructor(device: MeshRendererDevice, format: string) {
    this.#device = device;
    this.#pipelines = createMeshPipelines(device, format);
    this.#sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
    this.#whiteTexture = createMeshWhiteTexture(device);
    if (supportsHeightfieldGPU(device)) {
      try {
        this.#heightfieldCompiler = new HeightfieldGPUCompiler(device);
      } catch {
        // Heightfield compute is an optional optimization; regular meshes still render without it.
        this.#heightfieldCompiler = undefined;
      }
    }
  }

  // eslint-disable-next-line complexity, max-statements -- Mesh synchronization keeps its deferred ownership contained.
  prepare(item: MeshRenderItem, projection: Mat4): void {
    if (!isReadyMesh(item)) return;
    if (item.data.heightfield && this.#heightfieldCompiler) {
      this.#prepareHeightfield(item, projection);
      return;
    }
    const preparedItem = item.data.heightfield ? this.#heightfieldFallbackItem(item) : item;
    const existing = this.#layers.get(preparedItem.layer);
    const processed =
      existing && existing.source.topologyVersion === preparedItem.data.topologyVersion
        ? sameMeshGeometrySource(existing.source, preparedItem)
          ? existing.processed
          : updateFlatGeometry(preparedItem.data, existing.processed)
        : processMeshGeometry(preparedItem.data);
    if (!processed) return;
    let resources = existing;
    if (!resources || resources.source.topologyVersion !== preparedItem.data.topologyVersion) {
      if (resources) this.#destroyMeshLayerResources(resources);
      resources = {
        geometry: createMeshGeometryResources(this.#device, meshUpload(processed)),
        processed,
        source: meshSource(preparedItem),
        textureBindGroups: new WeakMap<SceneGPURenderPipeline, TextureBindGroup>()
      };
      this.#layers.set(preparedItem.layer, resources);
    } else {
      this.#uploadChangedBuffers(resources, processed, preparedItem);
      resources.processed = processed;
      resources.source = meshSource(preparedItem);
    }
    if (resources.texture?.source !== preparedItem.data.texture) {
      destroyMeshTextureResource(resources.texture);
      resources.texture = preparedItem.data.texture
        ? createMeshTextureResource(this.#device, preparedItem.data.texture)
        : undefined;
    }
    const layer = this.#ensureInstanceResources(item);
    if (!layer) return;
    this.#writeUniforms(layer, item, projection);
  }

  encodeCompute(encoder: SceneGPUCommandEncoder): void {
    this.#heightfieldCompiler?.encode(encoder, this.#heightfieldStates);
  }

  #prepareHeightfield(item: MeshRenderItem, projection: Mat4): void {
    const source = item.data.heightfield;
    const compiler = this.#heightfieldCompiler;
    if (!source || !compiler) return;
    let resources = this.#heightfields.get(item.layer);
    if (!resources || !sameHeightfieldTopology(resources.state.source, source)) {
      if (resources) this.#destroyHeightfieldResources(resources);
      const state = compiler.create(source);
      resources = { geometry: state.geometry, state, textureBindGroups: new WeakMap() };
      this.#heightfieldStates.add(state);
      this.#heightfields.set(item.layer, resources);
    } else if (!sameHeightfieldSource(resources.state.source, source)) {
      compiler.update(resources.state, source);
    }
    const layer = this.#ensureInstanceResources(item);
    if (layer) this.#writeUniforms(layer, item, projection);
  }

  #heightfieldFallbackItem(item: MeshRenderItem): MeshRenderItem {
    const cached = this.#heightfieldFallbacks.get(item.layer);
    if (cached?.version === item.data.version) return { ...item, data: cached.data };
    const source = item.data.heightfield;
    if (!source) return item;
    const compiled = compileHeightfield({
      columns: source.columns,
      heights: source.heights,
      origin: source.origin,
      rows: source.rows,
      spacing: source.spacing,
      ...(source.colors ? { colors: source.colors } : {})
    });
    const { heightfield: _heightfield, ...data } = item.data;
    const fallback = { ...data, ...compiled };
    this.#heightfieldFallbacks.set(item.layer, { data: fallback, version: item.data.version });
    return { ...item, data: fallback };
  }

  #uploadChangedBuffers(resources: MeshLayerResources, processed: ProcessedMeshGeometry, item: MeshRenderItem): void {
    const { data } = item;
    if (resources.source.positions !== data.positions) {
      uploadMeshGeometryBuffer(this.#device, resources.geometry.positions, processed.positions);
    }
    if (resources.source.normals !== data.normals || resources.processed.normals !== processed.normals) {
      uploadMeshGeometryBuffer(this.#device, resources.geometry.normals, processed.normals);
    }
    if (resources.source.uvs !== data.uvs) {
      uploadMeshGeometryBuffer(this.#device, resources.geometry.uvs, meshUpload(processed).uvs);
    }
    if (resources.source.colors !== data.colors) {
      uploadMeshGeometryBuffer(this.#device, resources.geometry.colors, meshUpload(processed).colors);
    }
  }

  // eslint-disable-next-line complexity, max-statements -- Mesh drawing has optional resources, instances, shading, and indexed geometry.
  draw(pass: GeometryPass, item: MeshRenderItem, transparent: boolean): void {
    if (!isReadyMesh(item)) return;
    const resources = this.#getRenderableResources(item.layer);
    const layer = this.#instanceLayers.get(item.layer);
    const pipelines = this.#pipelines[item.data.shading ?? 'lit'];
    const pipeline = transparent ? pipelines.transparent : pipelines.opaque;
    const texture = getMeshTexture(resources) ?? this.#whiteTexture;
    const count = item.data.identityInstance ? 1 : (item.instances?.count ?? 0);
    if (!resources || !layer || count === 0) return;
    this.#bindMesh(pass, { layer, pipeline, resources, texture });
    pass.setVertexBuffer(0, resources.geometry.positions);
    pass.setVertexBuffer(1, resources.geometry.normals);
    pass.setVertexBuffer(2, resources.geometry.uvs);
    pass.setVertexBuffer(3, resources.geometry.colors);
    if (resources.geometry.index) {
      pass.setIndexBuffer(resources.geometry.index, 'uint32');
      pass.drawIndexed(resources.geometry.indexCount, count);
    } else pass.draw(resources.geometry.vertexCount, count);
  }

  /** Draws the prepared mesh through the matching ID pipeline. */
  // eslint-disable-next-line complexity, max-statements -- Pick drawing also writes the per-layer ID uniform.
  drawPick(options: {
    readonly item: MeshRenderItem;
    readonly pass: GeometryPass;
    readonly pickId: number;
    readonly pipelines: PickPipelinePair;
    readonly transparent: boolean;
  }): void {
    const { item, pass, pickId, pipelines, transparent } = options;
    if (!isReadyMesh(item)) return;
    const resources = this.#getRenderableResources(item.layer);
    const layer = this.#instanceLayers.get(item.layer);
    const pipeline = transparent ? pipelines.transparent : pipelines.opaque;
    const texture = getMeshTexture(resources) ?? this.#whiteTexture;
    const count = item.data.identityInstance ? 1 : (item.instances?.count ?? 0);
    if (!resources || !layer || count === 0) return;
    this.#pickIdScratch[0] = pickId;
    this.#device.queue.writeBuffer(layer.uniform, PICK_UNIFORM_OFFSETS.mesh, this.#pickIdScratch);
    this.#bindMesh(pass, { layer, pipeline, resources, texture });
    pass.setVertexBuffer(0, resources.geometry.positions);
    pass.setVertexBuffer(1, resources.geometry.normals);
    pass.setVertexBuffer(2, resources.geometry.uvs);
    pass.setVertexBuffer(3, resources.geometry.colors);
    if (resources.geometry.index) {
      pass.setIndexBuffer(resources.geometry.index, 'uint32');
      pass.drawIndexed(resources.geometry.indexCount, count);
    } else pass.draw(resources.geometry.vertexCount, count);
  }

  prune(liveLayers: ReadonlySet<HTMLElement>): void {
    for (const [layer, resources] of this.#layers) {
      if (!liveLayers.has(layer)) {
        this.#destroyMeshLayerResources(resources);
        this.#layers.delete(layer);
      }
    }
    for (const [layer, resources] of this.#heightfields) {
      if (!liveLayers.has(layer)) {
        this.#destroyHeightfieldResources(resources);
        this.#heightfields.delete(layer);
        this.#heightfieldFallbacks.delete(layer);
      }
    }
    for (const layer of this.#heightfieldFallbacks.keys()) {
      if (!liveLayers.has(layer)) this.#heightfieldFallbacks.delete(layer);
    }
    for (const [layer, resources] of this.#instanceLayers) {
      if (!liveLayers.has(layer)) {
        destroyLayerResources(resources);
        this.#instanceLayers.delete(layer);
      }
    }
  }

  disconnect(): void {
    this.#layers.forEach(resources => this.#destroyMeshLayerResources(resources));
    this.#layers.clear();
    this.#heightfields.forEach(resources => this.#destroyHeightfieldResources(resources));
    this.#heightfields.clear();
    this.#heightfieldStates.clear();
    this.#heightfieldFallbacks.clear();
    this.#instanceLayers.forEach(destroyLayerResources);
    this.#instanceLayers.clear();
    this.#whiteTexture.destroy?.();
  }

  #ensureInstanceResources(item: MeshRenderItem): LayerResources | undefined {
    const source = meshInstanceSource(item);
    if (!source) return undefined;
    const { bytes, ranges } = source;
    const existing = this.#instanceLayers.get(item.layer);
    if (!existing) {
      return this.#replaceInstanceResources(item.layer, bytes);
    }
    if (existing.instance.bytes !== bytes && !existing.instance.tryReassign(bytes)) {
      return this.#replaceInstanceResources(item.layer, bytes);
    }
    ranges.forEach(range =>
      this.#writeInstances({ buffer: existing.instance.buffer, bytes, offset: range.offset, size: range.size })
    );
    return existing;
  }

  #replaceInstanceResources(layer: HTMLElement, bytes: Uint8Array): LayerResources {
    const previous = this.#instanceLayers.get(layer);
    const instance = acquireSharedInstanceBuffer(this.#device, bytes);
    let uniform: SceneGPUBuffer;
    try {
      uniform = this.#device.createBuffer({ size: 160, usage: BUFFER_COPY_DST | BUFFER_UNIFORM });
    } catch (error) {
      instance.release();
      throw error;
    }
    const resources = {
      bindGroups: new WeakMap<SceneGPURenderPipeline, LayerBindGroups>(),
      instance,
      uniform,
      uniformValues: new Float32Array(40).fill(Number.NaN)
    };
    if (previous) destroyLayerResources(previous);
    this.#instanceLayers.set(layer, resources);
    return resources;
  }

  #writeInstances(options: { buffer: SceneGPUBuffer; bytes: Uint8Array; offset: number; size: number }): void {
    this.#device.queue.writeBuffer(
      options.buffer,
      options.offset,
      options.bytes.subarray(options.offset, options.offset + options.size)
    );
  }

  #writeUniforms(resources: LayerResources, item: MeshRenderItem, projection: Mat4): void {
    const uniforms = this.#uniformScratch;
    uniforms.fill(0);
    uniforms.set(projection);
    uniforms.set(item.frameMatrix, 16);
    uniforms.set(item.data.color, 32);
    if (sameFloatValues(resources.uniformValues, uniforms)) return;
    resources.uniformValues.set(uniforms);
    this.#device.queue.writeBuffer(resources.uniform, 0, uniforms);
  }

  #bindMesh(
    pass: GeometryPass,
    options: {
      readonly layer: LayerResources;
      readonly pipeline: SceneGPURenderPipeline;
      readonly resources: RenderableMeshResources;
      readonly texture: SceneGPUTexture;
    }
  ): void {
    const { layer, pipeline, resources, texture } = options;
    const groups = this.#getLayerBindGroups(layer, pipeline);
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, groups[0]);
    pass.setBindGroup(1, groups[1]);
    pass.setBindGroup(2, this.#getTextureBindGroup(resources, pipeline, texture));
  }

  #getLayerBindGroups(layer: LayerResources, pipeline: SceneGPURenderPipeline): LayerBindGroups {
    const cached = layer.bindGroups.get(pipeline);
    if (cached) return cached;
    const groups: LayerBindGroups = [
      this.#createBindGroup(pipeline, 0, [{ binding: 0, resource: { buffer: layer.uniform } }]),
      this.#createBindGroup(pipeline, 1, [{ binding: 0, resource: { buffer: layer.instance.buffer } }])
    ];
    layer.bindGroups.set(pipeline, groups);
    return groups;
  }

  #getTextureBindGroup(
    resources: RenderableMeshResources,
    pipeline: SceneGPURenderPipeline,
    texture: SceneGPUTexture
  ): SceneGPUBindGroup {
    const cached = resources.textureBindGroups.get(pipeline);
    if (cached?.texture === texture) return cached.bindGroup;
    const bindGroup = this.#createBindGroup(pipeline, 2, [
      { binding: 0, resource: this.#sampler },
      { binding: 1, resource: texture.createView() }
    ]);
    resources.textureBindGroups.set(pipeline, { bindGroup, texture });
    return bindGroup;
  }

  #createBindGroup(pipeline: SceneGPURenderPipeline, index: number, entries: unknown[]): SceneGPUBindGroup {
    return this.#device.createBindGroup({ layout: pipeline.getBindGroupLayout(index), entries });
  }

  #destroyMeshLayerResources(resources: MeshLayerResources): void {
    destroyMeshGeometryResources(resources.geometry);
    destroyMeshTextureResource(resources.texture);
  }

  #destroyHeightfieldResources(resources: HeightfieldLayerResources): void {
    this.#heightfieldStates.delete(resources.state);
    destroyMeshGeometryResources(resources.geometry);
    this.#heightfieldCompiler?.destroy(resources.state);
  }

  #getRenderableResources(layer: HTMLElement): RenderableMeshResources | undefined {
    return this.#layers.get(layer) ?? this.#heightfields.get(layer);
  }
}

function isReadyMesh(item: MeshRenderItem): boolean {
  return item.data.ready && !item.data.geometryError;
}

function getMeshTexture(resources: RenderableMeshResources | undefined): SceneGPUTexture | undefined {
  return resources && 'texture' in resources ? resources.texture?.texture : undefined;
}

function meshSource(item: MeshRenderItem): MeshGeometrySource {
  return {
    colors: item.data.colors,
    normals: item.data.normals,
    positions: item.data.positions,
    topologyVersion: item.data.topologyVersion,
    uvs: item.data.uvs
  };
}

function sameMeshGeometrySource(source: MeshGeometrySource, item: MeshRenderItem): boolean {
  return (
    source.positions === item.data.positions &&
    source.normals === item.data.normals &&
    source.uvs === item.data.uvs &&
    source.colors === item.data.colors
  );
}

function meshInstanceSource(item: MeshRenderItem): MeshInstanceSource | undefined {
  if (item.data.identityInstance) {
    return {
      bytes: IDENTITY_MARKER_BYTES,
      ranges: []
    };
  }
  const bytes = item.instances?.bytes;
  return bytes && bytes.byteLength > 0 ? { bytes, ranges: item.instances?.uploadRanges ?? [] } : undefined;
}

function meshUpload(processed: ProcessedMeshGeometry): MeshGeometryUpload {
  const vertices = processed.vertexCount;
  return {
    colors: processed.colors ?? filledMeshValues(vertices, 4, 1),
    indices: processed.indices,
    normals: processed.normals,
    positions: processed.positions,
    uvs: processed.uvs ?? new Float32Array(vertices * 2)
  };
}

function filledMeshValues(vertices: number, width: number, value: number): Float32Array {
  return new Float32Array(vertices * width).fill(value);
}

function createIdentityMarkerBytes(): Uint8Array {
  const bytes = new Uint8Array(48);
  const view = new DataView(bytes.buffer);
  view.setFloat32(24, 1, true);
  view.setFloat32(28, 1, true);
  view.setFloat32(32, 1, true);
  view.setFloat32(36, 1, true);
  view.setFloat32(40, 1, true);
  bytes.set([255, 255, 255, 255], 40);
  return bytes;
}

function destroyLayerResources(resources: LayerResources): void {
  resources.instance.release();
  resources.uniform.destroy();
}

function sameFloatValues(left: Float32Array, right: Float32Array): boolean {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}
