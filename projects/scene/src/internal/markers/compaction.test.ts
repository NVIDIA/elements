// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import type { SceneGPUBuffer, SceneGPUCommandEncoder, SceneGPUDevice } from '../gpu/platform.js';
import {
  destroyMarkerCompactionResources,
  MarkerCompactor,
  MARKER_COMPACTION_SHADER,
  supportsMarkerCompaction
} from './compaction.js';

describe('marker compaction', () => {
  it('builds compact buffers and encodes opaque and transparent indirect arguments', () => {
    const buffers: SceneGPUBuffer[] = [];
    const descriptors: unknown[] = [];
    const dispatchWorkgroups = vi.fn();
    const setBindGroup = vi.fn();
    const setPipeline = vi.fn();
    const writeBuffer = vi.fn();
    const device = {
      lost: new Promise(() => undefined),
      queue: { submit: () => undefined, writeBuffer },
      createBindGroup: () => ({}),
      createBuffer: descriptor => {
        descriptors.push(descriptor);
        const buffer = { destroy: vi.fn() };
        buffers.push(buffer);
        return buffer;
      },
      createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
      createComputePipeline: () => ({ getBindGroupLayout: () => ({}) }),
      createShaderModule: () => ({}),
      destroy: () => undefined
    } satisfies SceneGPUDevice;
    expect(supportsMarkerCompaction(device)).toBe(true);
    if (!supportsMarkerCompaction(device)) throw new TypeError('Expected a compaction-capable device.');
    const source = { destroy: vi.fn() };
    const uniform = { destroy: vi.fn() };
    const compactor = new MarkerCompactor(device);
    const resources = compactor.createResources(source, uniform, 480);
    const encoder: SceneGPUCommandEncoder = {
      beginComputePass: () => ({ dispatchWorkgroups, end: vi.fn(), setBindGroup, setPipeline }),
      beginRenderPass: () => ({ end: () => undefined }),
      finish: () => ({})
    };

    expect(compactor.encode({ count: 129, encoder, indexCount: 36, resources })).toBe(true);

    expect(descriptors).toEqual([
      { size: 40, usage: 128 },
      { size: 40, usage: 128 },
      { size: 40, usage: 392 }
    ]);
    expect(writeBuffer).toHaveBeenCalledWith(resources.arguments, 0, new Uint32Array([36, 0, 0, 0, 0, 36, 0, 0, 0, 0]));
    expect(dispatchWorkgroups).toHaveBeenCalledWith(3);
    expect(setPipeline).toHaveBeenCalledOnce();
    expect(setBindGroup).toHaveBeenCalledTimes(2);

    destroyMarkerCompactionResources(resources);
    expect(buffers.every(buffer => vi.mocked(buffer.destroy).mock.calls.length === 1)).toBe(true);
  });

  it('contains frustum, alpha, and record-copy logic in WGSL', () => {
    expect(MARKER_COMPACTION_SHADER).toContain('fn isVisible');
    expect(MARKER_COMPACTION_SHADER).toContain('fn outsidePlane');
    expect(MARKER_COMPACTION_SHADER).toContain('outsidePlane(row3 + row0, point, radius)');
    expect(MARKER_COMPACTION_SHADER).toContain('outsidePlane(row3 - row0, point, radius)');
    expect(MARKER_COMPACTION_SHADER).toContain('outsidePlane(row3 + row1, point, radius)');
    expect(MARKER_COMPACTION_SHADER).toContain('outsidePlane(row3 - row1, point, radius)');
    expect(MARKER_COMPACTION_SHADER).toContain('outsidePlane(row2, point, radius)');
    expect(MARKER_COMPACTION_SHADER).toContain('outsidePlane(row3 - row2, point, radius)');
    expect(MARKER_COMPACTION_SHADER).not.toContain('clip.x + extent.x');
    expect(MARKER_COMPACTION_SHADER).toContain('alpha == 255u');
    expect(MARKER_COMPACTION_SHADER).toContain('atomicAdd(&arguments[1]');
    expect(MARKER_COMPACTION_SHADER).toContain('opaqueIndices[atomicAdd');
  });

  it('rolls back buffers when bind-group creation fails', () => {
    const destroyed: ReturnType<typeof vi.fn>[] = [];
    let bindGroupCount = 0;
    const device = {
      lost: new Promise(() => undefined),
      queue: { submit: () => undefined, writeBuffer: vi.fn() },
      createBindGroup: () => {
        bindGroupCount += 1;
        if (bindGroupCount === 2) throw new Error('bind-group failure');
        return {};
      },
      createBuffer: () => {
        const destroy = vi.fn();
        destroyed.push(destroy);
        return { destroy };
      },
      createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
      createComputePipeline: () => ({ getBindGroupLayout: () => ({}) }),
      createShaderModule: () => ({}),
      destroy: () => undefined
    } satisfies SceneGPUDevice;
    const compactor = new MarkerCompactor(device);

    expect(() => compactor.createResources({ destroy: vi.fn() }, { destroy: vi.fn() }, 480)).toThrow(
      'bind-group failure'
    );
    expect(destroyed).toHaveLength(3);
    expect(destroyed.every(destroy => destroy.mock.calls.length === 1)).toBe(true);
  });

  it('does not encode when the command encoder has no compute pass', () => {
    const device = createMinimalDevice();
    const compactor = new MarkerCompactor(device);
    const resources = compactor.createResources({ destroy: vi.fn() }, { destroy: vi.fn() }, 480);
    const encoder: SceneGPUCommandEncoder = {
      beginRenderPass: () => ({ end: () => undefined }),
      finish: () => ({})
    };

    expect(compactor.encode({ count: 10, encoder, indexCount: 36, resources })).toBe(false);
    expect(device.writeBuffer).not.toHaveBeenCalled();
  });

  it('reports devices missing compaction support', () => {
    const device: SceneGPUDevice = {
      lost: new Promise(() => undefined),
      queue: { submit: () => undefined, writeBuffer: undefined },
      createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
      destroy: () => undefined
    };

    expect(supportsMarkerCompaction(device)).toBe(false);
  });
});

function createMinimalDevice() {
  const writeBuffer = vi.fn();
  const device = {
    lost: new Promise(() => undefined),
    queue: { submit: () => undefined, writeBuffer },
    createBindGroup: () => ({}),
    createBuffer: () => ({ destroy: vi.fn() }),
    createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
    createComputePipeline: () => ({ getBindGroupLayout: () => ({}) }),
    createShaderModule: () => ({}),
    destroy: () => undefined
  } satisfies SceneGPUDevice;
  return { ...device, writeBuffer };
}
