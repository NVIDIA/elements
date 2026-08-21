// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createPickPipelines } from './pipelines.js';
import { PICK_UNIFORM_OFFSETS } from './uniform-offsets.js';

describe(PICK_UNIFORM_OFFSETS.constructor.name, () => {
  it('should keep each pick ID aligned with its WGSL uniform layout', () => {
    expect(PICK_UNIFORM_OFFSETS).toEqual({ marker: 128, mesh: 144, stream: 156 });
  });
});

describe(createPickPipelines.name, () => {
  it('should create matching depth-tested ID pipelines for marker, stream, and mesh draws', () => {
    const descriptors: Array<Record<string, unknown>> = [];
    const pipeline = { getBindGroupLayout: () => ({}) };
    createPickPipelines({
      createRenderPipeline: descriptor => {
        descriptors.push(descriptor as Record<string, unknown>);
        return pipeline;
      },
      createShaderModule: () => ({}),
      destroy: () => undefined,
      lost: new Promise(() => undefined),
      queue: { submit: () => undefined }
    });

    expect(descriptors).toHaveLength(6);
    for (const descriptor of descriptors) {
      expect(descriptor.depthStencil).toMatchObject({ depthWriteEnabled: true, format: 'depth24plus' });
      expect(descriptor.fragment).toMatchObject({ targets: [{ format: 'rgba8uint' }, { format: 'r32float' }] });
    }
    expect(
      descriptors.filter(
        descriptor => (descriptor.depthStencil as { depthCompare?: string }).depthCompare === 'less-equal'
      )
    ).toHaveLength(1);
    expect(
      descriptors.filter(descriptor => (descriptor.primitive as { cullMode?: string }).cullMode === 'back')
    ).toHaveLength(2);
    expect(descriptors[1]?.vertex).toMatchObject({
      buffers: [
        {
          arrayStride: 24,
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 12, format: 'float32x3' }
          ]
        }
      ]
    });
  });
});
