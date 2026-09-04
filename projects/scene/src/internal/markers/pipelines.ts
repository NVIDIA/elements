// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { DEFAULT_LIGHTING_WGSL, MARKER_WGSL } from '../layouts/wgsl.js';
import { createPrimitiveGeometry, type PrimitiveGeometry, type PrimitiveKind } from '../primitive-geometry.js';
import type { SceneGPUDevice, SceneGPURenderPipeline } from '../gpu/platform.js';
import { OIT_WGSL, oitTargetStates } from '../rendering/transparency.js';

interface MarkerDevice extends SceneGPUDevice {
  createRenderPipeline(descriptor: unknown): SceneGPURenderPipeline;
  createShaderModule(descriptor: unknown): unknown;
}

export interface MarkerPipelines {
  readonly compactOpaque: SceneGPURenderPipeline;
  readonly compactTransparent: SceneGPURenderPipeline;
  readonly opaque: SceneGPURenderPipeline;
  readonly outlineOpaque: SceneGPURenderPipeline;
  readonly outlineTransparent: SceneGPURenderPipeline;
  readonly transparent: SceneGPURenderPipeline;
}

export interface MarkerGeometry extends PrimitiveGeometry {
  readonly outlineIndices?: Uint32Array;
  readonly outlineVertices?: Float32Array;
}

export function createMarkerGeometry(kind: PrimitiveKind): MarkerGeometry {
  const geometry = createPrimitiveGeometry(kind);
  return kind === 'cube'
    ? { ...geometry, outlineIndices: CUBE_OUTLINE_INDICES, outlineVertices: CUBE_CORNERS }
    : geometry;
}

export function createMarkerPipelines(device: MarkerDevice, format: string): MarkerPipelines {
  const module = device.createShaderModule({ code: MARKER_SHADER });
  const compactModule = device.createShaderModule({ code: compactMarkerShader() });
  const create = (transparent: boolean, shaderModule = module) =>
    device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vertexMain',
        buffers: [
          {
            arrayStride: 24,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x3' },
              { shaderLocation: 1, offset: 12, format: 'float32x3' }
            ]
          }
        ]
      },
      fragment: {
        module: shaderModule,
        entryPoint: transparent ? 'fragmentOit' : 'fragmentMain',
        targets: transparent ? oitTargetStates() : [{ format }]
      },
      primitive: { topology: 'triangle-list', frontFace: 'ccw', cullMode: 'back' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: !transparent, depthCompare: 'less' }
    });
  const outlineModule = device.createShaderModule({ code: OUTLINE_SHADER });
  const createOutline = (transparent: boolean) =>
    createMarkerOutlinePipeline({ device, format, module: outlineModule, transparent });
  const opaque = create(false);
  const outlineOpaque = createOutline(false);
  const outlineTransparent = createOutline(true);
  const transparent = create(true);
  return {
    compactOpaque: create(false, compactModule),
    compactTransparent: create(true, compactModule),
    opaque,
    outlineOpaque,
    outlineTransparent,
    transparent
  };
}

function createMarkerOutlinePipeline(options: {
  readonly device: MarkerDevice;
  readonly format: string;
  readonly module: unknown;
  readonly transparent: boolean;
}): SceneGPURenderPipeline {
  return options.device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: options.module,
      entryPoint: 'vertexMain',
      buffers: [{ arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] }]
    },
    fragment: {
      module: options.module,
      entryPoint: options.transparent ? 'fragmentOit' : 'fragmentMain',
      targets: options.transparent ? oitTargetStates() : [{ format: options.format }]
    },
    primitive: { topology: 'line-list' },
    depthStencil: { format: 'depth24plus', depthWriteEnabled: !options.transparent, depthCompare: 'less-equal' }
  });
}

