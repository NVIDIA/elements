// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { RecordStorage } from './record-storage.js';

describe(RecordStorage.name, () => {
  it('reuses exclusive capacity and detaches a captured snapshot once before mutation', () => {
    const storage = new RecordStorage();
    expect(storage.replace(new Uint8Array([1, 2]))).toBe(false);
    const first = storage.bytes;
    expect(storage.replace(new Uint8Array([3, 4]))).toBe(true);
    expect(storage.bytes).toBe(first);

    const snapshot = storage.captureSnapshot();
    expect(storage.replace(new Uint8Array([5, 6]))).toBe(true);
    expect(storage.bytes).not.toBe(snapshot);
    expect(snapshot).toEqual(new Uint8Array([3, 4]));
    const writable = storage.writable();
    expect(writable).toBe(storage.bytes);
    writable?.fill(9);
    expect(snapshot).toEqual(new Uint8Array([3, 4]));
    expect(storage.writable()).toBe(writable);
  });

  it('shares adopted prepared bytes until clear or a write', () => {
    const storage = new RecordStorage();
    const prepared = new Uint8Array([1, 2, 3]);
    storage.adopt(prepared);
    expect(storage.captureSnapshot()).toBe(prepared);
    storage.clear();
    expect(storage.bytes).toBeNull();
    expect(prepared).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('returns no views before allocation or after clear and caches views while storage remains live', () => {
    const storage = new RecordStorage();
    expect(storage.captureSnapshot()).toBeNull();
    expect(storage.dataView).toBeNull();
    expect(storage.float32).toBeNull();
    storage.replace(new Uint8Array(Float32Array.BYTES_PER_ELEMENT));
    expect(storage.dataView).toBe(storage.dataView);
    expect(storage.float32).toBe(storage.float32);
    storage.clear();
    expect(storage.dataView).toBeNull();
    expect(storage.float32).toBeNull();
    expect(storage.writable()).toBeNull();
  });
});
