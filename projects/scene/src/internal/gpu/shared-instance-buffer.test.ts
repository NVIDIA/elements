// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import type { SceneGPUBuffer } from './platform.js';
import { acquireSharedInstanceBuffer, type SharedInstanceBufferDevice } from './shared-instance-buffer.js';

describe('shared instance buffers', () => {
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
});

function createDevice(): {
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
      lost: new Promise(() => undefined),
      queue: { submit: vi.fn(), writeBuffer }
    },
    writeBuffer
  };
}
