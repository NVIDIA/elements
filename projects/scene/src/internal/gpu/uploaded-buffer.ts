// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneGPUBuffer, SceneGPUBufferDescriptor } from './platform.js';

const BUFFER_COPY_DST = 0x08;

interface BufferUploadDevice {
  createBuffer(descriptor: SceneGPUBufferDescriptor): SceneGPUBuffer;
  readonly queue: {
    writeBuffer(buffer: SceneGPUBuffer, offset: number, data: ArrayBufferView): void;
  };
}

/** Transfers buffer ownership to the caller only after the initial upload succeeds. */
export function createUploadedBuffer(device: BufferUploadDevice, data: ArrayBufferView, usage: number): SceneGPUBuffer {
  const buffer = device.createBuffer({ size: data.byteLength, usage: BUFFER_COPY_DST | usage });
  try {
    device.queue.writeBuffer(buffer, 0, data);
  } catch (error) {
    buffer.destroy();
    throw error;
  }
  return buffer;
}
