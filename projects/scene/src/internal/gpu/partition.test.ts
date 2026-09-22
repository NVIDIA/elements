// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { SceneGPUDevice } from './platform.js';
import { planStoragePartitions } from './partition.js';

describe(planStoragePartitions.name, () => {
  const device = {
    limits: { maxBufferSize: 64, maxStorageBufferBindingSize: 48 }
  } as SceneGPUDevice;

  it('keeps boundary-sized inputs together and splits the next complete primitive', () => {
    expect(planStoragePartitions({ byteLength: 48, device, stride: 16 })).toEqual([
      { byteLength: 48, byteOffset: 0, firstRecord: 0, recordCount: 3 }
    ]);
    expect(planStoragePartitions({ byteLength: 64, device, stride: 16 })).toEqual([
      { byteLength: 48, byteOffset: 0, firstRecord: 0, recordCount: 3 },
      { byteLength: 16, byteOffset: 48, firstRecord: 3, recordCount: 1 }
    ]);
  });

  it('keeps triangle records together and rejects primitives that cannot fit', () => {
    expect(planStoragePartitions({ byteLength: 96, device, primitiveRecordCount: 3, stride: 16 })).toEqual([
      { byteLength: 48, byteOffset: 0, firstRecord: 0, recordCount: 3 },
      { byteLength: 48, byteOffset: 48, firstRecord: 3, recordCount: 3 }
    ]);
    expect(() => planStoragePartitions({ byteLength: 80, device, primitiveRecordCount: 5, stride: 16 })).toThrow(
      RangeError
    );
  });
});
