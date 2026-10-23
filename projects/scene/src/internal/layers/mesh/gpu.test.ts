// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { createGpu, createMeshItem } from '../../../../test/rendering.js';
import type { SceneGPUCommandEncoder } from '../../gpu/platform.js';
import { restoreScenePlatform, scenePlatform } from '../../gpu/platform.js';
import { identityMat4 } from '../../math/mat4.js';
import { MeshGPUCompiler, meshGPUIsEligible, sameMeshGPUTopology } from './gpu.js';
import { MeshRenderer } from './renderer.js';
import { destroyMeshGeometryResources } from './resources.js';
import type { MeshRenderData } from './render-data.js';

function createCompiler() {
  const gpu = createGpu();
  const device = { ...gpu.device, createComputePipeline: vi.fn(() => ({ getBindGroupLayout: () => ({}) })) };
  const compiler = new MeshGPUCompiler(device);
  const computePass = { dispatchWorkgroups: vi.fn(), end: vi.fn(), setBindGroup: vi.fn(), setPipeline: vi.fn() };
  const encoder: SceneGPUCommandEncoder = {
    ...device.createCommandEncoder(),
    beginComputePass: vi.fn(() => computePass)
  };
  return { ...gpu, compiler, device, encoder, computePass, writes: vi.mocked(device.queue.writeBuffer) };
}

function source(): MeshRenderData {
  const base = createMeshItem().data;
  return {
    ...base,
    topologyVersion: 0,
    geometryVersions: { positions: 0, normals: 0, indices: 0, colors: 0, uvs: 0 },
    normals: null,
    positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
    indices: new Uint32Array([0, 1, 2]),
    colors: null,
    uvs: null
  };
}

