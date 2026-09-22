// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import type { SceneGPUBuffer, SceneGPUCommandEncoder, SceneGPUDevice } from '../gpu/platform.js';
import {
  HeightfieldGPUCompiler,
  HEIGHTFIELD_COMPUTE_SHADER,
  supportsHeightfieldGPU,
  type HeightfieldGPUState
} from './gpu.js';

describe('heightfield GPU compilation', () => {
  it('creates descriptors, uploads sources, tracks pending updates, and destroys resources', () => {
    const gpu = createHeightfieldDevice();
    const compiler = new HeightfieldGPUCompiler(gpu.device);
    const source = createHeightfieldSource();
    const state = compiler.create(source);

    expect(state.geometry.indexCount).toBe(12);
    expect(state.pending).toBe(true);
    expect(gpu.buffers.map(buffer => buffer.descriptor)).toEqual([
      { size: 96, usage: 160 },
      { size: 48, usage: 24 },
      { size: 72, usage: 160 },
      { size: 72, usage: 160 },
      { size: 48, usage: 32 },
      { size: 24, usage: 136 },
      { size: 24, usage: 136 },
      { size: 32, usage: 72 }
    ]);
    expect(gpu.writes.slice(-3).map(write => write.data.byteLength)).toEqual([24, 24, 32]);

    compiler.update(state, source);
    expect(gpu.writes).toHaveLength(4);
    const updated = { ...source, heights: new Float32Array(source.heights).fill(2) };
    compiler.update(state, updated);
    expect(state.source).toBe(updated);
    expect(state.pending).toBe(true);
    expect(gpu.writes).toHaveLength(7);

    compiler.destroy(state);
    expect(gpu.destroyedBuffers).toHaveLength(3);
  });

  it('leaves no buffers behind when bind-group creation or upload fails', () => {
    for (const failure of ['bind-group', 'write'] as const) {
      const gpu = createHeightfieldDevice(failure);
      const compiler = new HeightfieldGPUCompiler(gpu.device);

      expect(() => compiler.create(createHeightfieldSource())).toThrow('test failure');
      expect(gpu.destroyedBuffers).toHaveLength(8);
    }
  });

  it('rolls back buffers when a later allocation fails', () => {
    for (let failBufferAt = 1; failBufferAt <= 5; failBufferAt += 1) {
      const gpu = createHeightfieldDevice('buffer', failBufferAt);
      const compiler = new HeightfieldGPUCompiler(gpu.device);

      expect(() => compiler.create(createHeightfieldSource())).toThrow('test failure');
      expect(gpu.destroyedBuffers).toHaveLength(failBufferAt - 1);
    }
  });

  it('supports heightfields without a color source', () => {
    const gpu = createHeightfieldDevice();
    const compiler = new HeightfieldGPUCompiler(gpu.device);
    const source = { ...createHeightfieldSource(), colors: null };
    const state = compiler.create(source);

    expect(gpu.buffers[6]?.descriptor).toEqual({ size: 4, usage: 136 });
    expect(gpu.writes.slice(-2).map(write => write.data.byteLength)).toEqual([24, 32]);
    expect(state.source.colors).toBeNull();
  });

  it('does not require a compute pass to encode pending states', () => {
    const gpu = createHeightfieldDevice();
    const compiler = new HeightfieldGPUCompiler(gpu.device);
    const state = compiler.create(createHeightfieldSource());
    const encoder: SceneGPUCommandEncoder = {
      beginRenderPass: () => ({ end: () => undefined }),
      finish: () => ({})
    };

    compiler.encode(encoder, [state]);

    expect(state.pending).toBe(true);
  });

  it('skips settled states while encoding pending states in one compute pass', () => {
    const gpu = createHeightfieldDevice();
    const compiler = new HeightfieldGPUCompiler(gpu.device);
    const settled = createState(2, 2);
    settled.pending = false;
    const pending = createState(2, 2);
    const dispatchWorkgroups = vi.fn();
    const encoder: SceneGPUCommandEncoder = {
      beginComputePass: () => ({
        dispatchWorkgroups,
        end: vi.fn(),
        setBindGroup: vi.fn(),
        setPipeline: vi.fn()
      }),
      beginRenderPass: () => ({ end: () => undefined }),
      finish: () => ({})
    };

    compiler.encode(encoder, [settled, pending]);

    expect(dispatchWorkgroups).toHaveBeenCalledOnce();
    expect(settled.pending).toBe(false);
    expect(pending.pending).toBe(false);
  });

  it('reports devices missing compute support', () => {
    const device: SceneGPUDevice = {
      lost: new Promise(() => undefined),
      queue: { submit: () => undefined, writeBuffer: () => undefined },
      createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
      destroy: () => undefined
    };

    expect(supportsHeightfieldGPU(device)).toBe(false);
  });

  it('should split oversized linear workloads across baseline-safe dispatch dimensions', () => {
    const dispatchWorkgroups = vi.fn();
    const device: SceneGPUDevice = {
      lost: new Promise(() => undefined),
      queue: { submit: () => undefined, writeBuffer: () => undefined },
      createBindGroup: () => ({}),
      createBuffer: () => ({ destroy: () => undefined }),
      createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
      createComputePipeline: () => ({ getBindGroupLayout: () => ({}) }),
      createShaderModule: () => ({}),
      destroy: () => undefined
    };
    expect(supportsHeightfieldGPU(device)).toBe(true);
    if (!supportsHeightfieldGPU(device)) throw new TypeError('Expected a heightfield-capable device.');
    const compiler = new HeightfieldGPUCompiler(device);
    const encoder: SceneGPUCommandEncoder = {
      beginComputePass: () => ({
        dispatchWorkgroups,
        end: vi.fn(),
        setBindGroup: vi.fn(),
        setPipeline: vi.fn()
      }),
      beginRenderPass: () => ({ end: () => undefined }),
      finish: () => ({})
    };

    compiler.encode(encoder, [createState(2_048, 2_048)]);

    expect(dispatchWorkgroups).toHaveBeenCalledWith(256, 256);
    expect(HEIGHTFIELD_COMPUTE_SHADER).toContain('@builtin(num_workgroups)');
    expect(HEIGHTFIELD_COMPUTE_SHADER).toContain('@builtin(local_invocation_index)');
  });
});

