// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createGpu,
  createLabelItem,
  createLineItem,
  createMarkerItem,
  createMeshItem
} from '../../../../test/rendering.js';
import { identityMat4 } from '../../math/mat4.js';
import { PickRenderer, createPickTargetDecoder } from './renderer.js';

let renderer: PickRenderer | undefined;
afterEach(() => {
  renderer?.disconnect();
  renderer = undefined;
});

describe('PickRenderer', () => {
  it('decodes immutable targets with the correct connected and independent line indices', () => {
    expect(createPickTargetDecoder(createLineItem(4, 'loop'))(3)).toEqual({
      index: 3,
      kind: 'segment',
      vertexIndices: [3, 0]
    });
    const segment = createPickTargetDecoder(createLineItem(4, 'segments'))(1);
    expect(segment).toEqual({ index: 1, kind: 'segment', vertexIndices: [2, 3] });
    expect(Object.isFrozen(segment)).toBe(true);
    if (segment.kind === 'segment') expect(Object.isFrozen(segment.vertexIndices)).toBe(true);
    expect(createPickTargetDecoder(createMarkerItem(2))(1)).toEqual({ index: 1, kind: 'instance' });
    expect(createPickTargetDecoder(createMeshItem())(0)).toEqual({ index: 0, kind: 'instance' });
    expect(createPickTargetDecoder(createLabelItem())(0)).toEqual({ index: 0, kind: 'label' });
  });

  it('reuses a pick pass for the same frame and pixel, then invalidates it on resize', async () => {
    const gpu = createGpu();
    gpu.mapped[0] = 2;
    new DataView(gpu.mapped.buffer).setFloat32(256, 0.5, true);
    const drawPickItems = vi.fn();
    renderer = new PickRenderer({ draw: { drawPickItems }, getDepthView: () => null });
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    renderer.initialize(canvas, gpu.device);
    const item = createMarkerItem(2);
    renderer.updateFrame({ frameGeneration: 1, items: [item], projection: identityMat4() });
    const request = { canvas, clientX: 10, clientY: 20, pixelX: 1, pixelY: 2 };
    const result = await renderer.pick(request);
    expect(result).toMatchObject({
      layer: item.layer,
      instanceIndex: 1,
      target: { kind: 'instance', index: 1 },
      clientX: 10,
      clientY: 20
    });
    expect(result?.worldPosition.every(Number.isFinite)).toBe(true);
    expect(drawPickItems).toHaveBeenCalledTimes(1);
    await renderer.pick(request);
    expect(drawPickItems).toHaveBeenCalledTimes(1);
    await renderer.pick({ ...request, pixelX: 2 });
    expect(drawPickItems).toHaveBeenCalledTimes(2);
    renderer.invalidateSize();
    for (const texture of gpu.textures) expect(texture.destroy).toHaveBeenCalledTimes(1);
    expect(await renderer.pick(request)).toBeNull();
    renderer.disconnect();
    renderer = undefined;
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledTimes(1);
  });

  it('does not return a hit when submitted readback resources are disconnected', async () => {
    const gpu = createGpu();
    gpu.mapped[0] = 1;
    new DataView(gpu.mapped.buffer).setFloat32(256, 0.5, true);
    renderer = new PickRenderer({ draw: { drawPickItems: vi.fn() }, getDepthView: () => null });
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 8;
    renderer.initialize(canvas, gpu.device);
    renderer.updateFrame({ frameGeneration: 1, items: [createMarkerItem()], projection: identityMat4() });
    vi.mocked(gpu.device.queue.submit).mockImplementationOnce(() => renderer?.disconnect());
    expect(await renderer.pick({ canvas, clientX: 0, clientY: 0, pixelX: 0, pixelY: 0 })).toBeNull();
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledTimes(1);
  });
});
