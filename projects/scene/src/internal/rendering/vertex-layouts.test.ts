// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from 'vitest';
import { createGpu } from '../../../test/rendering.js';
import { MARKER_VERTEX_LAYOUTS, MESH_VERTEX_LAYOUTS, OUTLINE_VERTEX_LAYOUTS } from './vertex-layouts.js';
import { createMeshPipelines } from '../layers/mesh/pipelines.js';
import { createMarkerPipelines } from '../layers/markers/pipelines.js';
import { createPickPipelines } from './picking/pipelines.js';

describe('shared GPU vertex layouts', () => {
  it('keeps primitive and planar mesh input layouts identical in color and pick passes', () => {
    const { device } = createGpu();
    createMarkerPipelines(device, 'bgra8unorm');
    createMeshPipelines(device, 'bgra8unorm');
    const color = vi.mocked(device.createRenderPipeline).mock.calls.map(([descriptor]) => descriptor.vertex.buffers);
    vi.mocked(device.createRenderPipeline).mockClear();
    createPickPipelines(device);
    const pick = vi.mocked(device.createRenderPipeline).mock.calls.map(([descriptor]) => descriptor.vertex.buffers);
    for (const layout of [MARKER_VERTEX_LAYOUTS, MESH_VERTEX_LAYOUTS, OUTLINE_VERTEX_LAYOUTS]) {
      expect(color).toContainEqual(layout);
      expect(pick).toContainEqual(layout);
      const attributes = layout.flatMap(buffer => buffer.attributes);
      expect(new Set(attributes.map(attribute => attribute.shaderLocation)).size).toBe(attributes.length);
      for (const buffer of layout) {
        expect(buffer.arrayStride % 4).toBe(0);
        for (const attribute of buffer.attributes) {
          expect(attribute.offset % 4).toBe(0);
          expect(attribute.offset).toBeLessThan(buffer.arrayStride);
        }
      }
    }
  });
});
