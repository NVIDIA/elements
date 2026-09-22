// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
  SceneGPUComputePipelineDescriptor,
  SceneGPUDevice,
  SceneGPUBindGroupLayout,
  SceneGPURenderPassDescriptor,
  SceneGPUShaderModule,
  SceneGPUTextureView
} from './platform.js';
import type { ScenePickDriver, ScenePickResult } from '../pick/routing.js';

declare const device: SceneGPUDevice;
declare const shader: SceneGPUShaderModule;
declare const textureView: SceneGPUTextureView;
declare const bindGroupLayout: SceneGPUBindGroupLayout;

void device.createRenderPipeline?.({
  layout: 'auto',
  vertex: { entryPoint: 'vertexMain', module: shader }
});

void device.createShaderModule?.({ code: '@vertex fn vertexMain() {}' });

void device.createBuffer?.({ size: 16, usage: 0x10 });

void device.createBindGroup?.({
  entries: [{ binding: 0, resource: { buffer: { destroy() {} } } }],
  layout: bindGroupLayout
});

void device.createComputePipeline?.({ layout: 'auto', compute: { entryPoint: 'main', module: shader } });

void device.createQuerySet?.({ count: 1, type: 'occlusion' });

void device.createSampler?.({ magFilter: 'linear', minFilter: 'nearest' });

void device.createCommandEncoder().beginRenderPass({
  colorAttachments: [{ loadOp: 'clear', storeOp: 'store', view: textureView }]
});

void device.createRenderPipeline?.({
  layout: 'auto',
  // @ts-expect-error Render pipelines require an explicit vertex entry point.
  vertex: { module: shader }
});

void device.createShaderModule?.({
  // @ts-expect-error WGSL source is always text.
  code: 42
});

// @ts-expect-error Buffer descriptors must specify usage at the Scene GPU boundary.
void device.createBuffer?.({
  size: 16
});

void device.createBindGroup?.({
  // @ts-expect-error A binding entry always identifies its resource.
  entries: [{ binding: 0 }],
  layout: bindGroupLayout
});

void device.createBindGroup?.({
  entries: [
    {
      binding: 0,
      // @ts-expect-error A shader module is not a bind-group resource.
      resource: shader
    }
  ],
  layout: bindGroupLayout
});

const malformedRenderPass = {
  colorAttachments: [
    // @ts-expect-error Render pass attachments require an explicit store operation.
    {
      loadOp: 'clear',
      view: textureView
    }
  ]
} satisfies SceneGPURenderPassDescriptor;
void malformedRenderPass;

const malformedCompute = {
  layout: 'auto',
  // @ts-expect-error Compute pipelines require an explicit entry point.
  compute: { module: shader }
} satisfies SceneGPUComputePipelineDescriptor;
void malformedCompute;

// @ts-expect-error Query sets require a count.
void device.createQuerySet?.({
  type: 'occlusion'
});

void device.createSampler?.({
  // @ts-expect-error Scene only accepts known sampler filter values.
  magFilter: 'cubic'
});

const malformedPick: ScenePickResult = {
  clientX: 0,
  clientY: 0,
  instanceIndex: 0,
  layer: globalThis.document.createElement('div'),
  // @ts-expect-error Explicit pick targets require their discriminant payload.
  target: { kind: 'point' },
  worldPosition: [0, 0, 0]
};

const typedPickDriver: ScenePickDriver = async () => malformedPick;
void typedPickDriver;
