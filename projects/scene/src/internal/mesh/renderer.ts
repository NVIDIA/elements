// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Matrix4 } from '../types.js';
import { identityMat4, multiplyPreciseMat4, writeMat4ToFloat32 } from '../math/mat4.js';
import type { SceneGPUCommandEncoder } from '../gpu/platform.js';
import { compileHeightfield, prepareHeightfield } from '../heightfield/compile.js';
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
  type MeshTextureResource
} from './resources.js';
import {
  continueMeshGeometryPreparation,
  prepareFlatGeometryUpdate,
  prepareMeshGeometry,
  processMeshGeometry,
  updateFlatGeometry,
  type ProcessedMeshGeometry
} from './processing.js';
import type { PickPipelinePair } from '../pick/pipelines.js';
import { PICK_UNIFORM_OFFSETS } from '../pick/uniform-offsets.js';
import type { MeshRenderItem } from '../rendering/render-items.js';
import type { HeightfieldMeshData, MeshGeometryAttribute, MeshRenderData } from './layer-state.js';
import { MARKER } from '../layouts/built-ins.js';
import type {
  SceneGPUBindGroup,
  SceneGPUBindGroupDescriptor,
  SceneGPUBuffer,
  SceneGPUBufferDescriptor,
  SceneGPUDevice,
  SceneGPUQueue,
  SceneGPURenderPipelineDescriptor,
  SceneGPURenderPass,
  SceneGPURenderPipeline,
  SceneGPUSampler,
  SceneGPUSamplerDescriptor,
  SceneGPUShaderModule,
  SceneGPUShaderModuleDescriptor,
  SceneGPUTexture,
  SceneGPUTextureDescriptor
} from '../gpu/platform.js';
import { hasSameUniformValues } from '../rendering/partition-resources.js';
import { createPartitionUniformResources, destroyPartitionUniformResources } from '../rendering/partition-resources.js';
import {
  acquireSharedInstanceBuffer,
  writeSharedInstanceBuffer,
  type SharedInstanceBufferLease
} from '../gpu/shared-instance-buffer.js';
import { createPreparationContext } from '../preparation.js';
import { prepareHeightfieldIndices } from '../heightfield/topology.js';
import {
  createIdentityMarkerBytes,
  heightfieldGrid,
  heightfieldPreparationWorkIsBounded,
  heightfieldTopologyWorkIsBounded,
  meshSource,
  meshSourceFromProcessed,
  meshUpload,
  requiresMeshPreparation,
  retainGeometryUploadRanges,
  sameMeshGeometrySource,
  sameMeshSources,
  type MeshGeometrySource
} from './preparation.js';

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
  createBindGroup(descriptor: SceneGPUBindGroupDescriptor): SceneGPUBindGroup;
  createBuffer(descriptor: SceneGPUBufferDescriptor): SceneGPUBuffer;
  createRenderPipeline(descriptor: SceneGPURenderPipelineDescriptor): SceneGPURenderPipeline;
  createSampler(descriptor?: SceneGPUSamplerDescriptor): SceneGPUSampler;
  createShaderModule(descriptor: SceneGPUShaderModuleDescriptor): SceneGPUShaderModule;
  createTexture(descriptor: SceneGPUTextureDescriptor): SceneGPUTexture;
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
  readonly instance: SharedInstanceBufferLease;
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

