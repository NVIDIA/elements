// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGpu, createMeshItem } from '../../../../test/rendering.js';
import { restoreScenePlatform, scenePlatform } from '../../gpu/platform.js';
import { identityMat4 } from '../../math/mat4.js';
import type { MeshRenderItem } from '../../rendering/render-items.js';
import { MeshRenderer } from './renderer.js';

type PreparationMode = 'mesh' | 'heightfield topology' | 'heightfield fallback';
const modes: readonly PreparationMode[] = ['mesh', 'heightfield topology', 'heightfield fallback'];
let renderer: MeshRenderer | undefined;

afterEach(() => {
  renderer?.disconnect();
  renderer = undefined;
  restoreScenePlatform();
});

describe('mesh preparation ownership', () => {
  it.each(modes)('cancels pending %s work when returning to the installed source', async mode => {
    const { gpu, requestRender, owner } = createRenderer(mode);
    scenePlatform.yieldForPreparation = async () => undefined;
    const installed = createLargeItem(mode);
    owner.prepare(installed, identityMat4());
    await vi.waitFor(() => expect(requestRender).toHaveBeenCalledOnce());
    owner.prepare(installed, identityMat4());
    expect(owner.readyFor(installed)).toBe(true);
    const yields = controlledYields();
    const latest = replaceInput(installed, mode);
    requestRender.mockClear();
    owner.prepare(latest, identityMat4());
    expect(yields).toHaveLength(1);
    owner.prepare(installed, identityMat4());
    vi.mocked(gpu.device.queue.writeBuffer).mockClear();
    const allocations = gpu.buffers.length;
    scenePlatform.yieldForPreparation = async () => undefined;
    yields[0]!.resolve();
    await flushPreparation();
    expect(requestRender).not.toHaveBeenCalled();
    expect(gpu.device.queue.writeBuffer).not.toHaveBeenCalled();
    expect(gpu.buffers).toHaveLength(allocations);
    expect(owner.readyFor(installed)).toBe(true);
    expect(owner.readyFor(latest)).toBe(false);
  });

  it.each(modes)('reports a current %s failure once and permits a fresh attempt', async mode => {
    const { onFailure, requestRender, owner } = createRenderer(mode);
    const yields = controlledYields();
    const item = createLargeItem(mode);
    owner.prepare(item, identityMat4());
    const error = new Error('current scheduling failure');
    yields[0]!.reject(error);
    await vi.waitFor(() => expect(onFailure).toHaveBeenCalledExactlyOnceWith(error));
    scenePlatform.yieldForPreparation = async () => undefined;
    owner.prepare(item, identityMat4());
    await vi.waitFor(() => expect(requestRender).toHaveBeenCalledOnce());
    owner.prepare(item, identityMat4());
    expect(owner.readyFor(item)).toBe(true);
    expect(onFailure).toHaveBeenCalledOnce();
  });

  it.each(modes)('ignores an obsolete %s rejection while retaining the newer pending generation', async mode => {
    const { gpu, onFailure, requestRender, owner } = createRenderer(mode);
    const yields = controlledYields();
    const first = createLargeItem(mode);
    const latest = replaceInput(first, mode);
    owner.prepare(first, identityMat4());
    owner.prepare(first, identityMat4());
    expect(yields).toHaveLength(1);
    owner.prepare(latest, identityMat4());
    expect(yields).toHaveLength(2);
    vi.mocked(gpu.device.queue.writeBuffer).mockClear();
    yields[0]!.reject(new Error('obsolete scheduling failure'));
    await flushPreparation();
    expect(onFailure).not.toHaveBeenCalled();
    expect(requestRender).not.toHaveBeenCalled();
    expect(gpu.device.queue.writeBuffer).not.toHaveBeenCalled();
    owner.prepare(latest, identityMat4());
    expect(yields).toHaveLength(2);
    scenePlatform.yieldForPreparation = async () => undefined;
    yields[1]!.resolve();
    await vi.waitFor(() => expect(requestRender).toHaveBeenCalledOnce());
    owner.prepare(latest, identityMat4());
    expect(owner.readyFor(latest)).toBe(true);
    expect(onFailure).not.toHaveBeenCalled();
  });

  for (const mode of modes) {
    it.each(['prune', 'disconnect'] as const)('cancels pending ' + mode + ' work on %s', async stop => {
      const { gpu, onFailure, requestRender, owner } = createRenderer(mode);
      const yields = controlledYields();
      owner.prepare(createLargeItem(mode), identityMat4());
      expect(yields).toHaveLength(1);
      if (stop === 'prune') owner.prune(new Set());
      else owner.disconnect();
      const allocations = gpu.buffers.length;
      vi.mocked(gpu.device.queue.writeBuffer).mockClear();
      yields[0]!.resolve();
      await flushPreparation();
      expect(gpu.buffers).toHaveLength(allocations);
      expect(gpu.device.queue.writeBuffer).not.toHaveBeenCalled();
      expect(requestRender).not.toHaveBeenCalled();
      expect(onFailure).not.toHaveBeenCalled();
      for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledOnce();
      if (stop === 'disconnect') renderer = undefined;
    });
  }

  it.each(modes)('releases %s candidates when allocation invalidates the current task', async mode => {
    const { gpu, onFailure, requestRender, owner } = createRenderer(mode);
    const yields = controlledYields();
    owner.prepare(createLargeItem(mode), identityMat4());
    const allocations = vi.mocked(gpu.device.createBuffer);
    const createBuffer = allocations.getMockImplementation();
    if (!createBuffer) throw new Error('Buffer allocation mock is unavailable.');
    allocations.mockImplementationOnce(descriptor => {
      const buffer = createBuffer(descriptor);
      owner.prune(new Set());
      return buffer;
    });
    scenePlatform.yieldForPreparation = async () => undefined;
    yields[0]!.resolve();
    await flushPreparation();
    expect(gpu.device.createBuffer).toHaveBeenCalled();
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledOnce();
    expect(requestRender).not.toHaveBeenCalled();
    expect(onFailure).not.toHaveBeenCalled();
  });

  it('coalesces heightfield topology work while adopting the latest height snapshot', async () => {
    const { gpu, requestRender, owner } = createRenderer('heightfield topology');
    const yields = controlledYields();
    const first = createLargeItem('heightfield topology');
    const source = first.data.heightfield;
    if (!source) throw new Error('Heightfield source is unavailable.');
    const heights = new Float32Array(source.heights.length).fill(7);
    const latest = { ...first, data: { ...first.data, heightfield: { ...source, heights } } };
    owner.prepare(first, identityMat4());
    owner.prepare(latest, identityMat4());
    expect(yields).toHaveLength(1);
    scenePlatform.yieldForPreparation = async () => undefined;
    yields[0]!.resolve();
    await vi.waitFor(() => expect(requestRender).toHaveBeenCalledOnce());
    expect(vi.mocked(gpu.device.queue.writeBuffer).mock.calls.some(([, , data]) => data === heights)).toBe(true);
    expect(vi.mocked(gpu.device.queue.writeBuffer).mock.calls.some(([, , data]) => data === source.heights)).toBe(
      false
    );
    owner.prepare(latest, identityMat4());
    expect(owner.readyFor(latest)).toBe(true);
  });
});