function createState(rows: number, columns: number): HeightfieldGPUState {
  const buffer: SceneGPUBuffer = { destroy: () => undefined };
  return {
    bindGroup: {},
    colors: buffer,
    geometry: {
      colors: buffer,
      index: undefined,
      indexCount: 0,
      normals: buffer,
      positions: buffer,
      uvs: buffer,
      vertexCount: rows * columns
    },
    heights: buffer,
    parameters: buffer,
    pending: true,
    source: {
      colors: null,
      columns,
      heights: new Float32Array(rows * columns),
      origin: [0, 0],
      rows,
      spacing: 1
    }
  };
}

function createHeightfieldSource() {
  return {
    colors: new Uint8Array(24),
    columns: 3,
    heights: new Float32Array([0, 1, 2, 3, 4, 5]),
    origin: [0, 0] as [number, number],
    rows: 2,
    spacing: 1
  };
}

function createHeightfieldDevice(failure?: 'bind-group' | 'write' | 'buffer', failBufferAt = 0) {
  const buffers: Array<{ descriptor: { size: number; usage: number }; resource: SceneGPUBuffer }> = [];
  const destroyedBuffers: SceneGPUBuffer[] = [];
  const writes: Array<{ buffer: SceneGPUBuffer; data: ArrayBufferView }> = [];
  let bufferCount = 0;
  let writeCount = 0;
  const device = {
    lost: new Promise(() => undefined),
    queue: {
      submit: () => undefined,
      writeBuffer: (buffer, _offset, data) => {
        writeCount += 1;
        if (failure === 'write' && writeCount === 2) throw new Error('test failure');
        writes.push({ buffer, data });
      }
    },
    createBindGroup: () => {
      if (failure === 'bind-group') throw new Error('test failure');
      return {};
    },
    createBuffer: descriptor => {
      bufferCount += 1;
      if (failure === 'buffer' && bufferCount === failBufferAt) throw new Error('test failure');
      const resource: SceneGPUBuffer = { destroy: () => destroyedBuffers.push(resource) };
      buffers.push({ descriptor: descriptor as { size: number; usage: number }, resource });
      return resource;
    },
    createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
    createComputePipeline: () => ({ getBindGroupLayout: () => ({}) }),
    createShaderModule: () => ({}),
    destroy: () => undefined
  } satisfies SceneGPUDevice;
  return { buffers, destroyedBuffers, device, writes };
}
