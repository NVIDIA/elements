// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { createPartitionUniformResources, destroyPartitionUniformResources } from './partition-resources.js';

describe('partition uniform resources', () => {
  it('destroys allocated uniforms and releases a candidate lease once when allocation fails', () => {
    const first = { destroy: vi.fn() };
    const release = vi.fn();
    const lease = {
      partitions: [
        { buffer: { destroy: vi.fn() }, firstRecord: 0, recordCount: 1 },
        { buffer: { destroy: vi.fn() }, firstRecord: 1, recordCount: 1 }
      ],
      release
    };
    let calls = 0;

    expect(() =>
      createPartitionUniformResources({
        device: {
          createBuffer: () => {
            calls += 1;
            if (calls === 2) throw new Error('allocation failed');
            return first;
          }
        },
        instance: lease,
        uniformLength: 40,
        uniformUsage: 0x48
      })
    ).toThrow('allocation failed');
    expect(first.destroy).toHaveBeenCalledOnce();
    expect(release).toHaveBeenCalledOnce();
  });

  it('creates and releases exactly one uniform for every partition', () => {
    const uniforms = [{ destroy: vi.fn() }, { destroy: vi.fn() }];
    const release = vi.fn();
    const lease = {
      partitions: [
        { buffer: { destroy: vi.fn() }, firstRecord: 0, recordCount: 2 },
        { buffer: { destroy: vi.fn() }, firstRecord: 2, recordCount: 3 }
      ],
      release
    };
    const resources = createPartitionUniformResources({
      device: { createBuffer: () => uniforms.shift()! },
      instance: lease,
      uniformLength: 40,
      uniformUsage: 0x48
    });

    expect(resources.map(resource => [resource.firstRecord, resource.recordCount])).toEqual([
      [0, 2],
      [2, 3]
    ]);
    destroyPartitionUniformResources(lease, resources);
    expect(release).toHaveBeenCalledOnce();
  });
});
