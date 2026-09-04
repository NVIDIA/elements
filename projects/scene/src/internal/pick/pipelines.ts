// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMarkerShader, createOutlineShader } from '../../internal/markers/pipelines.js';
import { createMeshShader } from '../../internal/mesh/pipelines.js';
import type {
  SceneGPURenderPipelineDevice,
  SceneGPURenderPipeline,
  SceneGPUVertexBufferLayout
} from '../../internal/gpu/platform.js';
import { LINE_PICK_SHADER, createPointShader, createTriangleShader } from '../rendering/stream-pipelines.js';

export interface PickPipelines {
  readonly line: PickPipelinePair;
  readonly marker: PickPipelinePair;
  readonly mesh: PickPipelinePair;
  readonly outline: PickPipelinePair;
  readonly point: PickPipelinePair;
  readonly triangle: PickPipelinePair;
}

export interface PickPipelinePair {
  readonly opaque: SceneGPURenderPipeline;
  readonly transparent: SceneGPURenderPipeline;
}

interface PickPipelineOptions {
  readonly buffers?: readonly SceneGPUVertexBufferLayout[];
  readonly code: string;
  readonly cullMode?: 'back' | 'none';
  readonly depthCompare?: 'less' | 'less-equal';
  readonly topology?: 'line-list' | 'triangle-list';
}

/** Creates lazy ID/depth pipelines that match the color pass topology and culling rules. */
export function createPickPipelines(device: SceneGPURenderPipelineDevice): PickPipelines {
  return {
    line: createPair(device, { code: LINE_PICK_SHADER }),
    marker: createPair(device, {
      buffers: markerVertexBuffers(),
      code: createMarkerShader({ pass: 'pick' }),
      cullMode: 'back'
    }),
    mesh: createMeshPair(device),
    outline: createPair(device, {
      buffers: [{ arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] }],
      code: createOutlineShader({ pass: 'pick' }),
      depthCompare: 'less-equal',
      topology: 'line-list'
    }),
    point: createPair(device, { code: createPointShader({ pass: 'pick' }) }),
    triangle: createPair(device, { code: createTriangleShader({ pass: 'pick' }) })
  };
}

function createPair(device: SceneGPURenderPipelineDevice, options: PickPipelineOptions): PickPipelinePair {
  const { buffers, code, cullMode = 'none', depthCompare = 'less', topology = 'triangle-list' } = options;
  const module = device.createShaderModule({ code });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vertexMain', ...(buffers ? { buffers } : {}) },
    fragment: { module, entryPoint: 'fragmentMain', targets: [{ format: 'rgba8uint' }, { format: 'r32float' }] },
    primitive: { topology, frontFace: 'ccw', cullMode },
    depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare }
  });
  return { opaque: pipeline, transparent: pipeline };
}

function markerVertexBuffers(): readonly SceneGPUVertexBufferLayout[] {
  return [
    {
      arrayStride: 24,
      attributes: [
        { shaderLocation: 0, offset: 0, format: 'float32x3' },
        { shaderLocation: 1, offset: 12, format: 'float32x3' }
      ]
    }
  ];
}

function createMeshPair(device: SceneGPURenderPipelineDevice): PickPipelinePair {
  const module = device.createShaderModule({ code: createMeshShader({ pass: 'pick' }) });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vertexMain',
      buffers: [
        { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] },
        { arrayStride: 12, attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x3' }] },
        { arrayStride: 8, attributes: [{ shaderLocation: 2, offset: 0, format: 'float32x2' }] },
        { arrayStride: 16, attributes: [{ shaderLocation: 3, offset: 0, format: 'float32x4' }] }
      ]
    },
    fragment: { module, entryPoint: 'fragmentMain', targets: [{ format: 'rgba8uint' }, { format: 'r32float' }] },
    primitive: { topology: 'triangle-list', frontFace: 'ccw', cullMode: 'back' },
    depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' }
  });
  return { opaque: pipeline, transparent: pipeline };
}
