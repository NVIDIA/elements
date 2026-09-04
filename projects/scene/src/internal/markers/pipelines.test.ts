// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { SceneGPUDevice, SceneGPURenderPipeline } from '../gpu/platform.js';
import { MARKER_SHADER, createMarkerPipelines } from './pipelines.js';

describe('marker pipelines', () => {
  it('generates a compact shader with an explicit source-index expression', () => {
    const shaderSources: string[] = [];
    const pipeline: SceneGPURenderPipeline = { getBindGroupLayout: () => ({}) };
    const device = {
      lost: new Promise(() => undefined),
      queue: { submit: () => undefined },
      createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
      createRenderPipeline: () => pipeline,
      createShaderModule: (descriptor: unknown) => {
        if (typeof descriptor !== 'object' || descriptor === null) return {};
        const code = Reflect.get(descriptor, 'code');
        if (typeof code === 'string') shaderSources.push(code);
        return {};
      },
      destroy: () => undefined
    } as SceneGPUDevice & {
      createRenderPipeline: (descriptor: unknown) => SceneGPURenderPipeline;
      createShaderModule: (descriptor: unknown) => unknown;
    };

    createMarkerPipelines(device, 'rgba8unorm');

    const compactShader = shaderSources.find(source => source.includes('nve_compact_indices'));
    expect(compactShader).toBeDefined();
    expect(compactShader).toContain('nve_load_marker(nve_compact_indices[input.instanceIndex])');
    expect(compactShader?.match(/nve_compact_indices/g)).toHaveLength(2);
    expect(MARKER_SHADER).not.toContain('nve_compact_indices');
  });
});
