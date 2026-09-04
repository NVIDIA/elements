// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneGPUDevice, SceneGPURenderPipeline } from '../gpu/platform.js';
import { DEFAULT_LIGHTING_WGSL, MARKER_WGSL } from '../layouts/wgsl.js';
import { OIT_WGSL, oitTargetStates } from '../rendering/transparency.js';

interface MeshDevice extends SceneGPUDevice {
  createRenderPipeline(descriptor: unknown): SceneGPURenderPipeline;
  createShaderModule(descriptor: unknown): unknown;
}

export interface MeshPipelines {
  readonly lit: MeshPipelinePair;
  readonly unlit: MeshPipelinePair;
}

interface MeshPipelinePair {
  readonly opaque: SceneGPURenderPipeline;
  readonly transparent: SceneGPURenderPipeline;
}

/** Creates the mesh pipelines only after a scene first contains a mesh. */
export function createMeshPipelines(device: MeshDevice, format: string): MeshPipelines {
  const module = device.createShaderModule({ code: MESH_SHADER });
  const create = (transparent: boolean, shading: 'lit' | 'unlit') =>
    device.createRenderPipeline({
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
      fragment: {
        module,
        entryPoint:
          shading === 'unlit'
            ? transparent
              ? 'fragmentUnlitOit'
              : 'fragmentUnlit'
            : transparent
              ? 'fragmentOit'
              : 'fragmentMain',
        targets: transparent ? oitTargetStates() : [{ format }]
      },
      primitive: { topology: 'triangle-list', frontFace: 'ccw', cullMode: 'back' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: !transparent, depthCompare: 'less' }
    });
  return {
    lit: { opaque: create(false, 'lit'), transparent: create(true, 'lit') },
    unlit: { opaque: create(false, 'unlit'), transparent: create(true, 'unlit') }
  };
}

export const MESH_SHADER = /* wgsl */ `
struct SceneUniforms { viewProjection: mat4x4f, frame: mat4x4f, baseColor: vec4f, }
@group(0) @binding(0) var<uniform> scene: SceneUniforms;
${MARKER_WGSL}
${DEFAULT_LIGHTING_WGSL}
${OIT_WGSL}
@group(2) @binding(0) var textureSampler: sampler;
@group(2) @binding(1) var baseTexture: texture_2d<f32>;
struct VertexInput { @location(0) position: vec3f, @location(1) normal: vec3f, @location(2) uv: vec2f, @location(3) color: vec4f, @builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32, }
struct VertexOutput { @builtin(position) position: vec4f, @location(0) normal: vec3f, @location(1) color: vec4f, @location(2) uv: vec2f, }
fn rotateByQuaternion(q: vec4f, value: vec3f) -> vec3f { return value + 2.0 * cross(q.xyz, cross(q.xyz, value) + q.w * value); }
fn safeScale(value: f32) -> f32 { if (abs(value) < 0.000001) { return 0.000001; } return value; }
fn srgbToLinear(value: vec3f) -> vec3f { return select(pow((value + vec3f(0.055)) / vec3f(1.055), vec3f(2.4)), value / vec3f(12.92), value <= vec3f(0.04045)); }
@vertex fn vertexMain(input: VertexInput) -> VertexOutput {
  let marker = nve_load_marker(input.instanceIndex);
  var output: VertexOutput;
  let localPosition = rotateByQuaternion(marker.orientation, input.position * marker.scale) + marker.position;
  let localNormal = rotateByQuaternion(marker.orientation, input.normal / vec3f(safeScale(marker.scale.x), safeScale(marker.scale.y), safeScale(marker.scale.z)));
  output.position = scene.viewProjection * scene.frame * vec4f(localPosition, 1.0);
  output.normal = normalize((scene.frame * vec4f(localNormal, 0.0)).xyz);
  output.color = vec4f(srgbToLinear(input.color.rgb) * srgbToLinear(scene.baseColor.rgb) * srgbToLinear(marker.color.rgb), input.color.a * scene.baseColor.a * marker.color.a);
  output.uv = input.uv;
  return output;
}
@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let texel = textureSample(baseTexture, textureSampler, input.uv);
  let color = vec4f(input.color.rgb * texel.rgb, input.color.a * texel.a);
  if (color.a < 1.0) { discard; }
  let lighting = nve_default_lighting(input.normal);
  return vec4f(color.rgb * lighting * color.a, color.a);
}
@fragment fn fragmentOit(input: VertexOutput) -> NveOitOutput {
  let texel = textureSample(baseTexture, textureSampler, input.uv);
  let color = vec4f(input.color.rgb * texel.rgb, input.color.a * texel.a);
  if (color.a <= 0.0 || color.a >= 1.0) { discard; }
  let lighting = nve_default_lighting(input.normal);
  return nve_oit(vec4f(color.rgb * lighting * color.a, color.a), input.position.z);
}
@fragment fn fragmentUnlit(input: VertexOutput) -> @location(0) vec4f {
  let texel = textureSample(baseTexture, textureSampler, input.uv);
  let color = vec4f(input.color.rgb * texel.rgb, input.color.a * texel.a);
  if (color.a < 1.0) { discard; }
  return vec4f(color.rgb * color.a, color.a);
}
@fragment fn fragmentUnlitOit(input: VertexOutput) -> NveOitOutput {
  let texel = textureSample(baseTexture, textureSampler, input.uv);
  let color = vec4f(input.color.rgb * texel.rgb, input.color.a * texel.a);
  if (color.a <= 0.0 || color.a >= 1.0) { discard; }
  return nve_oit(vec4f(color.rgb * color.a, color.a), input.position.z);
}
`;