const MARKER_SHADER_TEMPLATE = (markerIndexExpression: string, compactBinding: string) => /* wgsl */ `
struct SceneUniforms { viewProjection: mat4x4f, frame: mat4x4f, }
@group(0) @binding(0) var<uniform> scene: SceneUniforms;
${compactBinding}
${MARKER_WGSL}
${DEFAULT_LIGHTING_WGSL}
${OIT_WGSL}
struct VertexInput { @location(0) position: vec3f, @location(1) normal: vec3f, @builtin(instance_index) instanceIndex: u32, }
struct VertexOutput { @builtin(position) position: vec4f, @location(0) normal: vec3f, @location(1) color: vec4f, }
fn rotateByQuaternion(q: vec4f, value: vec3f) -> vec3f { return value + 2.0 * cross(q.xyz, cross(q.xyz, value) + q.w * value); }
fn safeScale(value: f32) -> f32 { if (abs(value) < 0.000001) { return 0.000001; } return value; }
fn srgbChannelToLinear(value: f32) -> f32 { if (value <= 0.04045) { return value / 12.92; } return pow((value + 0.055) / 1.055, 2.4); }
@vertex fn vertexMain(input: VertexInput) -> VertexOutput {
  let marker = nve_load_marker(${markerIndexExpression});
  let localPosition = rotateByQuaternion(marker.orientation, input.position * marker.scale) + marker.position;
  let localNormal = rotateByQuaternion(marker.orientation, input.normal / vec3f(safeScale(marker.scale.x), safeScale(marker.scale.y), safeScale(marker.scale.z)));
  let worldPosition = scene.frame * vec4f(localPosition, 1.0);
  let worldNormal = normalize((scene.frame * vec4f(localNormal, 0.0)).xyz);
  var output: VertexOutput;
  output.position = scene.viewProjection * worldPosition;
  output.normal = worldNormal;
  output.color = vec4f(srgbChannelToLinear(marker.color.r), srgbChannelToLinear(marker.color.g), srgbChannelToLinear(marker.color.b), marker.color.a);
  return output;
}
@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  if (input.color.a < 1.0) { discard; }
  let lighting = nve_default_lighting(input.normal);
  return vec4f(input.color.rgb * lighting * input.color.a, input.color.a);
}
@fragment fn fragmentOit(input: VertexOutput) -> NveOitOutput {
  if (input.color.a <= 0.0 || input.color.a >= 1.0) { discard; }
  let lighting = nve_default_lighting(input.normal);
  return nve_oit(vec4f(input.color.rgb * lighting * input.color.a, input.color.a), input.position.z);
}
`;

export const MARKER_SHADER = MARKER_SHADER_TEMPLATE('input.instanceIndex', '');

function compactMarkerShader(): string {
  return MARKER_SHADER_TEMPLATE(
    'nve_compact_indices[input.instanceIndex]',
    '@group(2) @binding(0) var<storage, read> nve_compact_indices: array<u32>;'
  );
}

export const OUTLINE_SHADER = /* wgsl */ `
struct SceneUniforms { viewProjection: mat4x4f, frame: mat4x4f, }
@group(0) @binding(0) var<uniform> scene: SceneUniforms;
${MARKER_WGSL}
${OIT_WGSL}
struct VertexInput { @location(0) position: vec3f, @builtin(instance_index) instanceIndex: u32, }
struct VertexOutput { @builtin(position) position: vec4f, @location(0) color: vec4f, }
fn rotateByQuaternion(q: vec4f, value: vec3f) -> vec3f { return value + 2.0 * cross(q.xyz, cross(q.xyz, value) + q.w * value); }
fn srgbChannelToLinear(value: f32) -> f32 { if (value <= 0.04045) { return value / 12.92; } return pow((value + 0.055) / 1.055, 2.4); }
@vertex fn vertexMain(input: VertexInput) -> VertexOutput {
  let marker = nve_load_marker(input.instanceIndex);
  let localPosition = rotateByQuaternion(marker.orientation, input.position * marker.scale) + marker.position;
  var output: VertexOutput;
  output.position = scene.viewProjection * scene.frame * vec4f(localPosition, 1.0);
  output.color = vec4f(
    srgbChannelToLinear(marker.outlineColor.r),
    srgbChannelToLinear(marker.outlineColor.g),
    srgbChannelToLinear(marker.outlineColor.b),
    marker.outlineColor.a
  );
  return output;
}
@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  if (input.color.a < 1.0) { discard; }
  return vec4f(input.color.rgb * input.color.a, input.color.a);
}
@fragment fn fragmentOit(input: VertexOutput) -> NveOitOutput {
  if (input.color.a <= 0.0 || input.color.a >= 1.0) { discard; }
  return nve_oit(vec4f(input.color.rgb * input.color.a, input.color.a), input.position.z);
}
`;

const CUBE_CORNERS = new Float32Array([
  -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5,
  -0.5, 0.5, 0.5
]);

const CUBE_OUTLINE_INDICES = new Uint32Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
