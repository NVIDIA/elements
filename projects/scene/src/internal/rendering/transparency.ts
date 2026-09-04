// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneGPUDevice, SceneGPURenderPipeline } from '../gpu/platform.js';

export const OIT_ACCUMULATION_FORMAT = 'rgba16float';
export const OIT_REVEALAGE_FORMAT = 'r8unorm';

interface TransparencyDevice extends SceneGPUDevice {
  createRenderPipeline(descriptor: unknown): SceneGPURenderPipeline;
  createShaderModule(descriptor: unknown): unknown;
}

export const OIT_WGSL = /* wgsl */ `
struct NveOitOutput {
  @location(0) accumulation: vec4f,
  @location(1) revealage: f32,
}
fn nve_oit(premultiplied: vec4f, depth: f32) -> NveOitOutput {
  let alpha = clamp(premultiplied.a, 0.0, 1.0);
  let alphaWeight = min(1.0, alpha) * 8.0 + 0.01;
  let depthWeight = 1.0 - clamp(depth, 0.0, 1.0) * 0.95;
  let weight = clamp(pow(alphaWeight, 3.0) * 1e8 * pow(depthWeight, 3.0), 1e-2, 3e2);
  return NveOitOutput(vec4f(premultiplied.rgb * weight, alpha * weight), alpha);
}
`;

export function oitTargetStates(): readonly unknown[] {
  return [
    {
      format: OIT_ACCUMULATION_FORMAT,
      blend: {
        color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
        alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' }
      }
    },
    {
      format: OIT_REVEALAGE_FORMAT,
      blend: {
        color: { srcFactor: 'zero', dstFactor: 'one-minus-src', operation: 'add' },
        alpha: { srcFactor: 'zero', dstFactor: 'one-minus-src', operation: 'add' }
      }
    }
  ];
}

/** Creates the full-screen pass that composites weighted transparent fragments over the opaque canvas. */
export function createOitCompositePipeline(device: TransparencyDevice, format: string): SceneGPURenderPipeline {
  const module = device.createShaderModule({ code: COMPOSITE_SHADER });
  return device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vertexMain' },
    fragment: {
      module,
      entryPoint: 'fragmentMain',
      targets: [
        {
          format,
          blend: {
            color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' }
          }
        }
      ]
    },
    primitive: { topology: 'triangle-list' },
    depthStencil: { format: 'depth24plus', depthWriteEnabled: false, depthCompare: 'always' }
  });
}

const COMPOSITE_SHADER = /* wgsl */ `
@group(0) @binding(0) var accumulationTexture: texture_2d<f32>;
@group(0) @binding(1) var revealageTexture: texture_2d<f32>;

@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let position = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(position[index], 0.0, 1.0);
}

@fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let pixel = vec2i(position.xy);
  var accumulation = textureLoad(accumulationTexture, pixel, 0);
  let revealage = clamp(textureLoad(revealageTexture, pixel, 0).r, 0.0, 1.0);
  let opacity = 1.0 - revealage;
  if (opacity <= 0.0) { discard; }
  if (any(accumulation != accumulation)) {
    accumulation = vec4f(0.0);
  }
  accumulation = min(accumulation, vec4f(65504.0));
  let average = accumulation.rgb / max(accumulation.a, 1e-5);
  return vec4f(average * opacity, opacity);
}
`;
