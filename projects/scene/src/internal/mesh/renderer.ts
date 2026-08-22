// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Mat4 } from '../types.js';
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
import type { MeshRenderItem } from '../../scene/rendering/renderer.js';
import type {
  SceneGPUBindGroup,
  SceneGPUBuffer,
  SceneGPUDevice,
  SceneGPUQueue,
  SceneGPURenderPass,
  SceneGPURenderPipeline,
  SceneGPUTexture
} from '../gpu/platform.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_UNIFORM = 0x40;
const BUFFER_STORAGE = 0x80;

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
  readonly instance: SceneGPUBuffer;
  readonly instanceBytes: number;
  readonly uniform: SceneGPUBuffer;
}

interface MeshLayerResources {
  geometry: MeshGeometryResources;
  processed: ProcessedMeshGeometry;
  source: MeshGeometrySource;
  texture?: MeshTextureResource;
  readonly textureBindGroups: WeakMap<SceneGPURenderPipeline, TextureBindGroup>;
}

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

/** Deferred mesh-only GPU ownership and draw orchestration. */
export class MeshRenderer {
  #device: MeshRendererDevice;
  #instanceLayers = new Map<HTMLElement, LayerResources>();
  #layers = new Map<HTMLElement, MeshLayerResources>();
  #pipelines: MeshPipelines;
  #rebuildCount = 0;
  #sampler: object;
  #uniformScratch = new Float32Array(40);
  #uploadCount = 0;
  #whiteTexture: SceneGPUTexture;

  constructor(device: MeshRendererDevice, format: string) {
    this.#device = device;
    this.#pipelines = createMeshPipelines(device, format);
    this.#sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
    this.#whiteTexture = createMeshWhiteTexture(device);
  }

  get rebuildCount(): number {
    return this.#rebuildCount;
  }

  get uploadCount(): number {
    return this.#uploadCount;
  }

