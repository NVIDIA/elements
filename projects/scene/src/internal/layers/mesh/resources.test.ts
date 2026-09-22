// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { SceneGPUDeviceLostInfo } from '../../gpu/platform.js';
import {
  createMeshGeometryResources,
  createGeneratedMeshGeometryResources,
  createMeshTextureResource,
  createMeshWhiteTexture,
  destroyMeshGeometryResources,
  destroyMeshTextureResource,
  uploadMeshGeometryBuffer
} from './resources.js';

describe('mesh resources', () => {
  it('allocates generated geometry with compute-compatible buffers and destroys every buffer', () => {
    const gpu = createMeshDevice();
    const resources = createGeneratedMeshGeometryResources(gpu.device, 4, new Uint32Array([0, 1, 2, 1, 3, 2]));

    expect(resources.vertexCount).toBe(4);
    expect(resources.indexCount).toBe(6);
    expect(resources.index).toBeDefined();
    expect(gpu.buffers.map(buffer => buffer.descriptor)).toEqual([
      { size: 64, usage: 160 },
      { size: 24, usage: 24 },
      { size: 48, usage: 160 },
      { size: 48, usage: 160 },
      { size: 32, usage: 32 }
    ]);

    destroyMeshGeometryResources(resources);
    expect(gpu.destroyedBuffers).toHaveLength(5);
  });

  it('creates, updates, and destroys planar geometry buffers with and without indices', () => {
    const gpu = createMeshDevice();
    const indexed = createGeometry(new Uint32Array([0, 1, 2]));
    const resources = createMeshGeometryResources(gpu.device, indexed);

    expect(resources.indexCount).toBe(3);
    expect(resources.vertexCount).toBe(3);
    expect(gpu.buffers.map(buffer => buffer.descriptor)).toEqual([
      { size: 36, usage: 40 },
      { size: 36, usage: 40 },
      { size: 24, usage: 40 },
      { size: 48, usage: 40 },
      { size: 12, usage: 24 }
    ]);

    const updated = new Float32Array([0, 0, 0, 2, 0, 0, 0, 2, 0]);
    uploadMeshGeometryBuffer({ buffer: resources.positions, device: gpu.device, values: updated });
    expect(gpu.writes.at(-1)).toEqual({ buffer: resources.positions, data: updated });

    destroyMeshGeometryResources(resources);
    expect(gpu.destroyedBuffers).toHaveLength(5);

    const unindexed = createMeshGeometryResources(gpu.device, createGeometry(null));
    expect(unindexed.index).toBeUndefined();
    expect(unindexed.indexCount).toBe(0);
    destroyMeshGeometryResources(unindexed);
    expect(gpu.destroyedBuffers).toHaveLength(9);
  });

  it.each([1, 2, 3, 4, 5])('destroys allocated planar buffers when allocation %i fails', failedCall => {
    const gpu = createMeshDevice();
    const originalCreateBuffer = gpu.device.createBuffer;
    const failure = new Error('planar geometry allocation failure');
    let createBufferCalls = 0;
    gpu.device.createBuffer = descriptor => {
      createBufferCalls += 1;
      if (createBufferCalls === failedCall) throw failure;
      return originalCreateBuffer(descriptor);
    };

    try {
      createMeshGeometryResources(gpu.device, createGeometry(new Uint32Array([0, 1, 2])));
      expect.fail('Expected allocation to fail.');
    } catch (error) {
      expect(error).toBe(failure);
    }
    expect(gpu.buffers).toHaveLength(failedCall - 1);
    expect(gpu.destroyedBuffers).toHaveLength(gpu.buffers.length);
    gpu.buffers.forEach(buffer => {
      expect(gpu.destroyedBuffers.filter(destroyed => destroyed === buffer.resource)).toHaveLength(1);
    });
  });

  it.each([1, 2, 3, 4, 5])('destroys current and previous planar buffers when upload %i fails', failedCall => {
    const gpu = createMeshDevice();
    const originalWriteBuffer = gpu.device.queue.writeBuffer;
    const failure = new Error('planar geometry upload failure');
    let writeBufferCalls = 0;
    gpu.device.queue.writeBuffer = (buffer, offset, data) => {
      writeBufferCalls += 1;
      if (writeBufferCalls === failedCall) throw failure;
      originalWriteBuffer(buffer, offset, data);
    };

    try {
      createMeshGeometryResources(gpu.device, createGeometry(new Uint32Array([0, 1, 2])));
      expect.fail('Expected upload to fail.');
    } catch (error) {
      expect(error).toBe(failure);
    }
    expect(gpu.buffers).toHaveLength(failedCall);
    expect(gpu.destroyedBuffers).toHaveLength(gpu.buffers.length);
    gpu.buffers.forEach(buffer => {
      expect(gpu.destroyedBuffers.filter(destroyed => destroyed === buffer.resource)).toHaveLength(1);
    });
  });

  it('uploads geometry views in attribute order without including surrounding storage', () => {
    const gpu = createMeshDevice();
    const indices = new Uint32Array([99, 0, 1, 2, 99]).subarray(1, 4);
    const positions = new Float32Array([99, 0, 0, 0, 1, 0, 0, 0, 1, 0, 99]).subarray(1, 10);
    const geometry = { ...createGeometry(indices), positions };
    const resources = createMeshGeometryResources(gpu.device, geometry);
    const values = [positions, geometry.normals, geometry.uvs, geometry.colors, indices];
    expect(gpu.writes).toHaveLength(values.length);
    values.forEach((data, index) => {
      expect(gpu.writes[index]?.data).toBe(data);
      expect(gpu.buffers[index]?.descriptor.size).toBe(data.byteLength);
    });
    destroyMeshGeometryResources(resources);
  });

  it('releases generated geometry allocations exactly once when the initial index upload fails', () => {
    const gpu = createMeshDevice();
    const failure = new Error('generated index upload failure');
    gpu.device.queue.writeBuffer = () => {
      throw failure;
    };
    try {
      createGeneratedMeshGeometryResources(gpu.device, 3, new Uint32Array([0, 1, 2]));
      expect.fail('Expected upload to fail.');
    } catch (error) {
      expect(error).toBe(failure);
    }
    expect(gpu.buffers).toHaveLength(2);
    expect(gpu.destroyedBuffers).toEqual([gpu.buffers[1]?.resource, gpu.buffers[0]?.resource]);
  });

  it('copies external images into renderable sampled textures and cleans up optional resources', () => {
    const gpu = createMeshDevice();
    const source = { height: 3, width: 2 } as ImageBitmap;
    const resource = createMeshTextureResource(gpu.device, source);

    expect(gpu.textures[0]?.descriptor).toEqual({
      format: 'rgba8unorm-srgb',
      size: { height: 3, width: 2 },
      usage: 22
    });
    expect(gpu.copies).toEqual([
      { copySize: { height: 3, width: 2 }, destination: resource.texture, source: { source } }
    ]);

    destroyMeshTextureResource(resource);
    destroyMeshTextureResource(undefined);
    expect(gpu.destroyedTextures).toEqual([resource.texture]);

    const white = createMeshWhiteTexture(gpu.device);
    expect(gpu.textures[1]?.descriptor).toEqual({ format: 'rgba8unorm-srgb', size: { height: 1, width: 1 }, usage: 6 });
    expect(gpu.textureWrites).toEqual([
      {
        data: new Uint8Array([255, 255, 255, 255]),
        destination: white,
        layout: { bytesPerRow: 4 },
        size: { height: 1, width: 1 }
      }
    ]);
  });
});

