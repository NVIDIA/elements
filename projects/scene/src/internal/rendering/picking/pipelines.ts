// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMarkerShader, createOutlineShader } from '../../layers/markers/pipelines.js';
import { createMeshShader } from '../../layers/mesh/pipelines.js';
import type {
  SceneGPURenderPipelineDevice,
  SceneGPURenderPipeline,
  SceneGPUVertexBufferLayout
} from '../../gpu/platform.js';
import { LINE_PICK_SHADER, createPointShader, createTriangleShader } from '../stream-pipelines.js';
import { MARKER_VERTEX_LAYOUTS, MESH_VERTEX_LAYOUTS, OUTLINE_VERTEX_LAYOUTS } from '../vertex-layouts.js';

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
      buffers: MARKER_VERTEX_LAYOUTS,
      code: createMarkerShader({ pass: 'pick' }),
      cullMode: 'back'
    }),
    mesh: createMeshPair(device),
    outline: createPair(device, {
      buffers: OUTLINE_VERTEX_LAYOUTS,
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

function createMeshPair(device: SceneGPURenderPipelineDevice): PickPipelinePair {
  const module = device.createShaderModule({ code: createMeshShader({ pass: 'pick' }) });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vertexMain',
      buffers: MESH_VERTEX_LAYOUTS
    },
    fragment: { module, entryPoint: 'fragmentMain', targets: [{ format: 'rgba8uint' }, { format: 'r32float' }] },
    primitive: { topology: 'triangle-list', frontFace: 'ccw', cullMode: 'back' },
    depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' }
  });
  return { opaque: pipeline, transparent: pipeline };
}