  // eslint-disable-next-line complexity, max-statements -- Mesh synchronization keeps its deferred ownership contained.
  prepare(item: MeshRenderItem, projection: Mat4): void {
    if (!isReadyMesh(item)) return;
    const existing = this.#layers.get(item.layer);
    const processed =
      existing && existing.source.topologyVersion === item.data.topologyVersion
        ? updateFlatGeometry(item.data, existing.processed)
        : processMeshGeometry(item.data);
    if (!processed) return;
    let resources = existing;
    if (!resources || resources.source.topologyVersion !== item.data.topologyVersion) {
      if (resources) this.#destroyMeshLayerResources(resources);
      resources = {
        geometry: createMeshGeometryResources(this.#device, meshUpload(processed)),
        processed,
        source: meshSource(item),
        textureBindGroups: new WeakMap<SceneGPURenderPipeline, TextureBindGroup>()
      };
      this.#layers.set(item.layer, resources);
      this.#rebuildCount += 1;
    } else {
      this.#uploadChangedBuffers(resources, processed, item);
      resources.processed = processed;
      resources.source = meshSource(item);
    }
    if (resources.texture?.source !== item.data.texture) {
      destroyMeshTextureResource(resources.texture);
      resources.texture = item.data.texture ? createMeshTextureResource(this.#device, item.data.texture) : undefined;
    }
    const layer = this.#ensureInstanceResources(item);
    if (!layer) return;
    this.#writeUniforms(layer.uniform, item, projection);
  }

  #uploadChangedBuffers(resources: MeshLayerResources, processed: ProcessedMeshGeometry, item: MeshRenderItem): void {
    const { data } = item;
    let uploaded = false;
    if (resources.source.positions !== data.positions) {
      uploadMeshGeometryBuffer(this.#device, resources.geometry.positions, processed.positions);
      uploaded = true;
    }
    if (resources.source.normals !== data.normals || resources.processed.normals !== processed.normals) {
      uploadMeshGeometryBuffer(this.#device, resources.geometry.normals, processed.normals);
      uploaded = true;
    }
    if (resources.source.uvs !== data.uvs) {
      uploadMeshGeometryBuffer(this.#device, resources.geometry.uvs, meshUpload(processed).uvs);
      uploaded = true;
    }
    if (resources.source.colors !== data.colors) {
      uploadMeshGeometryBuffer(this.#device, resources.geometry.colors, meshUpload(processed).colors);
      uploaded = true;
    }
    if (uploaded) this.#uploadCount += 1;
  }

  // eslint-disable-next-line complexity -- Mesh drawing has optional resources, instances, and indexed geometry.
  draw(pass: GeometryPass, item: MeshRenderItem, transparent: boolean): void {
    if (!isReadyMesh(item)) return;
    const resources = this.#layers.get(item.layer);
    const layer = this.#instanceLayers.get(item.layer);
    const pipeline = transparent ? this.#pipelines.transparent : this.#pipelines.opaque;
    const texture = resources?.texture?.texture ?? this.#whiteTexture;
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
    const resources = this.#layers.get(item.layer);
    const layer = this.#instanceLayers.get(item.layer);
    const pipeline = transparent ? pipelines.transparent : pipelines.opaque;
    const texture = resources?.texture?.texture ?? this.#whiteTexture;
    const count = item.data.identityInstance ? 1 : (item.instances?.count ?? 0);
    if (!resources || !layer || count === 0) return;
    this.#device.queue.writeBuffer(layer.uniform, PICK_UNIFORM_OFFSETS.mesh, new Uint32Array([pickId]));
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
    this.#instanceLayers.forEach(destroyLayerResources);
    this.#instanceLayers.clear();
    this.#whiteTexture.destroy?.();
  }

  #ensureInstanceResources(item: MeshRenderItem): LayerResources | undefined {
    const identity = identityMarkerBytes();
    const bytes = item.data.identityInstance ? identity : item.instances?.bytes;
    if (!bytes || bytes.byteLength === 0) return undefined;
    const ranges = item.data.identityInstance
      ? [{ offset: 0, size: identity.byteLength }]
      : (item.instances?.uploadRanges ?? []);
    const existing = this.#instanceLayers.get(item.layer);
    if (!existing || existing.instanceBytes !== bytes.byteLength) {
      return this.#replaceInstanceResources(item.layer, bytes);
    }
    ranges.forEach(range =>
      this.#writeInstances({ buffer: existing.instance, bytes, offset: range.offset, size: range.size })
    );
    return existing;
  }

  #replaceInstanceResources(layer: HTMLElement, bytes: Uint8Array): LayerResources {
    const previous = this.#instanceLayers.get(layer);
    if (previous) destroyLayerResources(previous);
    const instance = this.#device.createBuffer({ size: bytes.byteLength, usage: BUFFER_COPY_DST | BUFFER_STORAGE });
    const uniform = this.#device.createBuffer({ size: 160, usage: BUFFER_COPY_DST | BUFFER_UNIFORM });
    const resources = {
      bindGroups: new WeakMap<SceneGPURenderPipeline, LayerBindGroups>(),
      instance,
      instanceBytes: bytes.byteLength,
      uniform
    };
    this.#instanceLayers.set(layer, resources);
    this.#writeInstances({ buffer: instance, bytes, offset: 0, size: bytes.byteLength });
    return resources;
  }

  #writeInstances(options: { buffer: SceneGPUBuffer; bytes: Uint8Array; offset: number; size: number }): void {
    this.#device.queue.writeBuffer(
      options.buffer,
      options.offset,
      options.bytes.subarray(options.offset, options.offset + options.size)
    );
  }

  #writeUniforms(buffer: SceneGPUBuffer, item: MeshRenderItem, projection: Mat4): void {
    const uniforms = this.#uniformScratch;
    uniforms.fill(0);
    uniforms.set(projection);
    uniforms.set(item.frameMatrix, 16);
    uniforms.set(item.data.color, 32);
    this.#device.queue.writeBuffer(buffer, 0, uniforms);
  }

  #bindMesh(
    pass: GeometryPass,
    options: {
      readonly layer: LayerResources;
      readonly pipeline: SceneGPURenderPipeline;
      readonly resources: MeshLayerResources;
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
      this.#createBindGroup(pipeline, 1, [{ binding: 0, resource: { buffer: layer.instance } }])
    ];
    layer.bindGroups.set(pipeline, groups);
    return groups;
  }

  #getTextureBindGroup(
    resources: MeshLayerResources,
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
}

function isReadyMesh(item: MeshRenderItem): boolean {
  return item.data.ready && !item.data.geometryError;
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

function identityMarkerBytes(): Uint8Array {
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
  resources.instance.destroy();
  resources.uniform.destroy();
}
