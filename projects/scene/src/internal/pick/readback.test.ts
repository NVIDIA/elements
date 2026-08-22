// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { identityMat4 } from '../../internal/math/mat4.js';
import { decodePickPixel, PickReadback, reconstructWorldPosition } from './readback.js';
import type { SceneGPUBuffer, SceneGPUCommandEncoder, SceneGPUTexture } from '../../internal/gpu/platform.js';

describe(PickReadback.name, () => {
  it('should copy one aligned pixel, retain its target snapshot, and map without stalling submission', async () => {
    const bytes = new Uint8Array(512);
    bytes.set([1, 0, 0, 0]);
    new DataView(bytes.buffer).setFloat32(256, 0.5, true);
    let resolveMap: (() => void) | undefined;
    const buffer: SceneGPUBuffer = {
      destroy: vi.fn(),
      getMappedRange: () => bytes.buffer,
      mapAsync: () => new Promise<void>(resolve => (resolveMap = resolve)),
      unmap: vi.fn()
    };
    const encoder: SceneGPUCommandEncoder = {
      beginRenderPass: () => ({ end: () => undefined }),
      copyTextureToBuffer: vi.fn(),
      finish: () => ({})
    };
    const texture: SceneGPUTexture = { createView: () => ({}) };
    const readback = new PickReadback<{ readonly value: string }>({
      createBuffer: () => buffer,
      destroy: () => undefined,
      lost: new Promise(() => undefined),
      queue: { submit: () => undefined }
    });

    const result = readback.copy({
      encoder,
      frame: { decodeTarget: id => (id === 1 ? { value: 'first' } : undefined), inverseViewProjection: identityMat4() },
      pixel: { x: 3, y: 4 },
      size: { height: 10, width: 10 },
      textures: { depth: texture, id: texture }
    });
    expect(encoder.copyTextureToBuffer).toHaveBeenCalledTimes(2);
    expect(result).toBeInstanceOf(Promise);
    await vi.waitFor(() => expect(resolveMap).toBeTypeOf('function'));
    resolveMap?.();
    const mapped = await result;
    expect(mapped?.target).toEqual({ value: 'first' });
    expect(mapped?.worldPosition).toEqual(expect.arrayContaining([expect.closeTo(-0.3), expect.closeTo(0.1), 0.5]));
    expect(buffer.unmap).toHaveBeenCalledOnce();
    expect(buffer.destroy).toHaveBeenCalledOnce();
  });

  it('should treat zero IDs and incomplete bytes as misses', () => {
    expect(decodePickPixel(new Uint8Array())).toEqual({ depth: Number.NaN, id: 0 });
    const bytes = new Uint8Array(512);
    new DataView(bytes.buffer).setFloat32(256, 0.25, true);
    expect(decodePickPixel(bytes)).toEqual({ depth: 0.25, id: 0 });
  });

  it('should return a miss when the command encoder cannot copy textures', async () => {
    const readback = new PickReadback<{ value: string }>({
      createBuffer: () => ({ destroy: vi.fn() }),
      destroy: () => undefined,
      lost: new Promise(() => undefined),
      queue: { submit: () => undefined }
    });
    const encoder: SceneGPUCommandEncoder = {
      beginRenderPass: () => ({ end: () => undefined }),
      finish: () => ({})
    };
    await expect(
      readback.copy({
        encoder,
        frame: { decodeTarget: () => undefined, inverseViewProjection: identityMat4() },
        pixel: { x: 0, y: 0 },
        size: { height: 1, width: 1 },
        textures: { depth: { createView: () => ({}) }, id: { createView: () => ({}) } }
      })
    ).resolves.toBeNull();
  });

  it('should clean up and return misses for unavailable mapping, unknown IDs, and invalid depth', async () => {
    const texture: SceneGPUTexture = { createView: () => ({}) };
    const encoder: SceneGPUCommandEncoder = {
      beginRenderPass: () => ({ end: () => undefined }),
      copyTextureToBuffer: vi.fn(),
      finish: () => ({})
    };
    const makeBuffer = (
      bytes: ArrayBuffer,
      mapAsync?: (mode: number, offset?: number, size?: number) => Promise<void>
    ): SceneGPUBuffer => ({
      destroy: vi.fn(),
      getMappedRange: () => bytes,
      mapAsync,
      unmap: vi.fn()
    });
    const unavailable = makeBuffer(new ArrayBuffer(512));
    const device = {
      createBuffer: vi.fn(() => unavailable),
      destroy: () => undefined,
      lost: new Promise(() => undefined),
      queue: { submit: () => undefined }
    };
    const readback = new PickReadback<{ value: string }>(device);
    await expect(
      readback.copy({
        encoder,
        frame: {
          decodeTarget: targetId => (targetId === 1 ? { value: 'hit' } : undefined),
          inverseViewProjection: identityMat4()
        },
        pixel: { x: 0, y: 0 },
        size: { height: 1, width: 1 },
        textures: { depth: texture, id: texture }
      })
    ).resolves.toBeNull();
    expect(unavailable.destroy).toHaveBeenCalledOnce();
    expect(unavailable.unmap).toHaveBeenCalledOnce();

    const cases = [
      { id: 2, depth: 0.5 },
      { id: 1, depth: Number.NaN }
    ];
    for (const { id, depth } of cases) {
      const bytes = new Uint8Array(512);
      bytes[0] = id;
      new DataView(bytes.buffer).setFloat32(256, depth, true);
      let resolveMap!: () => void;
      const buffer = makeBuffer(bytes.buffer, () => new Promise<void>(resolve => (resolveMap = resolve)));
      device.createBuffer.mockReturnValueOnce(buffer);
      const pending = readback.copy({
        encoder,
        frame: {
          decodeTarget: targetId => (targetId === 1 ? { value: 'hit' } : undefined),
          inverseViewProjection: identityMat4()
        },
        pixel: { x: 0, y: 0 },
        size: { height: 1, width: 1 },
        textures: { depth: texture, id: texture }
      });
      await vi.waitFor(() => expect(resolveMap).toBeTypeOf('function'));
      resolveMap();
      await expect(pending).resolves.toBeNull();
    }
  });

  it('cleans up a buffer when mapping rejects', async () => {
    const buffer: SceneGPUBuffer = {
      destroy: vi.fn(),
      getMappedRange: () => new ArrayBuffer(512),
      mapAsync: () => Promise.reject(new Error('map failed')),
      unmap: vi.fn()
    };
    const readback = new PickReadback<{ value: string }>({
      createBuffer: () => buffer,
      destroy: () => undefined,
      lost: new Promise(() => undefined),
      queue: { submit: () => undefined }
    });
    const encoder: SceneGPUCommandEncoder = {
      beginRenderPass: () => ({ end: () => undefined }),
      copyTextureToBuffer: vi.fn(),
      finish: () => ({})
    };
    await expect(
      readback.copy({
        encoder,
        frame: { decodeTarget: () => undefined, inverseViewProjection: identityMat4() },
        pixel: { x: 0, y: 0 },
        size: { height: 1, width: 1 },
        textures: { depth: { createView: () => ({}) }, id: { createView: () => ({}) } }
      })
    ).rejects.toThrow('map failed');
    expect(buffer.unmap).toHaveBeenCalledOnce();
    expect(buffer.destroy).toHaveBeenCalledOnce();
  });
});

describe(reconstructWorldPosition.name, () => {
  it('should convert a top-left texture pixel and WebGPU depth through inverse view projection', () => {
    expect(
      reconstructWorldPosition({
        depth: 0.75,
        inverseViewProjection: identityMat4(),
        pixel: { x: 0, y: 0 },
        size: { height: 2, width: 2 }
      })
    ).toEqual([-0.5, 0.5, 0.75]);
  });
});
