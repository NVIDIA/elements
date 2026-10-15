// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { createGpu, createLineItem, createMarkerItem, createMeshItem } from '../../../test/rendering.js';
import { LINE_VERTEX } from '../records/layouts/built-ins.js';
import type { StoragePartition } from '../gpu/partition.js';
import {
  getInstanceAllocation,
  type ConnectedLineDrawPartition,
  getPartitionPickId,
  itemRequiresGeometry,
  writeInstancePartitionUniforms
} from './instance-partitions.js';

describe('instance partition planning', () => {
  it.each(['strip', 'loop'] as const)(
    'preserves %s segment identities and join neighbors across varied capacities',
    topology => {
      const gpu = createGpu();
      for (let count = 3; count <= 32; count += 1) {
        const item = createLineItem(count, topology);
        for (let capacity = 3; capacity <= 12; capacity += 1) {
          const device = {
            ...gpu.device,
            limits: { maxStorageBufferBindingSize: capacity * LINE_VERTEX.stride, maxBufferSize: 4096 }
          };
          const allocation = getInstanceAllocation(item, device);
          const segments: number[] = [],
            joins: number[] = [];
          for (const [index, partition] of allocation.partitions!.entries()) {
            const draw = allocation.linePartitions![index]!;
            const result = inspectConnectedPartition({ partition, draw, count, topology, capacity });
            segments.push(...result.segments);
            joins.push(...result.joins);
          }
          expect(segments).toEqual(
            Array.from({ length: topology === 'loop' ? count : count - 1 }, (_, index) => index)
          );
          expect(joins).toEqual(
            Array.from(
              { length: topology === 'loop' ? count : count - 2 },
              (_, index) => index + (topology === 'strip' ? 1 : 0)
            )
          );
        }
      }
    }
  );

  it.each(['strip', 'loop'] as const)('retains the complete %s allocation when one buffer fits', topology => {
    const item = createLineItem(3, topology);
    const allocation = getInstanceAllocation(item, createGpu().device);
    expect(allocation.key).toBe(`line/${topology}/3/single`);
    expect(allocation.primitiveRecordCount).toBe(3);
    expect(allocation.partitions).toEqual([
      { byteLength: LINE_VERTEX.stride * 3, byteOffset: 0, firstRecord: 0, recordCount: 3 }
    ]);
    expect(allocation.linePartitions).toEqual([
      {
        joinCount: topology === 'loop' ? 3 : 1,
        joinStart: 0,
        segmentBase: 0,
        segmentCount: topology === 'loop' ? 3 : 2,
        segmentStart: 0,
        sourceCount: 3
      }
    ]);
  });

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

function mappedRecordIndices(partition: StoragePartition): number[] {
  if (!partition.sourceRanges)
    return Array.from(
      { length: partition.recordCount },
      (_, index) => partition.byteOffset / LINE_VERTEX.stride + index
    );
  const records: number[] = [];
  for (const range of partition.sourceRanges) {
    expect(range.targetByteOffset).toBe(records.length * LINE_VERTEX.stride);
    records.push(
      ...Array.from(
        { length: range.byteLength / LINE_VERTEX.stride },
        (_, index) => range.sourceByteOffset / LINE_VERTEX.stride + index
      )
    );
  }
  expect(records).toHaveLength(partition.recordCount);
  return records;
}

function inspectConnectedPartition(options: {
  partition: StoragePartition;
  draw: ConnectedLineDrawPartition;
  count: number;
  topology: 'strip' | 'loop';
  capacity: number;
}): { segments: number[]; joins: number[] } {
  const { partition, draw, count, topology, capacity } = options;
  const records = mappedRecordIndices(partition);
  const segments: number[] = [],
    joins: number[] = [];
  expect(partition.recordCount).toBeLessThanOrEqual(capacity);
  expect(partition.byteLength).toBe(partition.recordCount * LINE_VERTEX.stride);
  expect(draw.sourceCount).toBe(count);
  for (let segment = 0; segment < draw.segmentCount; segment += 1) {
    const local = draw.segmentStart + segment;
    const identity = draw.segmentBase + segment;
    expect([records[local], records[(local + 1) % records.length]]).toEqual([identity, (identity + 1) % count]);
    segments.push(identity);
  }
  for (let join = 0; join < draw.joinCount; join += 1) {
    const local = draw.joinStart + join + (topology === 'strip' ? 1 : 0);
    const identity = records[local]!;
    expect([records[(local + records.length - 1) % records.length], records[(local + 1) % records.length]]).toEqual([
      (identity + count - 1) % count,
      (identity + 1) % count
    ]);
    joins.push(identity);
  }
  return { segments, joins };
}