interface MeshLayerResources {
  geometry: MeshGeometryResources;
  heightfieldSource?: HeightfieldMeshData;
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

interface MeshPreparation {
  readonly item: MeshRenderItem;
  readonly source: MeshGeometrySource;
}

interface PreparedMesh {
  readonly geometry: MeshGeometryResources;
  readonly processed: ProcessedMeshGeometry;
  readonly source: MeshGeometrySource;
}

interface HeightfieldFallbackPreparation {
  readonly source: HeightfieldMeshData;
}

interface PreparedHeightfieldFallback {
  readonly geometry: MeshGeometryResources;
  readonly processed: ProcessedMeshGeometry;
  readonly source: HeightfieldMeshData;
}

interface HeightfieldTopologyPreparation {
  source: HeightfieldMeshData;
}

interface MeshInstanceSource {
  readonly bytes: Uint8Array;
  readonly count: number;
  readonly ranges: readonly { readonly offset: number; readonly size: number }[];
}

interface MeshAttributeUploadOptions {
  readonly attribute: Exclude<MeshGeometryAttribute, 'indices'>;
  readonly buffer: SceneGPUBuffer;
  readonly changed: boolean;
  readonly data: MeshRenderData;
  readonly values: Float32Array;
}

interface ReplaceGeometryResourcesOptions {
  readonly existing: MeshLayerResources | undefined;
  readonly heightfieldSource?: HeightfieldMeshData;
  readonly layer: HTMLElement;
  readonly prepared: PreparedMesh;
}

interface PublishMeshPreparationOptions {
  readonly existing: MeshLayerResources | undefined;
  readonly item: MeshRenderItem;
  readonly preparation: MeshPreparation;
  readonly processed: ProcessedMeshGeometry | null | undefined;
}

interface PublishMeshUpdateOptions {
  readonly existing: MeshLayerResources;
  readonly item: MeshRenderItem;
  readonly preparation: MeshPreparation;
  readonly processed: ProcessedMeshGeometry;
}

/** Deferred mesh-only GPU ownership and draw orchestration. */
export class MeshRenderer {
  #device: MeshRendererDevice;
  #heightfieldCompiler?: HeightfieldGPUCompiler;
  #heightfieldFallbackPreparations = new Map<HTMLElement, HeightfieldFallbackPreparation>();
  #heightfieldIndexPreparations = new Map<HTMLElement, HeightfieldTopologyPreparation>();
  #preparedHeightfields = new Map<HTMLElement, HeightfieldLayerResources>();
  #heightfieldStates = new Set<HeightfieldGPUState>();
  #heightfields = new Map<HTMLElement, HeightfieldLayerResources>();
  #instanceLayers = new Map<HTMLElement, LayerResources>();
  #layers = new Map<HTMLElement, MeshLayerResources>();
  #meshPreparations = new Map<HTMLElement, MeshPreparation>();
  #preparedHeightfieldFallbacks = new Map<HTMLElement, PreparedHeightfieldFallback>();
  #preparedMeshes = new Map<HTMLElement, PreparedMesh>();
  #pickIdScratch = new Uint32Array(1);
  #pipelines: MeshPipelines;
  #sampler: SceneGPUSampler;
  #uniformScratch = new Float32Array(40);
  #whiteTexture: SceneGPUTexture;
  readonly #onFailure: (error: unknown) => void;
  readonly #requestRender: () => void;

  constructor(
    device: MeshRendererDevice,
    format: string,
    callbacks: { readonly onFailure?: (error: unknown) => void; readonly requestRender?: () => void } = {}
  ) {
    this.#device = device;
    this.#onFailure = callbacks.onFailure ?? (() => undefined);
    this.#requestRender = callbacks.requestRender ?? (() => undefined);
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

  // eslint-disable-next-line max-statements -- Preparation dispatch keeps each retained-resource path explicit.
  prepare(item: MeshRenderItem, projection: Matrix4): void {
    if (!isReadyMesh(item)) {
      this.#cancelLayerPreparations(item.layer);
      return;
    }
    this.#cancelIncompatiblePreparations(item);
    if (item.data.heightfield && this.#heightfieldCompiler) {
      this.#prepareHeightfield(item, projection);
      return;
    }
    if (item.data.heightfield) {
      this.#prepareHeightfieldFallback(item, projection, item.data.heightfield);
      return;
    }
    const existing = this.#layers.get(item.layer);
    const installed = this.#installPreparedMesh(item, existing);
    const processed = installed ? installed.processed : this.#processGeometry(item, existing);
    if (!processed) {
      if (existing) this.#prepareRetainedMesh(item, projection, existing);
      return;
    }
    const resources = installed ?? this.#synchronizeGeometryResources(item, processed, existing);
    this.#synchronizeTexture(resources, item.data.texture);
    const layer = this.#ensureInstanceResources(item);
    if (!layer) return;
    this.#writeUniforms(layer, item, projection);
  }

  /** Reports whether the current mesh generation has drawable GPU data installed. */
  readyFor(item: MeshRenderItem): boolean {
    if (!isReadyMesh(item)) return true;
    const heightfield = item.data.heightfield;
    if (heightfield && this.#heightfieldCompiler) {
      const resources = this.#heightfields.get(item.layer);
      return Boolean(resources && sameHeightfieldSource(resources.state.source, heightfield));
    }
    const resources = this.#layers.get(item.layer);
    if (heightfield) {
      return Boolean(resources?.heightfieldSource && sameHeightfieldSource(resources.heightfieldSource, heightfield));
    }
    return Boolean(resources && !resources.heightfieldSource && sameMeshGeometrySource(resources.source, item));
  }

  #processGeometry(item: MeshRenderItem, existing: MeshLayerResources | undefined): ProcessedMeshGeometry | null {
    const pending = this.#meshPreparations.get(item.layer);
    if (existing && !existing.heightfieldSource && sameMeshGeometrySource(existing.source, item)) {
      return existing.processed;
    }
    if (requiresMeshPreparation(item.data)) {
      this.#scheduleMeshPreparation(item, existing);
      return null;
    }
    if (pending) this.#meshPreparations.delete(item.layer);
    if (!existing || existing.heightfieldSource || existing.source.topologyVersion !== item.data.topologyVersion) {
      return processMeshGeometry(item.data);
    }
    return updateFlatGeometry(item.data, existing.processed);
  }

