// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { createGpu, createLineItem, createMarkerItem, createMeshItem } from '../../../test/rendering.js';
import { LINE_VERTEX } from '../records/layouts/built-ins.js';
import {
  getInstanceAllocation,
  getPartitionPickId,
  itemRequiresGeometry,
  writeInstancePartitionUniforms
} from './instance-partitions.js';

describe('instance partition planning', () => {
  it.each(['strip', 'loop'] as const)(
    'covers every %s segment and join exactly once across storage partitions',
    topology => {
      const item = createLineItem(10, topology);
      const gpu = createGpu();
      const device = {
        ...gpu.device,
        limits: { maxStorageBufferBindingSize: LINE_VERTEX.stride * 4, maxBufferSize: 4096 }
      };
      const allocation = getInstanceAllocation(item, device);
      const draws = allocation.linePartitions!;
      expect(draws.reduce((n, draw) => n + draw.segmentCount, 0)).toBe(topology === 'loop' ? 10 : 9);
      expect(draws.reduce((n, draw) => n + draw.joinCount, 0)).toBe(topology === 'loop' ? 10 : 8);
      for (const partition of allocation.partitions!) expect(partition.byteLength).toBeLessThanOrEqual(160);
      const uniforms = new Float32Array(48);
      writeInstancePartitionUniforms(uniforms, { item, line: draws[0], recordCount: 4 });
      expect(uniforms[36]).toBe(4);
      expect(uniforms[39]).toBe(10);
      expect(getPartitionPickId(item, 4, 100)).toBe(100);
    }
  );

  it('rejects insufficient connected-line capacity and excludes empty geometry', () => {
    const gpu = createGpu();
    const device = { ...gpu.device, limits: { maxStorageBufferBindingSize: 80, maxBufferSize: 4096 } };
    expect(() => getInstanceAllocation(createLineItem(10), device)).toThrow(RangeError);
    expect(() => getInstanceAllocation(createMeshItem(), gpu.device)).toThrow(TypeError);
    expect(itemRequiresGeometry(createMarkerItem(0))).toBe(false);
    expect(itemRequiresGeometry(createMeshItem())).toBe(true);
    expect(getPartitionPickId(createMarkerItem(5), 3, 100)).toBe(103);
  });
});