describe('GPU flat mesh preparation', () => {
  it('uploads source arrays once and generates retained vertex attributes before drawing', () => {
    const gpu = createCompiler();
    const state = gpu.compiler.create(source());
    expect(gpu.writes.mock.calls.map(([, , data]) => data.byteLength)).toEqual([36, 12]);
    expect(state.geometry.vertexCount).toBe(3);
    expect(state.geometry.index).toBeUndefined();
    gpu.compiler.encode(gpu.encoder, [state]);
    expect(gpu.computePass.dispatchWorkgroups).toHaveBeenCalledExactlyOnceWith(1, 1);
    expect(state.pending).toBe(0);
    gpu.compiler.encode(gpu.encoder, [state]);
    expect(gpu.encoder.beginComputePass).toHaveBeenCalledOnce();
    gpu.compiler.destroy(state);
    destroyMeshGeometryResources(state.geometry);
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledOnce();
  });

  it('uploads only a covered source range and merges pending attribute changes', () => {
    const gpu = createCompiler();
    const first = source();
    const state = gpu.compiler.create(first);
    gpu.compiler.encode(gpu.encoder, [state]);
    gpu.writes.mockClear();
    const updated = {
      ...first,
      positions: first.positions!.slice(),
      geometryVersions: { ...first.geometryVersions, positions: 1 },
      geometryUploadBaseVersions: { positions: 0 },
      geometryUploadRanges: [{ attribute: 'positions' as const, offset: 12, size: 12 }]
    };
    gpu.compiler.update(state, updated);
    expect(gpu.writes.mock.calls.map(([, offset, data]) => [offset, data.byteLength])).toEqual([[12, 12]]);
    expect(gpu.writes.mock.calls[0]![0]).toBe(state.inputs.positions);
    expect(state.pending).toBe(1);
    expect(gpu.buffers).toHaveLength(9);
    gpu.compiler.update(state, updated);
    expect(gpu.writes).toHaveBeenCalledOnce();
  });

  it('refreshes the complete source when another consumer drained an intermediate generation', () => {
    const gpu = createCompiler();
    const first = source();
    const state = gpu.compiler.create(first);
    gpu.writes.mockClear();
    gpu.compiler.update(state, {
      ...first,
      positions: first.positions!.slice(),
      geometryVersions: { ...first.geometryVersions, positions: 2 },
      geometryUploadBaseVersions: { positions: 1 },
      geometryUploadRanges: [{ attribute: 'positions', offset: 12, size: 12 }]
    });
    expect(gpu.writes.mock.calls.map(([, offset, data]) => [offset, data.byteLength])).toEqual([[0, 36]]);
  });

  it('performs no upload or dispatch for an empty publication', () => {
    const gpu = createCompiler();
    const first = source();
    const state = gpu.compiler.create(first);
    gpu.compiler.encode(gpu.encoder, [state]);
    gpu.writes.mockClear();
    gpu.compiler.update(state, {
      ...first,
      geometryVersions: { ...first.geometryVersions, positions: 1 },
      geometryUploadBaseVersions: { positions: 0 },
      geometryUploadRanges: []
    });
    gpu.compiler.encode(gpu.encoder, [state]);
    expect(gpu.writes).not.toHaveBeenCalled();
    expect(gpu.encoder.beginComputePass).toHaveBeenCalledOnce();
  });

  it('retains pending work if no compute pass is available', () => {
    const gpu = createCompiler();
    const state = gpu.compiler.create(source());
    gpu.compiler.encode({ ...gpu.encoder, beginComputePass: undefined }, [state]);
    expect(state.pending).toBe(7);
  });

  it.each(['allocation', 'binding', 'upload'] as const)('releases all acquired buffers after a failed %s', failure => {
    const gpu = createCompiler();
    if (failure === 'allocation')
      vi.mocked(gpu.device.createBuffer).mockImplementationOnce(() => {
        throw new Error('allocation');
      });
    if (failure === 'binding')
      vi.mocked(gpu.device.createBindGroup).mockImplementationOnce(() => {
        throw new Error('binding');
      });
    if (failure === 'upload')
      gpu.writes.mockImplementationOnce(() => {
        throw new Error('upload');
      });
    expect(() => gpu.compiler.create(source())).toThrow(failure);
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledOnce();
  });

  it('keeps explicit normals, small meshes, and oversized storage on the CPU path', () => {
    const gpu = createCompiler();
    const small = source();
    const large = { ...small, positions: new Float32Array(16_386 * 3), indices: null };
    expect(meshGPUIsEligible(small, gpu.device)).toBe(false);
    expect(meshGPUIsEligible(large, gpu.device)).toBe(true);
    expect(meshGPUIsEligible({ ...large, normals: new Float32Array(16_386 * 3) }, gpu.device)).toBe(false);
    expect(meshGPUIsEligible(large, { ...gpu.device, limits: { maxStorageBufferBindingSize: 1_024 } })).toBe(false);
    const state = gpu.compiler.create(small);
    expect(sameMeshGPUTopology(state, small)).toBe(true);
    expect(sameMeshGPUTopology(state, { ...small, colors: new Float32Array(12) })).toBe(false);
    expect(sameMeshGPUTopology(state, { ...small, topologyVersion: 1 })).toBe(false);
  });

  it('rechecks coordinate safety when a position generation changes', () => {
    const gpu = createCompiler();
    const positions = new Float32Array(16_386 * 3);
    const data = { ...source(), positions, indices: null };
    expect(meshGPUIsEligible(data, gpu.device)).toBe(true);
    positions[0] = 1e30;
    expect(
      meshGPUIsEligible({ ...data, geometryVersions: { ...data.geometryVersions, positions: 1 } }, gpu.device)
    ).toBe(false);
    positions[0] = 1;
    expect(
      meshGPUIsEligible({ ...data, geometryVersions: { ...data.geometryVersions, positions: 2 } }, gpu.device)
    ).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9])('rolls back acquired buffers when allocation %s fails', index => {
    const gpu = createCompiler();
    const allocate = vi.mocked(gpu.device.createBuffer);
    const original = allocate.getMockImplementation()!;
    allocate.mockImplementation(descriptor => {
      if (gpu.buffers.length === index - 1) throw new Error('allocation');
      return original(descriptor);
    });
    expect(() => gpu.compiler.create(source())).toThrow('allocation');
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledOnce();
  });

  it('uses generated geometry in color draws and releases it when switching to CPU preparation', () => {
    const gpu = createCompiler();
    const owner = new MeshRenderer(gpu.device, 'bgra8unorm');
    const item = createMeshItem();
    const data = { ...source(), positions: new Float32Array(16_386 * 3), indices: null };
    try {
      owner.prepare({ ...item, data }, identityMat4());
      expect(owner.readyFor({ ...item, data })).toBe(true);
      owner.encodeCompute(gpu.encoder);
      owner.draw(gpu.pass, { ...item, data }, false);
      expect(gpu.pass.draw).toHaveBeenCalledWith(16_386, 1);
      const generated = gpu.buffers.slice(0, 9);
      const small = { ...source(), topologyVersion: 1 };
      owner.prepare({ ...item, data: small }, identityMat4());
      for (const buffer of generated) expect(buffer.destroy).toHaveBeenCalledOnce();
      expect(owner.readyFor({ ...item, data: small })).toBe(true);
    } finally {
      owner.disconnect();
    }
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledOnce();
  });

  it('retires both generated mesh and heightfield buffers when switching preparation paths', () => {
    const gpu = createCompiler();
    const owner = new MeshRenderer(gpu.device, 'bgra8unorm');
    const item = createMeshItem();
    const data = { ...source(), positions: new Float32Array(16_386 * 3), indices: null };
    try {
      owner.prepare({ ...item, data }, identityMat4());
      const generated = gpu.buffers.slice(0, 9);
      const firstHeightfieldBuffer = gpu.buffers.length;
      const terrainItem = {
        ...item,
        data: {
          ...data,
          positions: null,
          heightfield: {
            columns: 2,
            rows: 2,
            heights: new Float32Array(4),
            colors: null,
            origin: [0, 0] as const,
            spacing: 1
          }
        }
      };
      owner.prepare(terrainItem, identityMat4());
      for (const buffer of generated) expect(buffer.destroy).toHaveBeenCalledOnce();
      owner.encodeCompute(gpu.encoder);
      owner.draw(gpu.pass, terrainItem, false);
      expect(gpu.pass.drawIndexed).toHaveBeenCalledWith(6, 1);
      const heightfield = gpu.buffers.slice(firstHeightfieldBuffer);
      expect(heightfield).toHaveLength(8);
      owner.prepare({ ...item, data }, identityMat4());
      expect(owner.readyFor({ ...item, data })).toBe(true);
      for (const buffer of heightfield) expect(buffer.destroy).toHaveBeenCalledOnce();
    } finally {
      owner.disconnect();
    }
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledOnce();
  });

  it('cancels a pending CPU generation when a GPU generation replaces it', async () => {
    const gpu = createCompiler();
    const requestRender = vi.fn();
    const owner = new MeshRenderer(gpu.device, 'bgra8unorm', { requestRender });
    const item = createMeshItem();
    const data = { ...source(), positions: new Float32Array(16_386 * 3), indices: null };
    let resume = () => {};
    scenePlatform.yieldForPreparation = () =>
      new Promise<void>(resolve => {
        resume = resolve;
      });
    try {
      owner.prepare({ ...item, data: { ...data, normals: new Float32Array(data.positions.length) } }, identityMat4());
      owner.prepare({ ...item, data }, identityMat4());
      const allocations = gpu.buffers.length;
      resume();
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(gpu.buffers).toHaveLength(allocations);
      expect(requestRender).not.toHaveBeenCalled();
      expect(owner.readyFor({ ...item, data })).toBe(true);
    } finally {
      owner.disconnect();
      restoreScenePlatform();
    }
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledOnce();
  });

  it('falls back to CPU preparation after compute pipeline creation fails', async () => {
    const gpu = createCompiler();
    gpu.device.createComputePipeline.mockImplementation(() => {
      throw new Error('compute unavailable');
    });
    const requestRender = vi.fn();
    const owner = new MeshRenderer(gpu.device, 'bgra8unorm', { requestRender });
    const item = { ...createMeshItem(), data: { ...source(), positions: new Float32Array(16_386 * 3), indices: null } };
    try {
      owner.prepare(item, identityMat4());
      await vi.waitFor(() => expect(requestRender).toHaveBeenCalledOnce());
      owner.prepare(item, identityMat4());
      expect(owner.readyFor(item)).toBe(true);
    } finally {
      owner.disconnect();
    }
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledOnce();
  });
});