  #scheduleMeshPreparation(item: MeshRenderItem, existing: MeshLayerResources | undefined): void {
    const source = meshSource(item);
    const current = this.#meshPreparations.get(item.layer);
    if (current && sameMeshSources(current.source, source)) return;
    const preparationItem = retainGeometryUploadRanges(item, current?.item);
    const preparation = { item: preparationItem, source };
    this.#meshPreparations.set(item.layer, preparation);
    const isCurrent = () => this.#meshPreparations.get(item.layer) === preparation;
    const context = createPreparationContext(isCurrent);
    const work =
      existing && !existing.heightfieldSource && existing.source.topologyVersion === item.data.topologyVersion
        ? prepareFlatGeometryUpdate(preparationItem.data, existing.processed, context)
        : prepareMeshGeometry(preparationItem.data, context);
    void work
      .then(processed => this.#publishMeshPreparation({ existing, item: preparationItem, preparation, processed }))
      .catch(error => {
        if (!isCurrent()) return;
        this.#meshPreparations.delete(item.layer);
        this.#onFailure(error);
      });
  }

  #publishMeshPreparation(options: PublishMeshPreparationOptions): void {
    const { existing, item, preparation, processed } = options;
    const isCurrent = this.#meshPreparations.get(item.layer) === preparation;
    if (processed === undefined || !isCurrent) return;
    if (processed === null) {
      this.#meshPreparations.delete(item.layer);
      return;
    }
    if (existing && this.#canUpdatePreparedMesh(existing, preparation.source, item.layer)) {
      this.#publishMeshUpdate({ existing, item, preparation, processed });
      return;
    }
    this.#publishMeshReplacement(item.layer, preparation, processed);
  }

