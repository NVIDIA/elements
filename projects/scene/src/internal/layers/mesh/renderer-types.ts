// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { MeshRenderItem } from '../../rendering/render-items.js';

import type { MeshGPUState } from './gpu.js';
import type { HeightfieldGPUState } from '../heightfield/gpu.js';
import type { HeightfieldMeshData, MeshGeometryAttribute, MeshRenderData } from './render-data.js';
import type { MeshGeometryResources, MeshTextureResource } from './resources.js';
import type { ProcessedMeshGeometry } from './processing.js';
import type { MeshGeometrySource } from './preparation.js';
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
} from '../../gpu/platform.js';

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

export interface MeshGeometryPass extends SceneGPURenderPass {
  draw(vertexCount: number, instanceCount?: number): void;
  drawIndexed(indexCount: number, instanceCount?: number): void;
  setBindGroup(index: number, bindGroup: SceneGPUBindGroup): void;
  setIndexBuffer(buffer: SceneGPUBuffer, indexFormat: 'uint32'): void;
  setPipeline(pipeline: SceneGPURenderPipeline): void;
  setVertexBuffer(slot: number, buffer: SceneGPUBuffer): void;
}

interface MeshLayerBase {
  geometry: MeshGeometryResources;
  heightfieldSource?: HeightfieldMeshData;
  source: MeshGeometrySource;
  texture?: MeshTextureResource;
  readonly textureBindGroups: WeakMap<SceneGPURenderPipeline, TextureBindGroup>;
}

export interface CPUMeshLayerResources extends MeshLayerBase {
  processed: ProcessedMeshGeometry;
  readonly computation?: never;
}

interface ComputedMeshLayerResources extends MeshLayerBase {
  readonly computation: MeshGPUState;
  readonly processed?: never;
}

export type MeshLayerResources = CPUMeshLayerResources | ComputedMeshLayerResources;

export interface HeightfieldLayerResources {
  readonly geometry: MeshGeometryResources;
  readonly state: HeightfieldGPUState;
  readonly textureBindGroups: WeakMap<SceneGPURenderPipeline, TextureBindGroup>;
}

export type RenderableMeshResources = MeshLayerResources | HeightfieldLayerResources;

export interface TextureBindGroup {
  readonly bindGroup: SceneGPUBindGroup;
  readonly texture: SceneGPUTexture;
}

export interface MeshInstanceSource {
  readonly bytes: Uint8Array;
  readonly count: number;
  readonly ranges: readonly { readonly offset: number; readonly size: number }[];
}

export interface MeshAttributeUploadOptions {
  readonly attribute: Exclude<MeshGeometryAttribute, 'indices'>;
  readonly buffer: SceneGPUBuffer;
  readonly changed: boolean;
  readonly historyComplete: boolean;
  readonly data: MeshRenderData;
  readonly values: Float32Array;
}

export interface MeshPreparation {
  readonly item: MeshRenderItem;
  readonly source: MeshGeometrySource;
}

export interface PreparedMesh {
  readonly geometry: MeshGeometryResources;
  readonly processed: ProcessedMeshGeometry;
  readonly source: MeshGeometrySource;
}

export interface HeightfieldFallbackPreparation {
  readonly source: HeightfieldMeshData;
}

export interface PreparedHeightfieldFallback {
  readonly geometry: MeshGeometryResources;
  readonly processed: ProcessedMeshGeometry;
  readonly source: HeightfieldMeshData;
}

export interface HeightfieldTopologyPreparation {
  source: HeightfieldMeshData;
}
