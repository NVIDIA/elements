// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGpu, createMarkerItem } from '../../../test/rendering.js';
import { composePreciseMat4, identityMat4 } from '../math/mat4.js';
import { GeometryRenderer } from './geometry-renderer.js';

let renderer: GeometryRenderer | undefined;
afterEach(() => {
  renderer?.disconnect();
  renderer = undefined;
});

describe('GeometryRenderer', () => {
  it('loads marker pipelines on demand and releases resources after the layer leaves the frame', async () => {
    const gpu = createGpu();
    const requestRender = vi.fn();
    renderer = new GeometryRenderer(requestRender);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    renderer.initialize(canvas, gpu.device, 'bgra8unorm');
    expect(renderer.active).toBe(true);
    expect(gpu.device.createRenderPipeline).not.toHaveBeenCalled();
    const items = [createMarkerItem(2)];
    const projection = identityMat4();
    expect(renderer.prepare(items, projection)).toBe(projection);
    await vi.waitFor(() => expect(renderer?.readyFor(items)).toBe(true));
    expect(requestRender).toHaveBeenCalled();
    renderer.prepare(items, projection);
    renderer.drawItems(gpu.pass, items, false);
    expect(gpu.pass.drawIndexed).toHaveBeenCalledWith(36, 2);
    const buffers = gpu.buffers.slice();
    renderer.prepare([], projection);
    expect(buffers.some(buffer => buffer.destroy.mock.calls.length === 1)).toBe(true);
    renderer.disconnect();
    renderer = undefined;
    for (const buffer of buffers) expect(buffer.destroy).toHaveBeenCalledTimes(1);
  });

  it('stays inactive on unsupported devices and safely ignores draws after disconnect', () => {
    const gpu = createGpu();
    renderer = new GeometryRenderer(vi.fn());
    const canvas = document.createElement('canvas');
    renderer.initialize(canvas, { ...gpu.device, createRenderPipeline: undefined }, 'bgra8unorm');
    expect(renderer.active).toBe(false);
    expect(renderer.prepare([createMarkerItem()])).toBeUndefined();
    renderer.drawItems(gpu.pass, [createMarkerItem()], false);
    expect(gpu.pass.drawIndexed).not.toHaveBeenCalled();
    renderer.initialize(canvas, gpu.device, 'bgra8unorm');
    renderer.disconnect();
    expect(renderer.active).toBe(false);
    expect(renderer.prepare([])).toBeUndefined();
  });

  it('preserves cancellation precision across successive marker matrix uniform uploads', async () => {
    const gpu = createGpu();
    renderer = new GeometryRenderer(vi.fn());
    renderer.initialize(document.createElement('canvas'), gpu.device, 'bgra8unorm');
    const item = createMarkerItem();
    const projection = composePreciseMat4([1_000_000.01, 0, 0], [0, 0, 0, 1]);
    renderer.prepare([item], projection);
    await vi.waitFor(() => expect(renderer?.readyFor([item])).toBe(true));
    for (const offset of [-1_000_000, -999_999]) {
      vi.mocked(gpu.device.queue.writeBuffer).mockClear();
      renderer.prepare([{ ...item, frameMatrix: composePreciseMat4([offset, 0, 0], [0, 0, 0, 1]) }], projection);
      const uploads = vi.mocked(gpu.device.queue.writeBuffer).mock.calls;
      const uniforms = uploads.find(([, , data]) => data instanceof Float32Array && data.length === 40)?.[2];
      expect(uniforms).toBeInstanceOf(Float32Array);
      if (!(uniforms instanceof Float32Array)) throw new Error('Marker matrix uniforms were not uploaded.');
      expect(uniforms[12]).toBe(Math.fround(projection[12]! + offset));
    }
    projection[0] = Number.MAX_VALUE;
    expect(() => renderer?.prepare([item], projection)).toThrow('finite Float32');
  });
});
