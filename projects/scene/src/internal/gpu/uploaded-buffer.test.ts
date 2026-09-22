// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from 'vitest';
import { createUploadedBuffer } from './uploaded-buffer.js';

describe(createUploadedBuffer.name, () => {
  it('uploads only the selected view and transfers ownership after success', () => {
    const buffer = { destroy: vi.fn() };
    const device = { createBuffer: vi.fn(() => buffer), queue: { writeBuffer: vi.fn() } };
    const values = new Float32Array(new ArrayBuffer(32), 8, 3);
    expect(createUploadedBuffer(device, values, 0x20)).toBe(buffer);
    expect(device.createBuffer).toHaveBeenCalledWith({ size: 12, usage: 0x28 });
    expect(device.queue.writeBuffer).toHaveBeenCalledWith(buffer, 0, values);
    expect(buffer.destroy).not.toHaveBeenCalled();
  });

  it('destroys a candidate exactly once when its initial upload fails', () => {
    const buffer = { destroy: vi.fn() };
    const error = new Error('upload failed');
    const device = {
      createBuffer: () => buffer,
      queue: {
        writeBuffer: () => {
          throw error;
        }
      }
    };
    expect(() => createUploadedBuffer(device, new Uint8Array(4), 0x20)).toThrow(error);
    expect(buffer.destroy).toHaveBeenCalledOnce();
  });
});