  #publishMeshUpdate(options: PublishMeshUpdateOptions): void {
    const { existing, item, preparation, processed } = options;
    this.#uploadChangedBuffers(existing, processed, item);
    existing.processed = processed;
    existing.source = preparation.source;
    this.#meshPreparations.delete(item.layer);
    this.#requestRender();
  }

  #publishMeshReplacement(layer: HTMLElement, preparation: MeshPreparation, processed: ProcessedMeshGeometry): void {
    const geometry = createMeshGeometryResources(this.#device, meshUpload(processed));
    if (this.#meshPreparations.get(layer) !== preparation) {
      destroyMeshGeometryResources(geometry);
      return;
    }
    this.#meshPreparations.delete(layer);
    this.#replacePreparedMesh(layer, { geometry, processed, source: preparation.source });
    this.#requestRender();
  }

  #canUpdatePreparedMesh(existing: MeshLayerResources, source: MeshGeometrySource, layer: HTMLElement): boolean {
    return (
      !existing.heightfieldSource &&
      existing.source.topologyVersion === source.topologyVersion &&
      this.#layers.get(layer) === existing
    );
  }

  #installPreparedMesh(item: MeshRenderItem, existing: MeshLayerResources | undefined): MeshLayerResources | undefined {
    const prepared = this.#preparedMeshes.get(item.layer);
    if (!prepared) return undefined;
    this.#preparedMeshes.delete(item.layer);
    if (!sameMeshGeometrySource(prepared.source, item)) {
      destroyMeshGeometryResources(prepared.geometry);
      return undefined;
    }
    return this.#replaceGeometryResources({ existing, layer: item.layer, prepared });
  }

  #replacePreparedMesh(layer: HTMLElement, prepared: PreparedMesh): void {
    const previous = this.#preparedMeshes.get(layer);
    if (previous) destroyMeshGeometryResources(previous.geometry);
    this.#preparedMeshes.set(layer, prepared);
  }

  #prepareRetainedMesh(item: MeshRenderItem, projection: Matrix4, resources: MeshLayerResources): void {
    this.#synchronizeTexture(resources, item.data.texture);
    const layer = this.#ensureInstanceResources(item);
    if (layer) this.#writeUniforms(layer, item, projection);
  }

  #cancelIncompatiblePreparations(item: MeshRenderItem): void {
    if (item.data.heightfield) {
      this.#meshPreparations.delete(item.layer);
      this.#discardPreparedMesh(item.layer);
      return;
    }
    this.#heightfieldFallbackPreparations.delete(item.layer);
    this.#discardPreparedHeightfieldFallback(item.layer);
    this.#heightfieldIndexPreparations.delete(item.layer);
    this.#discardPreparedHeightfield(item.layer);
  }

  #cancelLayerPreparations(layer: HTMLElement): void {
    this.#heightfieldFallbackPreparations.delete(layer);
    this.#discardPreparedHeightfieldFallback(layer);
    this.#heightfieldIndexPreparations.delete(layer);
    this.#discardPreparedHeightfield(layer);
    this.#meshPreparations.delete(layer);
    this.#discardPreparedMesh(layer);
  }

  #synchronizeGeometryResources(
    item: MeshRenderItem,
    processed: ProcessedMeshGeometry,
    existing: MeshLayerResources | undefined
  ): MeshLayerResources {
    if (!existing || existing.heightfieldSource || existing.source.topologyVersion !== item.data.topologyVersion) {
      return this.#replaceGeometryResources({
        existing,
        layer: item.layer,
        prepared: {
          geometry: createMeshGeometryResources(this.#device, meshUpload(processed)),
          processed,
          source: meshSource(item)
        }
      });
    }
    this.#uploadChangedBuffers(existing, processed, item);
    existing.processed = processed;
    existing.source = meshSource(item);
    return existing;
  }

  #replaceGeometryResources(options: ReplaceGeometryResourcesOptions): MeshLayerResources {
    const { existing, heightfieldSource, layer, prepared } = options;
    if (existing) destroyMeshGeometryResources(existing.geometry);
    const replacement: MeshLayerResources = {
      geometry: prepared.geometry,
      processed: prepared.processed,
      source: prepared.source,
      textureBindGroups: new WeakMap<SceneGPURenderPipeline, TextureBindGroup>()
    };
    if (existing?.texture) replacement.texture = existing.texture;
    if (heightfieldSource) replacement.heightfieldSource = heightfieldSource;
    this.#layers.set(layer, replacement);
    return replacement;
  }

  #synchronizeTexture(resources: MeshLayerResources, texture: ImageBitmap | null): void {
    if (resources.texture?.source === texture) return;
    destroyMeshTextureResource(resources.texture);
    resources.texture = texture ? createMeshTextureResource(this.#device, texture) : undefined;
  }

  encodeCompute(encoder: SceneGPUCommandEncoder): void {
    this.#heightfieldCompiler?.encode(encoder, this.#heightfieldStates);
  }

  // eslint-disable-next-line complexity, max-statements -- Topology preparation preserves the last valid generation.
  #prepareHeightfield(item: MeshRenderItem, projection: Matrix4): void {
    const source = item.data.heightfield;
    const compiler = this.#heightfieldCompiler;
    if (!source || !compiler) return;
    let resources = this.#heightfields.get(item.layer);
    if (!resources || !sameHeightfieldTopology(resources.state.source, source)) {
      const prepared = this.#takePreparedHeightfield(item.layer, source);
      if (prepared) {
        if (resources) this.#destroyHeightfieldResources(resources);
        resources = prepared;
        this.#heightfieldStates.add(resources.state);
        this.#heightfields.set(item.layer, resources);
      } else if (heightfieldTopologyWorkIsBounded(source)) {
        this.#heightfieldIndexPreparations.delete(item.layer);
        if (resources) this.#destroyHeightfieldResources(resources);
        const state = compiler.create(source);
        resources = { geometry: state.geometry, state, textureBindGroups: new WeakMap() };
        this.#heightfieldStates.add(state);
        this.#heightfields.set(item.layer, resources);
      } else {
        this.#scheduleHeightfieldIndices(item.layer, source);
        const retained = this.#ensureInstanceResources(item);
        if (retained && resources) this.#writeUniforms(retained, item, projection);
        return;
      }
    } else if (!sameHeightfieldSource(resources.state.source, source)) {
      compiler.update(resources.state, source);
    }
    const layer = this.#ensureInstanceResources(item);
    if (layer) this.#writeUniforms(layer, item, projection);
  }

  #scheduleHeightfieldIndices(layer: HTMLElement, source: HeightfieldMeshData): void {
    const current = this.#heightfieldIndexPreparations.get(layer);
    if (current && sameHeightfieldTopology(current.source, source)) {
      current.source = source;
      return;
    }
    const preparation = { source };
    this.#heightfieldIndexPreparations.set(layer, preparation);
    const isCurrent = () => this.#heightfieldIndexPreparations.get(layer) === preparation;
    void prepareHeightfieldIndices(source.rows, source.columns, createPreparationContext(isCurrent))
      .then(indices => {
        if (!indices || !isCurrent()) return;
        const compiler = this.#heightfieldCompiler;
        if (!compiler) return;
        const state = compiler.create(preparation.source, indices);
        if (!isCurrent()) {
          destroyMeshGeometryResources(state.geometry);
          compiler.destroy(state);
          return;
        }
        this.#heightfieldIndexPreparations.delete(layer);
        this.#replacePreparedHeightfield(layer, {
          geometry: state.geometry,
          state,
          textureBindGroups: new WeakMap()
        });
        this.#requestRender();
      })
      .catch(error => {
        if (!isCurrent()) return;
        this.#heightfieldIndexPreparations.delete(layer);
        this.#onFailure(error);
      });
  }

  #takePreparedHeightfield(layer: HTMLElement, source: HeightfieldMeshData): HeightfieldLayerResources | undefined {
    const prepared = this.#preparedHeightfields.get(layer);
    if (!prepared) return undefined;
    this.#preparedHeightfields.delete(layer);
    if (sameHeightfieldSource(prepared.state.source, source)) return prepared;
    this.#destroyHeightfieldResources(prepared);
    return undefined;
  }

  #replacePreparedHeightfield(layer: HTMLElement, prepared: HeightfieldLayerResources): void {
    const previous = this.#preparedHeightfields.get(layer);
    if (previous) this.#destroyHeightfieldResources(previous);
    this.#preparedHeightfields.set(layer, prepared);
  }

  #prepareHeightfieldFallback(item: MeshRenderItem, projection: Matrix4, source: HeightfieldMeshData): void {
    const existing = this.#layers.get(item.layer);
    if (existing?.heightfieldSource && sameHeightfieldSource(existing.heightfieldSource, source)) {
      this.#prepareRetainedMesh(item, projection, existing);
      return;
    }
    const prepared = this.#takePreparedHeightfieldFallback(item.layer, source);
    if (prepared) {
      const resources = this.#replaceGeometryResources({
        existing,
        heightfieldSource: source,
        layer: item.layer,
        prepared: {
          geometry: prepared.geometry,
          processed: prepared.processed,
          source: meshSourceFromProcessed(item, prepared.processed)
        }
      });
      this.#prepareRetainedMesh(item, projection, resources);
      return;
    }
    if (heightfieldPreparationWorkIsBounded(source)) {
      this.#prepareBoundedHeightfieldFallback(item, projection, existing);
      return;
    }
    this.#scheduleHeightfieldFallback(item.layer, source);
    if (existing) this.#prepareRetainedMesh(item, projection, existing);
  }

  #prepareBoundedHeightfieldFallback(
    item: MeshRenderItem,
    projection: Matrix4,
    existing: MeshLayerResources | undefined
  ): void {
    const source = item.data.heightfield;
    if (!source) return;
    this.#heightfieldFallbackPreparations.delete(item.layer);
    const processed = processMeshGeometry({ ...compileHeightfield(heightfieldGrid(source)), uvs: null });
    if (!processed) return;
    const resources = this.#replaceGeometryResources({
      existing,
      heightfieldSource: source,
      layer: item.layer,
      prepared: {
        geometry: createMeshGeometryResources(this.#device, meshUpload(processed)),
        processed,
        source: meshSourceFromProcessed(item, processed)
      }
    });
    this.#prepareRetainedMesh(item, projection, resources);
  }

  #scheduleHeightfieldFallback(layer: HTMLElement, source: HeightfieldMeshData): void {
    const current = this.#heightfieldFallbackPreparations.get(layer);
    if (current && sameHeightfieldSource(current.source, source)) return;
    const preparation = { source };
    this.#heightfieldFallbackPreparations.set(layer, preparation);
    const isCurrent = () => this.#heightfieldFallbackPreparations.get(layer) === preparation;
    const context = createPreparationContext(isCurrent);
    void prepareHeightfield(heightfieldGrid(source), context)
      .then(compiled => (compiled ? continueMeshGeometryPreparation({ ...compiled, uvs: null }, context) : undefined))
      .then(processed => {
        if (!processed || !isCurrent()) return;
        const geometry = createMeshGeometryResources(this.#device, meshUpload(processed));
        if (!isCurrent()) {
          destroyMeshGeometryResources(geometry);
          return;
        }
        this.#heightfieldFallbackPreparations.delete(layer);
        this.#replacePreparedHeightfieldFallback(layer, { geometry, processed, source });
        this.#requestRender();
      })
      .catch(error => {
        if (!isCurrent()) return;
        this.#heightfieldFallbackPreparations.delete(layer);
        this.#onFailure(error);
      });
  }

  #takePreparedHeightfieldFallback(
    layer: HTMLElement,
    source: HeightfieldMeshData
  ): PreparedHeightfieldFallback | undefined {
    const prepared = this.#preparedHeightfieldFallbacks.get(layer);
    if (!prepared) return undefined;
    this.#preparedHeightfieldFallbacks.delete(layer);
    if (sameHeightfieldSource(prepared.source, source)) return prepared;
    destroyMeshGeometryResources(prepared.geometry);
    return undefined;
  }

  #replacePreparedHeightfieldFallback(layer: HTMLElement, prepared: PreparedHeightfieldFallback): void {
    this.#discardPreparedHeightfieldFallback(layer);
    this.#preparedHeightfieldFallbacks.set(layer, prepared);
  }

  #uploadChangedBuffers(resources: MeshLayerResources, processed: ProcessedMeshGeometry, item: MeshRenderItem): void {
    const { data } = item;
    const upload = meshUpload(processed);
    this.#uploadAttribute({
      attribute: 'positions',
      buffer: resources.geometry.positions,
      changed:
        resources.source.versions.positions !== data.geometryVersions.positions ||
        resources.source.positions !== data.positions,
      data,
      values: processed.positions
    });
    this.#uploadAttribute({
      attribute: 'normals',
      buffer: resources.geometry.normals,
      changed:
        resources.source.versions.normals !== data.geometryVersions.normals ||
        resources.source.normals !== data.normals ||
        resources.processed.normals !== processed.normals,
      data,
      values: processed.normals
    });
    this.#uploadAttribute({
      attribute: 'uvs',
      buffer: resources.geometry.uvs,
      changed: resources.source.versions.uvs !== data.geometryVersions.uvs || resources.source.uvs !== data.uvs,
      data,
      values: upload.uvs
    });
    this.#uploadAttribute({
      attribute: 'colors',
      buffer: resources.geometry.colors,
      changed:
        resources.source.versions.colors !== data.geometryVersions.colors || resources.source.colors !== data.colors,
      data,
      values: upload.colors
    });
  }

  #uploadAttribute(options: MeshAttributeUploadOptions): void {
    const { attribute, buffer, changed, data, values } = options;
    if (!changed) return;
    const ranges = data.geometryUploadRanges.filter(range => range.attribute === attribute);
    if (ranges.length === 0) {
      uploadMeshGeometryBuffer({ buffer, device: this.#device, values });
      return;
    }
    for (const range of ranges) uploadMeshGeometryBuffer({ buffer, device: this.#device, range, values });
  }

  draw(pass: GeometryPass, item: MeshRenderItem, transparent: boolean): void {
    if (!isReadyMesh(item)) return;
    const resources = this.#getRenderableResources(item.layer);
    const layer = this.#instanceLayers.get(item.layer);
    if (!resources || !layer || meshInstanceCount(item) === 0) return;
    const pipelines = this.#pipelines[item.data.shading ?? 'lit'];
    const pipeline = transparent ? pipelines.transparent : pipelines.opaque;
    const texture = getMeshTexture(resources) ?? this.#whiteTexture;
    pass.setVertexBuffer(0, resources.geometry.positions);
    pass.setVertexBuffer(1, resources.geometry.normals);
    pass.setVertexBuffer(2, resources.geometry.uvs);
    pass.setVertexBuffer(3, resources.geometry.colors);
    layer.partitions.forEach((partition, partitionIndex) => {
      this.#bindMesh(pass, { layer, partitionIndex, pipeline, resources, texture });
      if (resources.geometry.index) {
        pass.setIndexBuffer(resources.geometry.index, 'uint32');
        pass.drawIndexed(resources.geometry.indexCount, partition.recordCount);
      } else pass.draw(resources.geometry.vertexCount, partition.recordCount);
    });
  }

  /** Draws the prepared mesh through the matching ID pipeline. */
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
    pass.setVertexBuffer(0, resources.geometry.positions);
    pass.setVertexBuffer(1, resources.geometry.normals);
    pass.setVertexBuffer(2, resources.geometry.uvs);
    pass.setVertexBuffer(3, resources.geometry.colors);
    layer.partitions.forEach((partition, partitionIndex) => {
      this.#pickIdScratch[0] = pickId + partition.firstRecord;
      // eslint-disable-next-line local-performance/no-gpu-upload-in-loop -- @hotpath Each partition retains an independent ID base.
      this.#device.queue.writeBuffer(partition.uniform, PICK_UNIFORM_OFFSETS.mesh, this.#pickIdScratch);
      this.#bindMesh(pass, { layer, partitionIndex, pipeline, resources, texture });
      if (resources.geometry.index) {
        pass.setIndexBuffer(resources.geometry.index, 'uint32');
        pass.drawIndexed(resources.geometry.indexCount, partition.recordCount);
      } else pass.draw(resources.geometry.vertexCount, partition.recordCount);
    });
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
      }
    }
    for (const [layer, resources] of this.#instanceLayers) {
      if (!liveLayers.has(layer)) {
        destroyLayerResources(resources);
        this.#instanceLayers.delete(layer);
      }
    }
    this.#prunePreparations(liveLayers);
  }

  #prunePreparations(liveLayers: ReadonlySet<HTMLElement>): void {
    for (const collection of [
      this.#heightfieldFallbackPreparations,
      this.#heightfieldIndexPreparations,
      this.#meshPreparations
    ]) {
      for (const layer of collection.keys()) {
        if (!liveLayers.has(layer)) collection.delete(layer);
      }
    }
    for (const layer of this.#preparedHeightfieldFallbacks.keys()) {
      if (!liveLayers.has(layer)) this.#discardPreparedHeightfieldFallback(layer);
    }
    for (const layer of this.#preparedHeightfields.keys()) {
      if (!liveLayers.has(layer)) this.#discardPreparedHeightfield(layer);
    }
    for (const layer of this.#preparedMeshes.keys()) {
      if (!liveLayers.has(layer)) this.#discardPreparedMesh(layer);
    }
  }

  disconnect(): void {
    this.#layers.forEach(resources => this.#destroyMeshLayerResources(resources));
    this.#layers.clear();
    this.#heightfields.forEach(resources => this.#destroyHeightfieldResources(resources));
    this.#heightfields.clear();
    this.#heightfieldStates.clear();
    this.#heightfieldFallbackPreparations.clear();
    this.#heightfieldIndexPreparations.clear();
    this.#meshPreparations.clear();
    this.#clearPreparedResources();
    this.#instanceLayers.forEach(destroyLayerResources);
    this.#instanceLayers.clear();
    this.#whiteTexture.destroy?.();
  }

  #clearPreparedResources(): void {
    this.#preparedHeightfieldFallbacks.forEach(prepared => destroyMeshGeometryResources(prepared.geometry));
    this.#preparedHeightfieldFallbacks.clear();
    this.#preparedHeightfields.forEach(prepared => this.#destroyHeightfieldResources(prepared));
    this.#preparedHeightfields.clear();
    this.#preparedMeshes.forEach(prepared => destroyMeshGeometryResources(prepared.geometry));
    this.#preparedMeshes.clear();
  }

  #ensureInstanceResources(item: MeshRenderItem): LayerResources | undefined {
    const source = meshInstanceSource(item);
    if (!source) return undefined;
    const { bytes, count, ranges } = source;
    const existing = this.#instanceLayers.get(item.layer);
    if (!existing) {
      return this.#replaceInstanceResources(item.layer, bytes, count);
    }
    if (
      existing.instance.byteLength !== count * MARKER.stride ||
      (existing.instance.bytes !== bytes && !existing.instance.tryReassign(bytes))
    ) {
      return this.#replaceInstanceResources(item.layer, bytes, count);
    }
    ranges.forEach(range =>
      writeSharedInstanceBuffer({ bytes, device: this.#device, lease: existing.instance, range })
    );
    return existing;
  }

  #replaceInstanceResources(layer: HTMLElement, bytes: Uint8Array, count: number): LayerResources {
    const previous = this.#instanceLayers.get(layer);
    const instance = acquireSharedInstanceBuffer(this.#device, bytes, {
      byteLength: count * MARKER.stride,
      onValidationError: this.#onFailure,
      primitiveRecordCount: 1,
      stride: MARKER.stride
    });
    const uniformResources = createPartitionUniformResources({
      device: this.#device,
      instance,
      uniformLength: 40,
      uniformUsage: BUFFER_COPY_DST | BUFFER_UNIFORM
    });
    const resources = {
      partitions: uniformResources.map(partition => ({
        bindGroups: new WeakMap<SceneGPURenderPipeline, LayerBindGroups>(),
        ...partition
      })),
      instance
    };
    if (previous) destroyLayerResources(previous);
    this.#instanceLayers.set(layer, resources);
    return resources;
  }

  #writeUniforms(resources: LayerResources, item: MeshRenderItem, projection: Matrix4): void {
    const uniforms = this.#uniformScratch;
    uniforms.fill(0);
    writeMat4ToFloat32(uniforms, multiplyPreciseMat4(projection, item.frameMatrix));
    uniforms.set(identityMat4(), 16);
    uniforms.set(item.data.color, 32);
    for (const partition of resources.partitions) {
      if (hasSameUniformValues(partition.uniformValues, uniforms)) continue;
      partition.uniformValues.set(uniforms);
      // eslint-disable-next-line local-performance/no-gpu-upload-in-loop -- @hotpath Each partition owns one uniform buffer.
      this.#device.queue.writeBuffer(partition.uniform, 0, uniforms);
    }
  }

  #bindMesh(
    pass: GeometryPass,
    options: {
      readonly layer: LayerResources;
      readonly partitionIndex?: number;
      readonly pipeline: SceneGPURenderPipeline;
      readonly resources: RenderableMeshResources;
      readonly texture: SceneGPUTexture;
    }
  ): void {
    const { layer, pipeline, resources, texture } = options;
    const groups = this.#getLayerBindGroups(layer, pipeline, options.partitionIndex ?? 0);
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, groups[0]);
    pass.setBindGroup(1, groups[1]);
    pass.setBindGroup(2, this.#getTextureBindGroup(resources, pipeline, texture));
  }

  #getLayerBindGroups(
    layer: LayerResources,
    pipeline: SceneGPURenderPipeline,
    partitionIndex: number
  ): LayerBindGroups {
    const partition = layer.partitions[partitionIndex]!;
    const cached = partition.bindGroups.get(pipeline);
    if (cached) return cached;
    const groups: LayerBindGroups = [
      this.#createBindGroup(pipeline, 0, [{ binding: 0, resource: { buffer: partition.uniform } }]),
      this.#createBindGroup(pipeline, 1, [{ binding: 0, resource: { buffer: partition.buffer } }])
    ];
    partition.bindGroups.set(pipeline, groups);
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

  #createBindGroup(
    pipeline: SceneGPURenderPipeline,
    index: number,
    entries: SceneGPUBindGroupDescriptor['entries']
  ): SceneGPUBindGroup {
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

  #discardPreparedMesh(layer: HTMLElement): void {
    const prepared = this.#preparedMeshes.get(layer);
    if (prepared) destroyMeshGeometryResources(prepared.geometry);
    this.#preparedMeshes.delete(layer);
  }

  #discardPreparedHeightfield(layer: HTMLElement): void {
    const prepared = this.#preparedHeightfields.get(layer);
    if (prepared) this.#destroyHeightfieldResources(prepared);
    this.#preparedHeightfields.delete(layer);
  }

  #discardPreparedHeightfieldFallback(layer: HTMLElement): void {
    const prepared = this.#preparedHeightfieldFallbacks.get(layer);
    if (prepared) destroyMeshGeometryResources(prepared.geometry);
    this.#preparedHeightfieldFallbacks.delete(layer);
  }

  #getRenderableResources(layer: HTMLElement): RenderableMeshResources | undefined {
    return this.#layers.get(layer) ?? this.#heightfields.get(layer);
  }
}

function isReadyMesh(item: MeshRenderItem): boolean {
  return item.data.ready && !item.data.geometryError;
}

function meshInstanceCount(item: MeshRenderItem): number {
  return item.data.identityInstance ? 1 : (item.instances?.count ?? 0);
}

function getMeshTexture(resources: RenderableMeshResources | undefined): SceneGPUTexture | undefined {
  return resources && 'texture' in resources ? resources.texture?.texture : undefined;
}

function meshInstanceSource(item: MeshRenderItem): MeshInstanceSource | undefined {
  if (item.data.identityInstance) {
    return {
      bytes: IDENTITY_MARKER_BYTES,
      count: 1,
      ranges: []
    };
  }
  const bytes = item.instances?.bytes;
  const count = item.instances?.count ?? 0;
  return bytes && bytes.byteLength > 0 && count > 0
    ? { bytes, count, ranges: item.instances?.uploadRanges ?? [] }
    : undefined;
}

function destroyLayerResources(resources: LayerResources): void {
  destroyPartitionUniformResources(resources.instance, resources.partitions);
}
