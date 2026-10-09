// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGpu, createMeshItem } from '../../../../test/rendering.js';
import { restoreScenePlatform, scenePlatform } from '../../gpu/platform.js';
import { composePreciseMat4, identityMat4 } from '../../math/mat4.js';
import { createPickPipelines } from '../../rendering/picking/pipelines.js';
import { PICK_UNIFORM_OFFSETS } from '../../rendering/picking/uniform-offsets.js';
import { MeshRenderer } from './renderer.js';
import {
  publishMeshGeometry,
  replaceMeshGeometry,
  setMeshGeometryProperty,
  takeMeshLayerRenderData
} from './layer-state.js';

let renderer: MeshRenderer | undefined;
afterEach(() => {
  renderer?.disconnect();
  renderer = undefined;
  restoreScenePlatform();
});

describe('MeshRenderer', () => {
  it.each(['indexed flat', 'explicit normals'])('emits no geometry writes for an empty %s publication', mode => {
    const gpu = createGpu();
    renderer = new MeshRenderer(gpu.device, 'bgra8unorm');
    const item = createMeshItem();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    replaceMeshGeometry(item.layer, {
      positions,
      ...(mode === 'indexed flat' ? { indices: new Uint32Array([0, 1, 2]) } : { normals: new Float32Array(9) })
    });
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    const allocations = gpu.buffers.length;
    const writes = vi.mocked(gpu.device.queue.writeBuffer);
    writes.mockClear();
    publishMeshGeometry(item.layer, { attribute: 'positions', source: positions, start: 0, count: 0 });
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    expect(writes).not.toHaveBeenCalled();
    expect(gpu.buffers).toHaveLength(allocations);
  });

  it('uploads complete nonindexed positions when another consumer drained an intermediate generation', () => {
    const gpu = createGpu();
    renderer = new MeshRenderer(gpu.device, 'bgra8unorm');
    const item = createMeshItem();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    replaceMeshGeometry(item.layer, { positions, normals: new Float32Array(9) });
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    const allocations = gpu.buffers.length;
    const positionBuffer = gpu.buffers[0];
    const writes = vi.mocked(gpu.device.queue.writeBuffer);
    writes.mockClear();
    positions[0] = 8;
    publishMeshGeometry(item.layer, { attribute: 'positions', source: positions, start: 0, count: 1 });
    takeMeshLayerRenderData(item.layer);
    positions[3] = 9;
    publishMeshGeometry(item.layer, { attribute: 'positions', source: positions, start: 1, count: 1 });
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    const uploads = writes.mock.calls.filter(([buffer]) => buffer === positionBuffer);
    expect(uploads).toHaveLength(1);
    expect(uploads[0]![1]).toBe(0);
    expect(uploads[0]![2]).toEqual(positions);
    expect(gpu.buffers).toHaveLength(allocations);
  });

  it('uploads every default color when removing colors after a pending partial publication', () => {
    const gpu = createGpu();
    renderer = new MeshRenderer(gpu.device, 'bgra8unorm');
    const item = createMeshItem();
    const colors = new Float32Array(12).fill(0.25);
    replaceMeshGeometry(item.layer, {
      positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
      normals: new Float32Array(9),
      colors
    });
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    const colorBuffer = gpu.buffers[3];
    const allocations = gpu.buffers.length;
    const writes = vi.mocked(gpu.device.queue.writeBuffer);
    writes.mockClear();
    publishMeshGeometry(item.layer, { attribute: 'colors', source: colors, start: 1, count: 1 });
    setMeshGeometryProperty(item.layer, 'colors', null);
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    const uploads = writes.mock.calls.filter(([buffer]) => buffer === colorBuffer);
    expect(uploads).toHaveLength(1);
    expect(uploads[0]![1]).toBe(0);
    expect(uploads[0]![2]).toEqual(new Float32Array(12).fill(1));
    expect(gpu.buffers).toHaveLength(allocations);
  });

  it('bounds upload calls when one source vertex appears in many separated corners', () => {
    const gpu = createGpu();
    renderer = new MeshRenderer(gpu.device, 'bgra8unorm');
    const item = createMeshItem();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const indices = Uint32Array.from({ length: 65 * 3 }, (_, corner) => corner % 3);
    replaceMeshGeometry(item.layer, { positions, indices });
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    const writes = vi.mocked(gpu.device.queue.writeBuffer);
    const positionBuffer = gpu.buffers[0];
    writes.mockClear();
    positions[2] = 1;
    publishMeshGeometry(item.layer, { attribute: 'positions', source: positions, start: 0, count: 1 });
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    expect(
      writes.mock.calls
        .filter(([buffer]) => buffer === positionBuffer)
        .map(([, offset, data]) => [offset, data.byteLength])
    ).toEqual([[0, indices.length * 12]]);
  });

  it('retains both edits when a newer publication cancels a pending indexed preparation', async () => {
    const gpu = createGpu();
    const requestRender = vi.fn();
    renderer = new MeshRenderer(gpu.device, 'bgra8unorm', { requestRender });
    scenePlatform.yieldForPreparation = async () => undefined;
    const item = createMeshItem();
    const count = 16_386;
    const positions = new Float32Array(count * 3);
    replaceMeshGeometry(item.layer, {
      positions,
      indices: Uint32Array.from({ length: count }, (_, index) => index),
      colors: new Float32Array(count * 4).fill(1)
    });
    const original = { ...item, data: takeMeshLayerRenderData(item.layer) };
    renderer.prepare(original, identityMat4());
    await vi.waitFor(() => expect(requestRender).toHaveBeenCalled());
    renderer.prepare(original, identityMat4());
    expect(renderer.readyFor(original)).toBe(true);
    const geometryBuffers = gpu.buffers.slice(0, 4);
    const allocations = gpu.buffers.length;
    const releases: Array<() => void> = [];
    scenePlatform.yieldForPreparation = () => new Promise<void>(resolve => releases.push(resolve));
    const writes = vi.mocked(gpu.device.queue.writeBuffer);
    writes.mockClear();
    requestRender.mockClear();
    positions[3] = 2;
    publishMeshGeometry(item.layer, { attribute: 'positions', source: positions, start: 1, count: 1 });
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    positions[300] = 3;
    publishMeshGeometry(item.layer, { attribute: 'positions', source: positions, start: 100, count: 1 });
    const newest = { ...item, data: takeMeshLayerRenderData(item.layer) };
    renderer.prepare(newest, identityMat4());
    expect(releases).toHaveLength(2);
    expect(writes).not.toHaveBeenCalled();
    scenePlatform.yieldForPreparation = async () => undefined;
    for (const release of releases) release();
    await vi.waitFor(() => expect(renderer?.readyFor(newest)).toBe(true));
    expect(requestRender).toHaveBeenCalledTimes(1);
    expect(
      writes.mock.calls
        .filter(([buffer]) => geometryBuffers.some(candidate => candidate === buffer))
        .map(([buffer, offset, data]) => [
          geometryBuffers.findIndex(candidate => candidate === buffer),
          offset,
          data.byteLength
        ])
    ).toEqual([
      [0, 12, 12],
      [0, 1200, 12],
      [1, 0, 36],
      [1, 1188, 36]
    ]);
    expect(gpu.buffers).toHaveLength(allocations);
    writes.mockClear();
    renderer.prepare(newest, identityMat4());
    expect(writes).not.toHaveBeenCalled();
  });

  it('uploads expanded corner and triangle ranges for indexed flat publications without reallocating buffers', () => {
    const gpu = createGpu();
    renderer = new MeshRenderer(gpu.device, 'bgra8unorm');
    const item = createMeshItem();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 9, 9, 9]);
    const colors = new Float32Array(20).fill(1);
    replaceMeshGeometry(item.layer, { positions, colors, indices: new Uint32Array([0, 1, 2, 2, 1, 3]) });
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    const allocations = gpu.buffers.length;
    const geometryBuffers = gpu.buffers.slice(0, 4);
    const writes = vi.mocked(gpu.device.queue.writeBuffer);
    writes.mockClear();
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    expect(writes).not.toHaveBeenCalled();
    positions[5] = 2;
    publishMeshGeometry(item.layer, { attribute: 'positions', source: positions, start: 1, count: 1 });
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    expect(
      writes.mock.calls
        .filter(([buffer]) => geometryBuffers.some(candidate => candidate === buffer))
        .map(([buffer, offset, data]) => [
          geometryBuffers.findIndex(candidate => candidate === buffer),
          offset,
          data.byteLength
        ])
    ).toEqual([
      [0, 12, 12],
      [0, 48, 12],
      [1, 0, 72]
    ]);
    expect(gpu.buffers).toHaveLength(allocations);
    writes.mockClear();
    colors[4] = 0.5;
    publishMeshGeometry(item.layer, { attribute: 'colors', source: colors, start: 1, count: 1 });
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    expect(
      writes.mock.calls
        .filter(([buffer]) => geometryBuffers.some(candidate => candidate === buffer))
        .map(([buffer, offset, data]) => [
          geometryBuffers.findIndex(candidate => candidate === buffer),
          offset,
          data.byteLength
        ])
    ).toEqual([
      [3, 16, 16],
      [3, 64, 16]
    ]);
    writes.mockClear();
    positions[12] = 7;
    publishMeshGeometry(item.layer, { attribute: 'positions', source: positions, start: 4, count: 1 });
    renderer.prepare({ ...item, data: takeMeshLayerRenderData(item.layer) }, identityMat4());
    expect(writes).not.toHaveBeenCalled();
  });

  it('reuses prepared geometry, uniforms, and bind groups across unchanged draws', () => {
    const gpu = createGpu();
    renderer = new MeshRenderer(gpu.device, 'bgra8unorm');
    const item = createMeshItem();
    const projection = identityMat4();
    expect(renderer.readyFor(item)).toBe(false);
    renderer.prepare(item, projection);
    expect(renderer.readyFor(item)).toBe(true);
    renderer.draw(gpu.pass, item, false);
    expect(gpu.pass.draw).toHaveBeenCalledWith(3, 1);
    expect(gpu.pass.setVertexBuffer).toHaveBeenCalledTimes(4);
    const allocations = gpu.buffers.length;
    const groups = vi.mocked(gpu.device.createBindGroup).mock.calls.length;
    vi.mocked(gpu.device.queue.writeBuffer).mockClear();
    renderer.prepare(item, projection);
    renderer.draw(gpu.pass, item, false);
    expect(gpu.buffers).toHaveLength(allocations);
    expect(gpu.device.createBindGroup).toHaveBeenCalledTimes(groups);
    expect(gpu.device.queue.writeBuffer).not.toHaveBeenCalled();
    renderer.prune(new Set([item.layer]));
    expect(gpu.buffers.every(buffer => buffer.destroy.mock.calls.length === 0)).toBe(true);
    renderer.prune(new Set());
    expect(gpu.buffers.every(buffer => buffer.destroy.mock.calls.length === 1)).toBe(true);
    expect(renderer.readyFor(item)).toBe(false);
  });

  it('uploads the mesh ID at its uniform offset and uses the matching pick pipeline', () => {
    const gpu = createGpu();
    renderer = new MeshRenderer(gpu.device, 'bgra8unorm');
    const item = createMeshItem();
    renderer.prepare(item, identityMat4());
    const pipelines = createPickPipelines(gpu.device).mesh;
    vi.mocked(gpu.device.queue.writeBuffer).mockClear();
    renderer.drawPick({ item, pass: gpu.pass, pickId: 42, pipelines, transparent: false });
    expect(gpu.device.queue.writeBuffer).toHaveBeenCalledWith(
      expect.anything(),
      PICK_UNIFORM_OFFSETS.mesh,
      new Uint32Array([42])
    );
    expect(gpu.pass.setPipeline).toHaveBeenCalledWith(pipelines.opaque);
    expect(gpu.pass.draw).toHaveBeenCalledWith(3, 1);
  });

  it('preserves cancellation precision across successive matrix uniform uploads', () => {
    const gpu = createGpu();
    renderer = new MeshRenderer(gpu.device, 'bgra8unorm');
    const item = createMeshItem();
    const projection = composePreciseMat4([1_000_000.01, 0, 0], [0, 0, 0, 1]);
    for (const offset of [-1_000_000, -999_999]) {
      vi.mocked(gpu.device.queue.writeBuffer).mockClear();
      renderer.prepare({ ...item, frameMatrix: composePreciseMat4([offset, 0, 0], [0, 0, 0, 1]) }, projection);
      const uploads = vi.mocked(gpu.device.queue.writeBuffer).mock.calls;
      const uniforms = uploads.find(([, , data]) => data instanceof Float32Array && data.length === 40)?.[2];
      expect(uniforms).toBeInstanceOf(Float32Array);
      if (!(uniforms instanceof Float32Array)) throw new Error('Mesh matrix uniforms were not uploaded.');
      expect(uniforms[12]).toBe(Math.fround(projection[12]! + offset));
    }
    projection[0] = Number.MAX_VALUE;
    expect(() => renderer?.prepare(item, projection)).toThrow('finite Float32');
  });

  it('releases every candidate buffer when the first geometry upload fails', () => {
    const gpu = createGpu();
    renderer = new MeshRenderer(gpu.device, 'bgra8unorm');
    vi.mocked(gpu.device.queue.writeBuffer).mockImplementationOnce(() => {
      throw new Error('upload rejected');
    });
    expect(() => renderer?.prepare(createMeshItem(), identityMat4())).toThrow('upload rejected');
    expect(gpu.buffers.length).toBeGreaterThan(0);
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledTimes(1);
  });
});