function createRenderer(mode: PreparationMode) {
  const gpu = createGpu();
  const onFailure = vi.fn();
  const requestRender = vi.fn();
  const device =
    mode === 'heightfield topology'
      ? { ...gpu.device, createComputePipeline: () => ({ getBindGroupLayout: () => ({}) }) }
      : gpu.device;
  const owner = new MeshRenderer(device, 'bgra8unorm', { onFailure, requestRender });
  renderer = owner;
  return { gpu, onFailure, requestRender, owner };
}

function createLargeItem(mode: PreparationMode): MeshRenderItem {
  const item = createMeshItem();
  if (mode !== 'mesh') {
    return {
      ...item,
      data: {
        ...item.data,
        heightfield: {
          colors: null,
          columns: 130,
          heights: new Float32Array(130 * 130),
          origin: [0, 0],
          rows: 130,
          spacing: 1
        },
        positions: null,
        normals: null,
        indices: null
      }
    };
  }
  const vertices = 16_386;
  return {
    ...item,
    data: {
      ...item.data,
      positions: new Float32Array(vertices * 3),
      normals: new Float32Array(vertices * 3),
      colors: new Float32Array(vertices * 4).fill(1),
      uvs: new Float32Array(vertices * 2)
    }
  };
}

function replaceInput(item: MeshRenderItem, mode: PreparationMode): MeshRenderItem {
  const source = item.data.heightfield;
  if (!source) {
    const positions = item.data.positions;
    if (!positions) throw new Error('Mesh positions are unavailable.');
    return { ...item, data: { ...item.data, positions: positions.slice() } };
  }
  const columns = mode === 'heightfield topology' ? 131 : source.columns;
  return {
    ...item,
    data: {
      ...item.data,
      heightfield: { ...source, columns, heights: new Float32Array(source.rows * columns).fill(1) }
    }
  };
}

function controlledYields() {
  const yields: Array<{ resolve(): void; reject(error: unknown): void }> = [];
  scenePlatform.yieldForPreparation = () =>
    new Promise<void>((resolve, reject) => {
      yields.push({ resolve, reject });
    });
  return yields;
}

async function flushPreparation(): Promise<void> {
  // Drain promise continuations through the next event-loop task.
  await new Promise<void>(resolve => setTimeout(resolve, 0));
}
