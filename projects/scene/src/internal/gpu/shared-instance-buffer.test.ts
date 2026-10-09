// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { createLineItem } from '../../../test/rendering.js';
import { LINE_VERTEX } from '../records/layouts/built-ins.js';
import { getInstanceAllocation } from '../rendering/instance-partitions.js';
import type { StoragePartition } from './partition.js';
import type { SceneGPUBuffer } from './platform.js';
import {
  acquireSharedInstanceBuffer,
  writeSharedInstanceBuffer,
  type SharedInstanceBufferDevice
} from './shared-instance-buffer.js';

describe('shared instance buffers', () => {
  it('rejects invalid GPU allocation lengths without creating or uploading a buffer', () => {
    const { createBuffer, device, writeBuffer } = createDevice();
    for (const byteLength of [-1, 0, 96]) {
      expect(() => acquireSharedInstanceBuffer(device, new Uint8Array(48), { byteLength })).toThrow(RangeError);
    }
    expect(createBuffer).not.toHaveBeenCalled();
    expect(writeBuffer).not.toHaveBeenCalled();
  });

  it('should upload one buffer per device and byte snapshot until the final lease releases', () => {
    const { createBuffer, device, destroy, writeBuffer } = createDevice();
    const bytes = new Uint8Array(48);

    const first = acquireSharedInstanceBuffer(device, bytes);
    const second = acquireSharedInstanceBuffer(device, bytes);

    expect(second.buffer).toBe(first.buffer);
    expect(createBuffer).toHaveBeenCalledOnce();
    expect(writeBuffer).toHaveBeenCalledOnce();
    first.release();
    first.release();
    expect(destroy).not.toHaveBeenCalled();
    second.release();
    expect(destroy).toHaveBeenCalledOnce();

    const replacement = acquireSharedInstanceBuffer(device, bytes);
    expect(createBuffer).toHaveBeenCalledTimes(2);
    replacement.release();
  });

  it('should keep equal-sized snapshots and devices isolated', () => {
    const first = createDevice();
    const second = createDevice();
    const bytes = new Uint8Array(48);
    const otherBytes = bytes.slice();

    const firstBytes = acquireSharedInstanceBuffer(first.device, bytes);
    const otherSnapshot = acquireSharedInstanceBuffer(first.device, otherBytes);
    const otherDevice = acquireSharedInstanceBuffer(second.device, bytes);

    expect(first.createBuffer).toHaveBeenCalledTimes(2);
    expect(second.createBuffer).toHaveBeenCalledOnce();
    expect(otherSnapshot.buffer).not.toBe(firstBytes.buffer);
    expect(otherDevice.buffer).not.toBe(firstBytes.buffer);
    firstBytes.release();
    otherSnapshot.release();
    otherDevice.release();
  });

  it('should reassign an exclusive same-sized buffer but refuse to reassign shared storage', () => {
    const { device } = createDevice();
    const firstBytes = new Uint8Array(48);
    const secondBytes = firstBytes.slice();
    const exclusive = acquireSharedInstanceBuffer(device, firstBytes);

    expect(exclusive.tryReassign(secondBytes)).toBe(true);
    expect(exclusive.bytes).toBe(secondBytes);
    const sibling = acquireSharedInstanceBuffer(device, secondBytes);
    expect(exclusive.tryReassign(firstBytes)).toBe(false);
    expect(sibling.buffer).toBe(exclusive.buffer);
    exclusive.release();
    sibling.release();
  });

  it('should destroy a created buffer when its initial upload fails', () => {
    const { device, destroy, writeBuffer } = createDevice();
    writeBuffer.mockImplementation(() => {
      throw new Error('upload failed');
    });

    expect(() => acquireSharedInstanceBuffer(device, new Uint8Array(48))).toThrow('upload failed');
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('allocates only the active prefix and partitions records at reduced device limits', () => {
    const { createBuffer, device, destroy, writeBuffer } = createDevice({
      maxBufferSize: 32,
      maxStorageBufferBindingSize: 32
    });
    const bytes = new Uint8Array(96);
    const lease = acquireSharedInstanceBuffer(device, bytes, { byteLength: 64, stride: 16 });

    expect(
      lease.partitions.map(({ byteLength, byteOffset, firstRecord, recordCount }) => ({
        byteLength,
        byteOffset,
        firstRecord,
        recordCount
      }))
    ).toEqual([
      { byteLength: 32, byteOffset: 0, firstRecord: 0, recordCount: 2 },
      { byteLength: 32, byteOffset: 32, firstRecord: 2, recordCount: 2 }
    ]);
    expect(createBuffer).toHaveBeenCalledTimes(2);
    expect(createBuffer).toHaveBeenNthCalledWith(1, expect.objectContaining({ size: 32 }));
    writeBuffer.mockClear();
    writeSharedInstanceBuffer({ bytes, device, lease, range: { offset: 24, size: 16 } });
    expect(writeBuffer).toHaveBeenCalledTimes(2);
    expect((writeBuffer.mock.calls[0]?.[2] as Uint8Array).byteLength).toBe(8);
    expect((writeBuffer.mock.calls[1]?.[2] as Uint8Array).byteLength).toBe(8);
    lease.release();
    expect(destroy).toHaveBeenCalledTimes(2);
  });

  it.each(['strip', 'loop'] as const)(
    'updates duplicated and wrapped records in partitioned line %s storage',
    topology => {
      const { buffers, device } = createMemoryDevice({
        maxBufferSize: 4096,
        maxStorageBufferBindingSize: LINE_VERTEX.stride * 4
      });
      const allocation = getInstanceAllocation(createLineItem(20, topology), device);
      const storage = new Uint8Array(allocation.byteLength + 32);
      const bytes = storage.subarray(16, 16 + allocation.byteLength);
      bytes.forEach((_value, index) => {
        bytes[index] = index % 251;
      });
      const lease = acquireSharedInstanceBuffer(device, bytes, allocation);
      for (const range of [
        { offset: 0, size: 4 },
        { offset: LINE_VERTEX.stride * 5 - 4, size: 12 },
        { offset: bytes.byteLength - 4, size: 4 }
      ]) {
        bytes.fill(255, range.offset, range.offset + range.size);
        writeSharedInstanceBuffer({ bytes, device, lease, range });
        for (const partition of lease.partitions)
          expect(buffers.get(partition.buffer)).toEqual(mappedBytes(bytes, partition));
      }
      const index = lease.transferIndex;
      const replacement = bytes.slice();
      replacement.fill(7);
      expect(lease.tryReassign(replacement)).toBe(true);
      expect(lease.transferIndex).toBe(index);
      const sibling = acquireSharedInstanceBuffer(device, replacement, allocation);
      expect(sibling.transferIndex).toBe(index);
      writeSharedInstanceBuffer({
        bytes: replacement,
        device,
        lease,
        range: { offset: 0, size: replacement.byteLength }
      });
      for (const partition of lease.partitions)
        expect(buffers.get(partition.buffer)).toEqual(mappedBytes(replacement, partition));
      sibling.release();
      lease.release();
    }
  );

  it('honors reordered and overlapping destination spans on a full single-partition update', () => {
    const { buffers, device } = createMemoryDevice();
    const bytes = Uint8Array.from({ length: 32 }, (_value, index) => index);
    const partitions = [
      {
        byteLength: 32,
        byteOffset: 0,
        firstRecord: 0,
        recordCount: 2,
        sourceRanges: [
          { byteLength: 16, sourceByteOffset: 16, targetByteOffset: 0 },
          { byteLength: 16, sourceByteOffset: 0, targetByteOffset: 16 },
          { byteLength: 8, sourceByteOffset: 24, targetByteOffset: 8 }
        ]
      }
    ];
    const lease = acquireSharedInstanceBuffer(device, bytes, { partitions, stride: 16 });
    bytes.forEach((_value, index) => {
      bytes[index] = 255 - index;
    });
    writeSharedInstanceBuffer({ bytes, device, lease, range: { offset: 0, size: bytes.byteLength } });
    expect(buffers.get(lease.buffer)).toEqual(mappedBytes(bytes, partitions[0]!));
    lease.release();
  });

  it('clips updates to active bytes and skips empty ranges, gaps, and ranges outside storage', () => {
    const { buffers, device, writeBuffer } = createMemoryDevice();
    const bytes = new Uint8Array(64);
    const partitions = [
      { byteLength: 8, byteOffset: 0, firstRecord: 0, recordCount: 1 },
      { byteLength: 8, byteOffset: 24, firstRecord: 3, recordCount: 1 }
    ];
    const lease = acquireSharedInstanceBuffer(device, bytes, { byteLength: 32, partitions, stride: 8 });
    writeBuffer.mockClear();
    for (const range of [
      { offset: 0, size: 0 },
      { offset: 8, size: 16 },
      { offset: 32, size: 32 }
    ]) {
      writeSharedInstanceBuffer({ bytes, device, lease, range });
    }
    expect(writeBuffer).not.toHaveBeenCalled();
    bytes.fill(9);
    writeSharedInstanceBuffer({ bytes, device, lease, range: { offset: 28, size: 36 } });
    expect(writeBuffer).toHaveBeenCalledOnce();
    expect(buffers.get(lease.partitions[1]!.buffer)).toEqual(new Uint8Array([0, 0, 0, 0, 9, 9, 9, 9]));
    lease.release();
  });

  it('maps a full update into a single allocation containing only a source suffix', () => {
    const { buffers, device, writeBuffer } = createMemoryDevice();
    const bytes = new Uint8Array(32);
    const partitions = [{ byteLength: 16, byteOffset: 16, firstRecord: 1, recordCount: 1 }];
    const lease = acquireSharedInstanceBuffer(device, bytes, { partitions, stride: 16 });
    bytes.fill(7, 16);
    writeBuffer.mockClear();
    writeSharedInstanceBuffer({ bytes, device, lease, range: { offset: 0, size: bytes.byteLength } });
    expect(writeBuffer).toHaveBeenCalledOnce();
    expect(buffers.get(lease.buffer)).toEqual(new Uint8Array(16).fill(7));
    lease.release();
  });
});

function createMemoryDevice(limits?: SharedInstanceBufferDevice['limits']) {
  const gpu = createDevice(limits);
  const buffers = new Map<SceneGPUBuffer, Uint8Array>();
  gpu.createBuffer.mockImplementation((descriptor: { size: number }) => {
    const buffer: SceneGPUBuffer = { destroy: () => undefined };
    buffers.set(buffer, new Uint8Array(descriptor.size));
    return buffer;
  });
  gpu.writeBuffer.mockImplementation((buffer: SceneGPUBuffer, offset: number, data: Uint8Array) => {
    buffers.get(buffer)!.set(data, offset);
  });
  return { ...gpu, buffers };
}

function mappedBytes(bytes: Uint8Array, partition: StoragePartition): Uint8Array {
  if (!partition.sourceRanges) return bytes.slice(partition.byteOffset, partition.byteOffset + partition.byteLength);
  const result = new Uint8Array(partition.byteLength);
  for (const range of partition.sourceRanges) {
    result.set(
      bytes.subarray(range.sourceByteOffset, range.sourceByteOffset + range.byteLength),
      range.targetByteOffset
    );
  }
  return result;
}

function createDevice(limits?: SharedInstanceBufferDevice['limits']): {
  readonly createBuffer: ReturnType<typeof vi.fn>;
  readonly destroy: ReturnType<typeof vi.fn>;
  readonly device: SharedInstanceBufferDevice;
  readonly writeBuffer: ReturnType<typeof vi.fn>;
} {
  const destroy = vi.fn();
  const createBuffer = vi.fn((): SceneGPUBuffer => ({ destroy }));
  const writeBuffer = vi.fn();
  return {
    createBuffer,
    destroy,
    device: {
      createBuffer,
      createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
      destroy: vi.fn(),
      limits,
      lost: new Promise(() => undefined),
      queue: { submit: vi.fn(), writeBuffer }
    },
    writeBuffer
  };
}
