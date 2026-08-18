// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createStreamPipelines, GRID_DEPTH_BIAS } from './stream-pipelines.js';

describe(createStreamPipelines.name, () => {
  it('should reserve positive depth bias while keeping every transparent pass read-only', () => {
    const descriptors: Array<Record<string, unknown>> = [];
    const pipeline = { getBindGroupLayout: () => ({}) };
    createStreamPipelines(
      {
        createRenderPipeline: descriptor => {
          descriptors.push(descriptor as Record<string, unknown>);
          return pipeline;
        },
        createShaderModule: () => ({}),
        destroy: () => undefined,
        lost: new Promise(() => undefined),
        queue: { submit: () => undefined }
      },
      'bgra8unorm'
    );

    expect(GRID_DEPTH_BIAS).toBe(3000);
    expect(descriptors).toHaveLength(8);
    const depthStencils = descriptors.map(descriptor => descriptor.depthStencil as Record<string, unknown>);
    expect(
      depthStencils.filter(depthStencil => typeof depthStencil.depthBias === 'number' && depthStencil.depthBias > 0)
    ).toEqual([
      expect.objectContaining({
        depthBiasClamp: 0,
        depthBiasSlopeScale: 0,
        depthCompare: 'less',
        depthWriteEnabled: true,
        format: 'depth24plus'
      }),
      expect.objectContaining({
        depthBiasClamp: 0,
        depthBiasSlopeScale: 0,
        depthCompare: 'less',
        depthWriteEnabled: false,
        format: 'depth24plus'
      })
    ]);
    expect(depthStencils.filter(depthStencil => depthStencil.depthBias === undefined)).toHaveLength(6);
    expect(depthStencils.slice(0, 6).map(depthStencil => depthStencil.depthWriteEnabled)).toEqual([
      true,
      false,
      true,
      false,
      true,
      false
    ]);
    for (const index of [1, 3, 5, 7]) {
      expect(descriptors[index]?.fragment).toMatchObject({
        entryPoint: 'fragmentOit',
        targets: [{ format: 'rgba16float' }, { format: 'r8unorm' }]
      });
    }
  });
});
