// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGpu, createLabelItem } from '../../../../test/rendering.js';
import { identityMat4 } from '../../math/mat4.js';
import { LabelRenderer, supportsLabelRenderer } from './renderer.js';
import { LabelBuffer } from './buffer.js';
import { LABEL_GLYPH_STRIDE } from './glyph-run.js';
import { publishLabelLayer, setLabelLayerCount, setLabelLayerSource, takeLabelLayerRenderData } from './layer-state.js';
import { configureSceneTesting, resetSceneTesting } from '../../testing/scene.js';
import type { LabelRenderItem } from '../../rendering/render-items.js';

import { MAX_LABEL_TEXT_UNITS } from './limits.js';
import { LABEL_TEXT_LIMIT } from '../../diagnostics/errors.js';
import { LABEL } from '../../records/layouts/built-ins.js';

const frame = { pixelRatio: 1, viewportHeight: 100, viewportWidth: 200 };

let renderer: LabelRenderer | undefined;
afterEach(() => {
  renderer?.disconnect();
  renderer = undefined;
  resetSceneTesting();
});

describe('LabelRenderer', () => {
  it.each(['buffer', 'binding'] as const)('caps spare record capacity and uploads to the device %s limit', limit => {
    const gpu = createGpu();
    Object.defineProperty(gpu.device, 'limits', {
      value: {
        maxBufferSize: limit === 'buffer' ? 256 : 65_536,
        maxStorageBufferBindingSize: limit === 'binding' ? 256 : 65_536
      }
    });
    const onFailure = vi.fn();
    renderer = new LabelRenderer(gpu.device, () => {}, onFailure);
    const initial = createLabelItem();
    const source = new LabelBuffer({
      capacity: 256,
      records: [{ text: 'A' }, ...Array.from({ length: 8 }, () => ({ text: '' }))]
    });
    setLabelLayerSource(initial.layer, source);
    setLabelLayerCount(initial.layer, 1);
    const item = { ...initial, data: takeLabelLayerRenderData(initial.layer) };
    const start = gpu.buffers.length;
    renderer.prepare(item, identityMat4(), frame);
    const label = gpu.buffers[start + 1]!;
    expect(label.size).toBe(240);
    expect(gpu.buffers.every(buffer => buffer.size <= 256)).toBe(true);
    expect(vi.mocked(gpu.device.queue.writeBuffer).mock.calls.find(call => call[0] === label)?.[2].byteLength).toBe(
      240
    );
    vi.mocked(gpu.device.queue.writeBuffer).mockClear();
    const dirty = {
      ...item,
      data: {
        ...item.data,
        uploadRanges: [
          { offset: 224, size: 64 },
          { offset: 512, size: 32 }
        ]
      }
    };
    renderer.prepare(dirty, identityMat4(), frame);
    expect(
      vi
        .mocked(gpu.device.queue.writeBuffer)
        .mock.calls.filter(call => call[0] === label)
        .map(call => [call[1], call[2].byteLength])
    ).toEqual([[224, 16]]);
    const grown = { ...item, data: { ...item.data, count: Math.floor(256 / LABEL.stride) } };
    renderer.prepare(grown, identityMat4(), frame);
    expect(renderer.readyFor(grown)).toBe(true);
    const errors: CustomEvent[] = [];
    item.layer.addEventListener('nve-scene-error', event => errors.push(event));
    renderer.prepare(
      { ...grown, data: { ...grown.data, count: Math.floor(256 / LABEL.stride) + 1 } },
      identityMat4(),
      frame
    );
    expect(errors.at(-1)?.detail.code).toBe(LABEL_TEXT_LIMIT);
    expect(onFailure).not.toHaveBeenCalled();
    renderer.prepare(item, identityMat4(), frame);
    vi.mocked(gpu.pass.draw).mockClear();
    renderer.draw(gpu.pass, item);
    expect(gpu.pass.draw).toHaveBeenCalledWith(6);
  });

  it('caps record allocation at the package limit when the CPU source reserves more capacity', () => {
    const gpu = createGpu();
    renderer = new LabelRenderer(gpu.device);
    const item = createLabelItem('A');
    setLabelLayerSource(item.layer, new LabelBuffer({ capacity: 100_000, records: [{ text: 'A' }] }));
    renderer.prepare({ ...item, data: takeLabelLayerRenderData(item.layer) }, identityMat4(), frame);
    expect(gpu.buffers[1]?.size).toBe(65_536 * LABEL.stride);
  });
  it.each(['package', 'buffer', 'binding'] as const)(
    'rejects the %s glyph budget before GPU allocation and recovers on valid text',
    budget => {
      const gpu = createGpu();
      const onFailure = vi.fn();
      if (budget !== 'package') {
        Object.defineProperty(gpu.device, 'limits', {
          value: {
            maxBufferSize: budget === 'buffer' ? 72 : 1024,
            maxStorageBufferBindingSize: budget === 'binding' ? 72 : 1024
          }
        });
      }
      renderer = new LabelRenderer(gpu.device, () => {}, onFailure);
      const item = createLabelItem(budget === 'package' ? 'A'.repeat(MAX_LABEL_TEXT_UNITS + 1) : 'AAA');
      const errors: CustomEvent[] = [];
      item.layer.addEventListener('nve-scene-error', event => errors.push(event));
      const allocationCount = gpu.buffers.length;
      renderer.prepare(item, identityMat4(), frame);
      expect(gpu.buffers).toHaveLength(allocationCount);
      expect(errors.at(-1)?.detail.code).toBe(LABEL_TEXT_LIMIT);
      expect(onFailure).not.toHaveBeenCalled();
      expect(renderer.readyFor(item)).toBe(true);
      renderer.draw(gpu.pass, item);
      expect(gpu.pass.draw).not.toHaveBeenCalled();
      const valid = { ...item, data: { ...item.data, texts: ['A'], textVersion: item.data.textVersion + 1 } };
      renderer.prepare(valid, identityMat4(), frame);
      expect(renderer.readyFor(valid)).toBe(true);
      renderer.draw(gpu.pass, valid);
      expect(gpu.pass.draw).toHaveBeenCalledWith(6);
    }
  );

  it('keeps rounded glyph capacity within the device storage binding limit', () => {
    const gpu = createGpu();
    Object.defineProperty(gpu.device, 'limits', {
      value: { maxBufferSize: 1024, maxStorageBufferBindingSize: 108 }
    });
    renderer = new LabelRenderer(gpu.device);
    const item = createLabelItem('AAA');
    renderer.prepare(item, identityMat4(), frame);
    expect(gpu.buffers.at(-1)?.size).toBe(108);
    renderer.draw(gpu.pass, item);
    expect(gpu.pass.draw).toHaveBeenCalledWith(18);
  });

  it('invalidates cached prefix budgets when published text changes within the same array', () => {
    const gpu = createGpu();
    renderer = new LabelRenderer(gpu.device);
    const initial = createLabelItem('A');
    const texts = ['A', 'B'];
    const item = { ...initial, data: { ...initial.data, texts, count: 1 } };
    renderer.prepare(item, identityMat4(), frame);
    const empty = { ...item, data: { ...item.data, count: 0 } };
    renderer.prepare(empty, identityMat4(), frame);
    renderer.prepare(item, identityMat4(), frame);
    texts[0] = 'A'.repeat(MAX_LABEL_TEXT_UNITS + 1);
    const changed = { ...item, data: { ...item.data, textVersion: item.data.textVersion + 1 } };
    vi.mocked(gpu.pass.draw).mockClear();
    const errors: CustomEvent[] = [];
    item.layer.addEventListener('nve-scene-error', event => errors.push(event));
    renderer.prepare(changed, identityMat4(), frame);
    renderer.draw(gpu.pass, changed);
    expect(gpu.pass.draw).not.toHaveBeenCalled();
    expect(errors.at(-1)?.detail.code).toBe(LABEL_TEXT_LIMIT);
    texts[0] = 'A';
    const recovered = { ...changed, data: { ...changed.data, textVersion: changed.data.textVersion + 1 } };
    renderer.prepare(recovered, identityMat4(), frame);
    renderer.draw(gpu.pass, recovered);
    expect(gpu.pass.draw).toHaveBeenCalledWith(6);
  });

  it('ignores a stale scheduling failure without removing the latest pending glyph task', async () => {
    const gpu = createGpu();
    const requestRender = vi.fn();
    const onFailure = vi.fn();
    const yields = controlledLabelYields();
    renderer = new LabelRenderer(gpu.device, requestRender, onFailure);
    const first = createLabelItem('A'.repeat(9000));
    const latest = {
      ...first,
      data: { ...first.data, texts: ['B'.repeat(9001)], textVersion: first.data.textVersion + 1 }
    };
    renderer.prepare(first, identityMat4(), frame);
    renderer.prepare(first, identityMat4(), frame);
    expect(yields).toHaveLength(1);
    renderer.prepare(latest, identityMat4(), frame);
    expect(yields).toHaveLength(2);
    yields[0]!.reject(new Error('obsolete label failure'));
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    expect(onFailure).not.toHaveBeenCalled();
    expect(requestRender).not.toHaveBeenCalled();
    renderer.prepare(latest, identityMat4(), frame);
    expect(yields).toHaveLength(2);
    configureSceneTesting({ yieldForPreparation: async () => undefined });
    yields[1]!.resolve();
    await vi.waitFor(() => expect(requestRender).toHaveBeenCalledOnce());
    expect(renderer.readyFor(latest)).toBe(true);
    renderer.draw(gpu.pass, latest);
    expect(gpu.pass.draw).toHaveBeenCalledWith(54006);
  });

  it('reports a current glyph preparation failure once and permits a fresh attempt', async () => {
    const gpu = createGpu();
    const requestRender = vi.fn();
    const onFailure = vi.fn();
    const yields = controlledLabelYields();
    renderer = new LabelRenderer(gpu.device, requestRender, onFailure);
    const item = createLabelItem('A'.repeat(9000));
    renderer.prepare(item, identityMat4(), frame);
    const error = new Error('current label failure');
    yields[0]!.reject(error);
    await vi.waitFor(() => expect(onFailure).toHaveBeenCalledExactlyOnceWith(error));
    configureSceneTesting({ yieldForPreparation: async () => undefined });
    renderer.prepare(item, identityMat4(), frame);
    await vi.waitFor(() => expect(requestRender).toHaveBeenCalledOnce());
    expect(renderer.readyFor(item)).toBe(true);
    expect(onFailure).toHaveBeenCalledOnce();
  });

  it.each(['suspend', 'prune', 'disconnect'] as const)('cancels pending glyph work on %s', async stop => {
    const gpu = createGpu();
    const requestRender = vi.fn();
    const onFailure = vi.fn();
    const yields = controlledLabelYields();
    renderer = new LabelRenderer(gpu.device, requestRender, onFailure);
    const item = createLabelItem('A'.repeat(9000));
    renderer.prepare(item, identityMat4(), frame);
    if (stop === 'prune') renderer.prune(new Set());
    else if (stop === 'disconnect') renderer.disconnect();
    else renderer.prepare({ ...item, data: { ...item.data, ready: false } }, identityMat4(), frame);
    const allocations = gpu.buffers.length;
    vi.mocked(gpu.device.queue.writeBuffer).mockClear();
    yields[0]!.resolve();
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    expect(gpu.buffers).toHaveLength(allocations);
    expect(gpu.device.queue.writeBuffer).not.toHaveBeenCalled();
    expect(requestRender).not.toHaveBeenCalled();
    expect(onFailure).not.toHaveBeenCalled();
    if (stop === 'disconnect') renderer = undefined;
  });

  it('prepares six vertices per visible glyph and caches draw bind groups', () => {
    const gpu = createGpu();
    renderer = new LabelRenderer(gpu.device);
    const item = createLabelItem('robot');
    expect(renderer.readyFor(item)).toBe(false);
    renderer.prepare(item, identityMat4(), { pixelRatio: 2, viewportHeight: 100, viewportWidth: 200 });
    expect(renderer.readyFor(item)).toBe(true);
    renderer.draw(gpu.pass, item);
    expect(gpu.pass.draw).toHaveBeenCalledWith(30);
    const liveBuffers = gpu.buffers.filter(buffer => buffer.destroy.mock.calls.length === 0);
    const allocations = gpu.buffers.length;
    const groups = vi.mocked(gpu.device.createBindGroup).mock.calls.length;
    renderer.prepare(item, identityMat4(), { pixelRatio: 2, viewportHeight: 100, viewportWidth: 200 });
    renderer.draw(gpu.pass, item);
    expect(gpu.buffers).toHaveLength(allocations);
    expect(gpu.device.createBindGroup).toHaveBeenCalledTimes(groups);
    renderer.drawPick(gpu.pass, item, 9);
    expect(gpu.device.queue.writeBuffer).toHaveBeenLastCalledWith(expect.anything(), 160, new Uint32Array([9]));
    expect(gpu.pass.draw).toHaveBeenLastCalledWith(30);
    renderer.prune(new Set([item.layer]));
    expect(liveBuffers.every(buffer => buffer.destroy.mock.calls.length === 0)).toBe(true);
    renderer.prune(new Set());
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledTimes(1);
    expect(gpu.textures[0]?.destroy).not.toHaveBeenCalled();
  });

  it('treats empty text as ready and emits no color or pick draw', () => {
    const gpu = createGpu();
    renderer = new LabelRenderer(gpu.device);
    const item = createLabelItem('');
    expect(renderer.readyFor(item)).toBe(true);
    renderer.prepare(item, identityMat4(), { pixelRatio: 1, viewportHeight: 10, viewportWidth: 10 });
    renderer.draw(gpu.pass, item);
    renderer.drawPick(gpu.pass, item, 1);
    expect(gpu.pass.draw).not.toHaveBeenCalled();
    expect(supportsLabelRenderer(gpu.device)).toBe(true);
    expect(supportsLabelRenderer({ ...gpu.device, queue: { submit: vi.fn() } })).toBe(false);
  });

  it('reuses ragged glyph prefixes for count changes including empty and whitespace labels', () => {
    const gpu = createGpu();
    renderer = new LabelRenderer(gpu.device);
    const { item } = createLabelTestItem(['A', ' \t\r\n', '🙂', 'BC D', '']);
    renderer.prepare(item, identityMat4(), frame);
    renderer.draw(gpu.pass, item);
    renderer.drawPick(gpu.pass, item, 10);
    const allocations = gpu.buffers.length;
    const groups = vi.mocked(gpu.device.createBindGroup).mock.calls.length;
    const glyphBytes = vi
      .mocked(gpu.device.queue.writeBuffer)
      .mock.calls.map(([, , bytes]) => bytes)
      .find(bytes => bytes.byteLength === 5 * LABEL_GLYPH_STRIDE);
    expect(glyphBytes).toBeInstanceOf(Uint8Array);
    if (!glyphBytes) throw new Error('Initial glyph upload is unavailable.');
    const glyphView = new DataView(glyphBytes.buffer, glyphBytes.byteOffset, glyphBytes.byteLength);
    expect(Array.from({ length: 5 }, (_, index) => glyphView.getUint32(index * LABEL_GLYPH_STRIDE, true))).toEqual([
      0, 2, 3, 3, 3
    ]);

    for (const [count, glyphs] of [
      [3, 2],
      [1, 1],
      [0, 0],
      [4, 5],
      [5, 5]
    ] as const) {
      setLabelLayerCount(item.layer, count);
      const next = snapshot(item);
      vi.mocked(gpu.device.queue.writeBuffer).mockClear();
      gpu.pass.draw.mockClear();
      renderer.prepare(next, identityMat4(), frame);
      expect(renderer.readyFor(next)).toBe(true);
      // Count changes upload uniforms only, retaining glyph bytes and bind groups.
      expect(gpu.device.queue.writeBuffer).toHaveBeenCalledOnce();
      expect(vi.mocked(gpu.device.queue.writeBuffer).mock.calls[0]?.[2]).toBeInstanceOf(Float32Array);
      renderer.draw(gpu.pass, next);
      renderer.drawPick(gpu.pass, next, 10);
      if (glyphs === 0) expect(gpu.pass.draw).not.toHaveBeenCalled();
      else expect(gpu.pass.draw).toHaveBeenNthCalledWith(2, glyphs * 6);
    }
    expect(gpu.buffers).toHaveLength(allocations);
    expect(gpu.device.createBindGroup).toHaveBeenCalledTimes(groups);
  });

  it('reuses glyph prefixes when the published active source count shrinks and grows', () => {
    const gpu = createGpu();
    renderer = new LabelRenderer(gpu.device);
    const { item, source } = createLabelTestItem(['A', 'BB', 'CCC']);
    renderer.prepare(item, identityMat4(), frame);
    const glyphBuffer = vi
      .mocked(gpu.device.queue.writeBuffer)
      .mock.calls.find(([, , bytes]) => bytes.byteLength === 6 * LABEL_GLYPH_STRIDE)?.[0];
    expect(glyphBuffer).toBeDefined();
    const allocations = gpu.buffers.length;
    for (const [count, glyphs] of [
      [2, 3],
      [3, 6]
    ] as const) {
      source.setCount(count);
      publishLabelLayer(item.layer, { activeCount: count, count: 0, start: 2 });
      const next = snapshot(item);
      expect(next.data.textVersion).toBe(item.data.textVersion);
      vi.mocked(gpu.device.queue.writeBuffer).mockClear();
      renderer.prepare(next, identityMat4(), frame);
      renderer.draw(gpu.pass, next);
      expect(renderer.readyFor(next)).toBe(true);
      expect(gpu.pass.draw).toHaveBeenLastCalledWith(glyphs * 6);
      // Publishing a growing source can upload numeric records, but never glyphs.
      expect(vi.mocked(gpu.device.queue.writeBuffer).mock.calls.some(([buffer]) => buffer === glyphBuffer)).toBe(false);
    }
    expect(gpu.buffers).toHaveLength(allocations);
  });

  it('rebuilds glyph ranges after text edits and when growing beyond the new prepared prefix', () => {
    const gpu = createGpu();
    renderer = new LabelRenderer(gpu.device);
    const { item, source } = createLabelTestItem(['A', 'B', 'CCC']);
    renderer.prepare(item, identityMat4(), frame);
    setLabelLayerCount(item.layer, 2);
    renderer.prepare(snapshot(item), identityMat4(), frame);
    source.at(0).text = 'AAAA';
    source.at(2).text = 'DDDD';
    publishLabelLayer(item.layer);
    const changed = snapshot(item);
    expect(changed.data.textVersion).toBeGreaterThan(item.data.textVersion);
    vi.mocked(gpu.device.queue.writeBuffer).mockClear();
    renderer.prepare(changed, identityMat4(), frame);
    renderer.draw(gpu.pass, changed);
    expect(gpu.pass.draw).toHaveBeenLastCalledWith(30);
    expect(glyphUploads(gpu).map(bytes => bytes.byteLength)).toContain(5 * LABEL_GLYPH_STRIDE);

    setLabelLayerCount(item.layer, 3);
    const grown = snapshot(item);
    vi.mocked(gpu.device.queue.writeBuffer).mockClear();
    renderer.prepare(grown, identityMat4(), frame);
    renderer.draw(gpu.pass, grown);
    expect(gpu.pass.draw).toHaveBeenLastCalledWith(54);
    expect(glyphUploads(gpu).map(bytes => bytes.byteLength)).toContain(9 * LABEL_GLYPH_STRIDE);
    expect(renderer.readyFor(grown)).toBe(true);
  });

  it('restores a suspended prepared prefix without rebuilding or uploading glyphs', () => {
    const gpu = createGpu();
    renderer = new LabelRenderer(gpu.device);
    const { item } = createLabelTestItem(['A', 'BB']);
    renderer.prepare(item, identityMat4(), frame);
    renderer.prepare({ ...item, data: { ...item.data, bytes: null, ready: false } }, identityMat4(), frame);
    renderer.draw(gpu.pass, item);
    expect(gpu.pass.draw).not.toHaveBeenCalled();
    vi.mocked(gpu.device.queue.writeBuffer).mockClear();
    const resumed = snapshot(item);
    renderer.prepare(resumed, identityMat4(), frame);
    renderer.draw(gpu.pass, resumed);
    expect(gpu.pass.draw).toHaveBeenLastCalledWith(18);
    expect(gpu.device.queue.writeBuffer).toHaveBeenCalledOnce();
  });

  it('cancels obsolete growth when returning to a prepared prefix and retains asynchronous offsets', async () => {
    const gpu = createGpu();
    const releases: Array<() => void> = [];
    const requestRender = vi.fn();
    configureSceneTesting({ yieldForPreparation: () => new Promise<void>(resolve => releases.push(resolve)) });
    renderer = new LabelRenderer(gpu.device, requestRender);
    const { item } = createLabelTestItem(['A', 'B'.repeat(9000)], 1);
    renderer.prepare(item, identityMat4(), frame);
    vi.mocked(gpu.device.queue.writeBuffer).mockClear();
    setLabelLayerCount(item.layer, 2);
    renderer.prepare(snapshot(item), identityMat4(), frame);
    expect(releases).toHaveLength(1);
    setLabelLayerCount(item.layer, 1);
    const smaller = snapshot(item);
    renderer.prepare(smaller, identityMat4(), frame);
    expect(renderer.readyFor(smaller)).toBe(true);
    releases.shift()?.();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    renderer.draw(gpu.pass, smaller);
    expect(gpu.pass.draw).toHaveBeenLastCalledWith(6);
    expect(requestRender).not.toHaveBeenCalled();
    expect(glyphUploads(gpu)).toHaveLength(0);

    const yieldForPreparation = vi.fn(async () => undefined);
    configureSceneTesting({ yieldForPreparation });
    setLabelLayerCount(item.layer, 2);
    const grown = snapshot(item);
    renderer.prepare(grown, identityMat4(), frame);
    await vi.waitFor(() => expect(requestRender).toHaveBeenCalledOnce());
    expect(renderer.readyFor(grown)).toBe(true);
    renderer.draw(gpu.pass, grown);
    expect(gpu.pass.draw).toHaveBeenLastCalledWith(54006);
    yieldForPreparation.mockClear();
    vi.mocked(gpu.device.queue.writeBuffer).mockClear();
    setLabelLayerCount(item.layer, 1);
    renderer.prepare(snapshot(item), identityMat4(), frame);
    setLabelLayerCount(item.layer, 2);
    renderer.prepare(snapshot(item), identityMat4(), frame);
    expect(yieldForPreparation).not.toHaveBeenCalled();
    expect(glyphUploads(gpu)).toHaveLength(0);
  });
});

function createLabelTestItem(texts: readonly string[], count = texts.length) {
  const item = createLabelItem();
  const source = new LabelBuffer({ records: texts.map(text => ({ text })) });
  setLabelLayerSource(item.layer, source);
  setLabelLayerCount(item.layer, count);
  return { item: snapshot(item), source };
}

function snapshot(item: LabelRenderItem): LabelRenderItem {
  return { ...item, data: takeLabelLayerRenderData(item.layer) };
}

function glyphUploads(gpu: ReturnType<typeof createGpu>): ArrayBufferView[] {
  return vi
    .mocked(gpu.device.queue.writeBuffer)
    .mock.calls.map(([, , bytes]) => bytes)
    .filter(bytes => bytes instanceof Uint8Array);
}

function controlledLabelYields() {
  const yields: Array<{ resolve(): void; reject(error: unknown): void }> = [];
  configureSceneTesting({
    yieldForPreparation: () =>
      new Promise<void>((resolve, reject) => {
        yields.push({ resolve, reject });
      })
  });
  return yields;
}
