// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type {
  SceneGPURenderPipeline,
  SceneGPURenderPipelineDescriptor,
  SceneGPURenderPipelineDevice
} from '../../gpu/platform.js';
import { createMarkerPipelines } from '../../layers/markers/pipelines.js';
import { createMeshPipelines } from '../../layers/mesh/pipelines.js';
import { createPickPipelines } from './pipelines.js';
import { PICK_UNIFORM_OFFSETS } from './uniform-offsets.js';

describe(PICK_UNIFORM_OFFSETS.constructor.name, () => {
  it('should keep each pick ID aligned with its WGSL uniform layout', () => {
    expect(PICK_UNIFORM_OFFSETS).toEqual({ line: 180, marker: 132, mesh: 144, stream: 156 });
  });
});

describe(createPickPipelines.name, () => {
  it('should interpret marker, mesh, and outline buffers identically across color and pick passes', () => {
    const { descriptors, device } = createPipelineRecorder();
    const markers = createMarkerPipelines(device, 'rgba8unorm');
    const meshes = createMeshPipelines(device, 'rgba8unorm');
    const picks = createPickPipelines(device);
    const layouts = [
      [[markers.opaque, markers.transparent, markers.compactOpaque, markers.compactTransparent], picks.marker.opaque],
      [[markers.outlineOpaque, markers.outlineTransparent], picks.outline.opaque],
      [[meshes.lit.opaque, meshes.lit.transparent, meshes.unlit.opaque, meshes.unlit.transparent], picks.mesh.opaque]
    ] as const;

    for (const [colors, pick] of layouts) {
      const pickBuffers = descriptors.get(pick)?.vertex.buffers;
      expect(pickBuffers).toBeDefined();
      for (const color of colors) expect(descriptors.get(color)?.vertex.buffers).toEqual(pickBuffers);
    }
  });

  it('should create matching depth-tested ID pipelines for marker, stream, and mesh draws', () => {
    const descriptors: SceneGPURenderPipelineDescriptor[] = [];
    const shaderSources: string[] = [];
    const pipeline = { getBindGroupLayout: () => ({}) };
    createPickPipelines({
      createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
      createRenderPipeline: descriptor => {
        descriptors.push(descriptor);
        return pipeline;
      },
      createShaderModule: descriptor => {
        shaderSources.push(descriptor.code);
        return {};
      },
      destroy: () => undefined,
      lost: new Promise(() => undefined),
      queue: { submit: () => undefined }
    });

    expect(descriptors).toHaveLength(6);
    expect(shaderSources).toHaveLength(6);
    for (const source of shaderSources) {
      expect(source.match(/fn nve_pick_output/g)).toHaveLength(1);
      expect(source).toContain('return nve_pick_output(');
    }
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

function createPipelineRecorder() {
  const descriptors = new Map<SceneGPURenderPipeline, SceneGPURenderPipelineDescriptor>();
  const device: SceneGPURenderPipelineDevice = {
    createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
    createRenderPipeline: descriptor => {
      const pipeline = { getBindGroupLayout: () => ({}) };
      descriptors.set(pipeline, descriptor);
      return pipeline;
    },
    createShaderModule: () => ({}),
    destroy: () => undefined,
    lost: new Promise(() => undefined),
    queue: { submit: () => undefined }
  };
  return { descriptors, device };
}
