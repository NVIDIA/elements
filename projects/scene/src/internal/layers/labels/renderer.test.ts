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

const frame = { pixelRatio: 1, viewportHeight: 100, viewportWidth: 200 };

let renderer: LabelRenderer | undefined;
afterEach(() => {
  renderer?.disconnect();
  renderer = undefined;
  resetSceneTesting();
});

describe('LabelRenderer', () => {
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
