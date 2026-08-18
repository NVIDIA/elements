// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MARKER_SHADER, OUTLINE_SHADER } from '../rendering/marker/pipelines.js';
import { MESH_SHADER } from '../rendering/mesh/pipelines.js';
import type { SceneGPUDevice, SceneGPURenderPipeline } from '../../internal/gpu/platform.js';
import { LINE_PICK_SHADER, POINT_SHADER, TRIANGLE_SHADER } from '../rendering/stream-pipelines.js';

interface PickPipelineDevice extends SceneGPUDevice {
  createRenderPipeline(descriptor: unknown): SceneGPURenderPipeline;
  createShaderModule(descriptor: unknown): unknown;
}

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
  readonly buffers?: readonly unknown[];
  readonly code: string;
  readonly cullMode?: 'back' | 'none';
  readonly depthCompare?: 'less' | 'less-equal';
  readonly topology?: 'line-list' | 'triangle-list';
}

/** Creates lazy ID/depth pipelines that match the color pass topology and culling rules. */
export function createPickPipelines(device: PickPipelineDevice): PickPipelines {
  return {
    line: createPair(device, { code: LINE_PICK_SHADER }),
    marker: createPair(device, { buffers: markerVertexBuffers(), code: pickMarkerShader(), cullMode: 'back' }),
    mesh: createMeshPair(device),
    outline: createPair(device, {
      buffers: [{ arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] }],
      code: pickOutlineShader(),
      depthCompare: 'less-equal',
      topology: 'line-list'
    }),
    point: createPair(device, { code: pickStreamShader(POINT_SHADER, 'index / 6u') }),
    triangle: createPair(device, { code: pickStreamShader(TRIANGLE_SHADER, 'index / 3u') })
  };
}

function createPair(device: PickPipelineDevice, options: PickPipelineOptions): PickPipelinePair {
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

function markerVertexBuffers(): readonly unknown[] {
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

function createMeshPair(device: PickPipelineDevice): PickPipelinePair {
  const module = device.createShaderModule({ code: pickMeshShader() });
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

function pickMarkerShader(): string {
  return withPickOutput(
    MARKER_SHADER.replace(
      'struct SceneUniforms { viewProjection: mat4x4f, frame: mat4x4f, }',
      'struct SceneUniforms { viewProjection: mat4x4f, frame: mat4x4f, pickId: u32, }'
    ).replace(
      'output.color = vec4f(srgbChannelToLinear(marker.color.r), srgbChannelToLinear(marker.color.g), srgbChannelToLinear(marker.color.b), marker.color.a);',
      'output.color = vec4f(srgbChannelToLinear(marker.color.r), srgbChannelToLinear(marker.color.g), srgbChannelToLinear(marker.color.b), marker.color.a); output.id = scene.pickId + input.instanceIndex;'
    )
  );
}

function pickOutlineShader(): string {
  return withPickOutput(
    OUTLINE_SHADER.replace(
      'struct SceneUniforms { viewProjection: mat4x4f, frame: mat4x4f, }',
      'struct SceneUniforms { viewProjection: mat4x4f, frame: mat4x4f, pickId: u32, }'
    ).replace(
      'return output;\n}\n@fragment fn fragmentMain',
      'output.id = scene.pickId + input.instanceIndex;\n  return output;\n}\n@fragment fn fragmentMain'
    )
  );
}

function pickMeshShader(): string {
  return withPickOutput(
    MESH_SHADER.replace(
      'struct SceneUniforms { viewProjection: mat4x4f, frame: mat4x4f, baseColor: vec4f, }',
      'struct SceneUniforms { viewProjection: mat4x4f, frame: mat4x4f, baseColor: vec4f, pickId: u32, }'
    ).replace('output.uv = input.uv;', 'output.uv = input.uv; output.id = scene.pickId + input.instanceIndex;')
  );
}

function pickStreamShader(source: string, id: string): string {
  const scene = source.replace(
    'size: f32, count: f32, topology: f32, worldUnit: f32 }',
    'size: f32, count: f32, topology: f32, worldUnit: f32, pickId: u32 }'
  );
  const vertex = scene
    .replace('@vertex fn vertexMain', `fn pickVertexMain`)
    .replace('fn pickVertexMain(@builtin(vertex_index) index: u32)', 'fn pickVertexMain(index: u32)');
  const pickVertex = `
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> Output {
  var output = pickVertexMain(index);
  output.id = scene.pickId + ${id};
  return output;
}`;
  return withPickOutput(
    vertex
      .replace('output.color = vec4f(0.0); return output;', 'output.color = vec4f(0.0); output.id = 0u; return output;')
      .replace('@fragment fn fragmentMain', `${pickVertex}\n@fragment fn colorFragment`)
  );
}

function withPickOutput(source: string): string {
  const vertexOutput = source.includes('struct VertexOutput');
  const output = vertexOutput ? 'VertexOutput' : 'Output';
  const alpha = source.includes('textureSample')
    ? 'let texel = textureSample(baseTexture, textureSampler, input.uv); if (input.color.a * texel.a <= 0.0) { discard; }'
    : 'if (input.color.a <= 0.0) { discard; }';
  const fragment = `@fragment fn fragmentMain(input: ${output}) -> PickOutput { ${alpha} return PickOutput(vec4u(input.id & 255u, (input.id >> 8u) & 255u, (input.id >> 16u) & 255u, input.id >> 24u), input.position.z); }`;
  return source
    .replace(
      'struct Output { @builtin(position) position: vec4f, @location(0) color: vec4f }',
      'struct Output { @builtin(position) position: vec4f, @location(0) color: vec4f, @interpolate(flat) @location(1) id: u32 }'
    )
    .replace(
      'struct VertexOutput { @builtin(position) position: vec4f, @location(0) normal: vec3f, @location(1) color: vec4f, }',
      'struct VertexOutput { @builtin(position) position: vec4f, @location(0) normal: vec3f, @location(1) color: vec4f, @interpolate(flat) @location(3) id: u32, }'
    )
    .replace(
      'struct VertexOutput { @builtin(position) position: vec4f, @location(0) color: vec4f, }',
      'struct VertexOutput { @builtin(position) position: vec4f, @location(0) color: vec4f, @interpolate(flat) @location(3) id: u32, }'
    )
    .replace(
      'struct VertexOutput { @builtin(position) position: vec4f, @location(0) normal: vec3f, @location(1) color: vec4f, @location(2) uv: vec2f, }',
      'struct VertexOutput { @builtin(position) position: vec4f, @location(0) normal: vec3f, @location(1) color: vec4f, @location(2) uv: vec2f, @interpolate(flat) @location(3) id: u32, }'
    )
    .replace(/@fragment fn fragmentMain[\s\S]*$/, fragment)
    .replace(/@fragment fn colorFragment[\s\S]*$/, fragment)
    .replace('struct Output', 'struct PickOutput { @location(0) id: vec4u, @location(1) depth: f32 }\nstruct Output')
    .replace(
      'struct VertexOutput',
      'struct PickOutput { @location(0) id: vec4u, @location(1) depth: f32 }\nstruct VertexOutput'
    );
}
