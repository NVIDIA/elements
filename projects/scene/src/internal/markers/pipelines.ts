// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { DEFAULT_LIGHTING_WGSL, MARKER_WGSL } from '../layouts/wgsl.js';
import { createPrimitiveGeometry, type PrimitiveGeometry, type PrimitiveKind } from '../primitive-geometry.js';
import type { SceneGPURenderPipelineDevice, SceneGPURenderPipeline, SceneGPUShaderModule } from '../gpu/platform.js';
import { OIT_WGSL, oitTargetStates } from '../rendering/transparency.js';

export interface MarkerPipelines {
  readonly compactOpaque: SceneGPURenderPipeline;
  readonly compactTransparent: SceneGPURenderPipeline;
  readonly opaque: SceneGPURenderPipeline;
  readonly outlineOpaque: SceneGPURenderPipeline;
  readonly outlineTransparent: SceneGPURenderPipeline;
  readonly transparent: SceneGPURenderPipeline;
}

type ShaderPass = 'color' | 'pick';

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

export function createMarkerPipelines(device: SceneGPURenderPipelineDevice, format: string): MarkerPipelines {
  const module = device.createShaderModule({ code: createMarkerShader({ pass: 'color' }) });
  const compactModule = device.createShaderModule({ code: createMarkerShader({ compact: true, pass: 'color' }) });
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
  const outlineModule = device.createShaderModule({ code: createOutlineShader({ pass: 'color' }) });
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
  readonly device: SceneGPURenderPipelineDevice;
  readonly format: string;
  readonly module: SceneGPUShaderModule;
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

/** Composes direct and compacted marker shaders without rewriting completed WGSL. */
export function createMarkerShader(options: { readonly compact?: boolean; readonly pass: ShaderPass }): string {
  const compact = options.compact === true;
  const markerIndex = compact ? 'nve_compact_indices[input.instanceIndex]' : 'input.instanceIndex';
  const compactBinding = compact ? '@group(2) @binding(0) var<storage, read> nve_compact_indices: array<u32>;' : '';
  const pickFields = options.pass === 'pick' ? 'count: f32, pickId: u32, ' : '';
  const outputId = options.pass === 'pick' ? '@interpolate(flat) @location(3) id: u32, ' : '';
  const fragment =
    options.pass === 'pick'
      ? 'struct PickOutput { @location(0) id: vec4u, @location(1) depth: f32 } @fragment fn fragmentMain(input: VertexOutput) -> PickOutput { if (input.color.a <= 0.0) { discard; } return PickOutput(vec4u(input.id & 255u, (input.id >> 8u) & 255u, (input.id >> 16u) & 255u, input.id >> 24u), input.position.z); }'
      : '@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4f { if (input.color.a < 1.0) { discard; } let lighting = nve_default_lighting(input.normal); return vec4f(input.color.rgb * lighting * input.color.a, input.color.a); } @fragment fn fragmentOit(input: VertexOutput) -> NveOitOutput { if (input.color.a <= 0.0 || input.color.a >= 1.0) { discard; } let lighting = nve_default_lighting(input.normal); return nve_oit(vec4f(input.color.rgb * lighting * input.color.a, input.color.a), input.position.z); }';
  return /* wgsl */ `
struct SceneUniforms { viewProjection: mat4x4f, frame: mat4x4f, ${pickFields}}
@group(0) @binding(0) var<uniform> scene: SceneUniforms;
${compactBinding}
${MARKER_WGSL}
${DEFAULT_LIGHTING_WGSL}
${OIT_WGSL}
struct VertexInput { @location(0) position: vec3f, @location(1) normal: vec3f, @builtin(instance_index) instanceIndex: u32, }
struct VertexOutput { @builtin(position) position: vec4f, @location(0) normal: vec3f, @location(1) color: vec4f, ${outputId}}
fn rotateByQuaternion(q: vec4f, value: vec3f) -> vec3f { return value + 2.0 * cross(q.xyz, cross(q.xyz, value) + q.w * value); }
fn safeScale(value: f32) -> f32 { if (abs(value) < 0.000001) { return 0.000001; } return value; }
fn srgbChannelToLinear(value: f32) -> f32 { if (value <= 0.04045) { return value / 12.92; } return pow((value + 0.055) / 1.055, 2.4); }
@vertex fn vertexMain(input: VertexInput) -> VertexOutput {
  let marker = nve_load_marker(${markerIndex});
  let localPosition = rotateByQuaternion(marker.orientation, input.position * marker.scale) + marker.position;
  let localNormal = rotateByQuaternion(marker.orientation, input.normal / vec3f(safeScale(marker.scale.x), safeScale(marker.scale.y), safeScale(marker.scale.z)));
  let worldPosition = scene.frame * vec4f(localPosition, 1.0);
  let worldNormal = normalize((scene.frame * vec4f(localNormal, 0.0)).xyz);
  var output: VertexOutput;
  output.position = scene.viewProjection * worldPosition;
  output.normal = worldNormal;
  output.color = vec4f(srgbChannelToLinear(marker.color.r), srgbChannelToLinear(marker.color.g), srgbChannelToLinear(marker.color.b), marker.color.a);
  ${options.pass === 'pick' ? `output.id = scene.pickId + ${markerIndex};` : ''}
  return output;
}
${fragment}`;
}

export const MARKER_SHADER = createMarkerShader({ pass: 'color' });

/** Composes the marker-outline color and ID/depth passes from shared vertex work. */
export function createOutlineShader(options: { readonly pass: ShaderPass }): string {
  const pickFields = options.pass === 'pick' ? 'count: f32, pickId: u32, ' : '';
  const outputId = options.pass === 'pick' ? '@interpolate(flat) @location(3) id: u32, ' : '';
  const fragment =
    options.pass === 'pick'
      ? 'struct PickOutput { @location(0) id: vec4u, @location(1) depth: f32 } @fragment fn fragmentMain(input: VertexOutput) -> PickOutput { if (input.color.a <= 0.0) { discard; } return PickOutput(vec4u(input.id & 255u, (input.id >> 8u) & 255u, (input.id >> 16u) & 255u, input.id >> 24u), input.position.z); }'
      : '@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4f { if (input.color.a < 1.0) { discard; } return vec4f(input.color.rgb * input.color.a, input.color.a); } @fragment fn fragmentOit(input: VertexOutput) -> NveOitOutput { if (input.color.a <= 0.0 || input.color.a >= 1.0) { discard; } return nve_oit(vec4f(input.color.rgb * input.color.a, input.color.a), input.position.z); }';
  return /* wgsl */ `
struct SceneUniforms { viewProjection: mat4x4f, frame: mat4x4f, ${pickFields}}
@group(0) @binding(0) var<uniform> scene: SceneUniforms;
${MARKER_WGSL}
${OIT_WGSL}
struct VertexInput { @location(0) position: vec3f, @builtin(instance_index) instanceIndex: u32, }
struct VertexOutput { @builtin(position) position: vec4f, @location(0) color: vec4f, ${outputId}}
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
  ${options.pass === 'pick' ? 'output.id = scene.pickId + input.instanceIndex;' : ''}
  return output;
}
${fragment}`;
}

const OUTLINE_SHADER = createOutlineShader({ pass: 'color' });

const CUBE_CORNERS = new Float32Array([
  -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5,
  -0.5, 0.5, 0.5
]);

const CUBE_OUTLINE_INDICES = new Uint32Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