function createGeometry(indices: Uint32Array | null) {
  return {
    colors: new Float32Array(12).fill(1),
    indices,
    normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
    positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
    uvs: new Float32Array([0, 0, 1, 0, 0, 1])
  };
}

function createMeshDevice() {
  const buffers: Array<{ descriptor: { size: number; usage: number }; resource: { destroy(): void } }> = [];
  const copies: Array<{
    copySize: { height: number; width: number };
    destination: object;
    source: { source: ImageBitmap };
  }> = [];
  const destroyedBuffers: object[] = [];
  const destroyedTextures: object[] = [];
  const textures: Array<{ descriptor: unknown; resource: { createView(): object; destroy(): void } }> = [];
  const textureWrites: Array<{
    data: Uint8Array;
    destination: object;
    layout: { bytesPerRow: number };
    size: { height: number; width: number };
  }> = [];
  const writes: Array<{ buffer: object; data: ArrayBufferView }> = [];
  const device = {
    lost: new Promise<SceneGPUDeviceLostInfo>(() => undefined),
    queue: {
      copyExternalImageToTexture: (
        source: { source: ImageBitmap },
        destination: { texture: object },
        copySize: { height: number; width: number }
      ) => {
        copies.push({ copySize, destination: destination.texture, source });
      },
      submit: () => undefined,
      writeBuffer: (buffer: object, _offset: number, data: ArrayBufferView) => {
        writes.push({ buffer, data });
      },
      writeTexture: (
        ...args: [{ texture: object }, Uint8Array, { bytesPerRow: number }, { height: number; width: number }]
      ) => {
        const [destination, data, layout, size] = args;
        textureWrites.push({ data, destination: destination.texture, layout, size });
      }
    },
    createBuffer: (descriptor: { size: number; usage: number }) => {
      const resource = { destroy: () => destroyedBuffers.push(resource) };
      buffers.push({ descriptor, resource });
      return resource;
    },
    createTexture: (descriptor: unknown) => {
      const resource = { createView: () => ({}), destroy: () => destroyedTextures.push(resource) };
      textures.push({ descriptor, resource });
      return resource;
    },
    createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
    destroy: () => undefined
  };
  return { buffers, copies, destroyedBuffers, destroyedTextures, device, textures, textureWrites, writes };
}
