// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { vi, type Mock } from 'vitest';
import type {
  SceneGPUBufferDescriptor,
  SceneGPUDeviceLostInfo,
  SceneGPUShaderModuleDescriptor,
  SceneGPURenderPipelineDescriptor,
  SceneGPUTextureDescriptor
} from '../src/internal/gpu/platform.js';
import type { MeshRendererDevice } from '../src/internal/layers/mesh/renderer.js';
import type { GeometryDevice } from '../src/internal/rendering/geometry-renderer.js';
import type {
  LabelRenderItem,
  LineRenderItem,
  MarkerRenderItem,
  MeshRenderItem
} from '../src/internal/rendering/render-items.js';
import { identityMat4 } from '../src/internal/math/mat4.js';
import {
  registerMarkerLayer,
  setLayerInstances,
  takeMarkerLayerRenderData
} from '../src/internal/layers/markers/layer-state.js';
import { MarkerBuffer } from '../src/internal/layers/markers/buffer.js';
import { registerMeshLayer, replaceMeshGeometry, getMeshRenderData } from '../src/internal/layers/mesh/layer-state.js';
import {
  registerStreamingLayer,
  setStreamingLayerSource,
  takeStreamingLayerRenderData
} from '../src/internal/layers/streaming/layer-state.js';
import { LINE_VERTEX } from '../src/internal/records/layouts/built-ins.js';
import { LineVertexBuffer } from '../src/internal/layers/lines/buffer.js';
import type { LineTopology } from '../src/internal/layers/lines/data.js';
import { LabelBuffer } from '../src/internal/layers/labels/buffer.js';
import {
  registerLabelLayer,
  setLabelLayerSource,
  takeLabelLayerRenderData
} from '../src/internal/layers/labels/layer-state.js';

interface TestGpu {
  readonly buffers: Array<{ destroy: Mock; size: number }>;
  readonly device: MeshRendererDevice & GeometryDevice;
  readonly mapped: Uint8Array;
  readonly pass: {
    draw: Mock;
    drawIndexed: Mock;
    end: Mock;
    setBindGroup: Mock;
    setIndexBuffer: Mock;
    setPipeline: Mock;
    setVertexBuffer: Mock;
    setScissorRect: Mock;
  };
  readonly textures: Array<{ destroy: Mock }>;
}

export function createGpu(): TestGpu {
  const buffers: Array<{ destroy: Mock; size: number }> = [];
  const textures: Array<{ destroy: Mock }> = [];
  const mapped = new Uint8Array(512);
  const pass = {
    draw: vi.fn(),
    drawIndexed: vi.fn(),
    end: vi.fn(),
    setBindGroup: vi.fn(),
    setIndexBuffer: vi.fn(),
    setPipeline: vi.fn(),
    setVertexBuffer: vi.fn(),
    setScissorRect: vi.fn()
  };
  const device = {
    lost: new Promise<SceneGPUDeviceLostInfo>(() => {}),
    queue: { submit: vi.fn(), writeBuffer: vi.fn(), writeTexture: vi.fn(), copyExternalImageToTexture: vi.fn() },
    createBuffer: vi.fn((descriptor: SceneGPUBufferDescriptor) => {
      const buffer = {
        destroy: vi.fn(),
        size: descriptor.size,
        mapAsync: async () => {},
        getMappedRange: () => mapped.buffer,
        unmap: vi.fn()
      };
      buffers.push(buffer);
      return buffer;
    }),
    createTexture: vi.fn((_descriptor: SceneGPUTextureDescriptor) => {
      const texture = { destroy: vi.fn(), createView: () => ({}) };
      textures.push(texture);
      return texture;
    }),
    createBindGroup: vi.fn(() => ({})),
    createSampler: vi.fn(() => ({})),
    createShaderModule: vi.fn((_descriptor: SceneGPUShaderModuleDescriptor) => ({})),
    createRenderPipeline: vi.fn((_descriptor: SceneGPURenderPipelineDescriptor) => ({
      getBindGroupLayout: () => ({})
    })),
    createCommandEncoder: () => ({ beginRenderPass: () => pass, copyTextureToBuffer: vi.fn(), finish: () => ({}) }),
    destroy: vi.fn(),
    pushErrorScope: vi.fn(),
    popErrorScope: async () => null
  } satisfies MeshRendererDevice & GeometryDevice;
  return { buffers, device, mapped, pass, textures };
}

export function createMeshItem(): MeshRenderItem {
  const layer = document.createElement('div');
  registerMarkerLayer(layer, 'cube');
  registerMeshLayer(layer);
  replaceMeshGeometry(layer, {
    positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
    normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1])
  });
  return {
    data: getMeshRenderData(layer),
    frameMatrix: identityMat4(),
    instances: undefined,
    interactive: true,
    layer,
    type: 'mesh'
  };
}

export function createMarkerItem(count = 1): MarkerRenderItem {
  const layer = document.createElement('div');
  registerMarkerLayer(layer, 'cube');
  setLayerInstances(layer, new MarkerBuffer({ records: Array.from({ length: count }, () => ({})) }));
  return {
    data: takeMarkerLayerRenderData(layer),
    frameMatrix: identityMat4(),
    interactive: true,
    layer,
    type: 'marker'
  };
}

export function createLineItem(count: number, topology: LineTopology = 'strip'): LineRenderItem {
  const layer = document.createElement('div');
  registerStreamingLayer(layer, { kind: 'line', layout: LINE_VERTEX, topology });
  const source = new LineVertexBuffer({
    records: Array.from({ length: count }, (_, i) => ({ position: [i, 0, 0] as const }))
  });
  setStreamingLayerSource(layer, source);
  return {
    data: takeStreamingLayerRenderData(layer),
    frameMatrix: identityMat4(),
    interactive: true,
    layer,
    topology,
    type: 'line',
    widthUnit: 'pixel'
  };
}

export function createLabelItem(text = 'robot'): LabelRenderItem {
  const layer = document.createElement('div');
  registerLabelLayer(layer);
  setLabelLayerSource(layer, new LabelBuffer({ records: [{ text }] }));
  return {
    data: takeLabelLayerRenderData(layer),
    frameMatrix: identityMat4(),
    interactive: true,
    layer,
    scaleUnit: 'pixel',
    type: 'label'
  };
}
