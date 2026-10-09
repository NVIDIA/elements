// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import type { StoragePartition } from './partition.js';
import {
  acquireSharedInstanceBuffer,
  writeSharedInstanceBuffer,
  type SharedInstanceBufferDevice
} from './shared-instance-buffer.js';

const options = { iterations: 10, throws: true, time: 500, warmupTime: 150 } satisfies BenchRunOptions;
const partitionBytes = 256;
const batch = 256;

describe('shared instance upload routing', () => {
  for (const count of [1, 4, 64, 1_024]) {
    for (const workload of ['sparse', 'boundary', 'full'] as const) {
      if (count === 1 && workload === 'boundary') continue;
      const updateBatch = count === 1 ? 16_384 : count === 4 ? 4_096 : count === 64 ? 1_024 : batch;
      const bytes = new Uint8Array(count * partitionBytes);
      const observation = { checksum: 0 };
      const device = createDevice(observation);
      const lease = acquireSharedInstanceBuffer(device, bytes, { stride: 16 });
      const ranges = Array.from({ length: updateBatch }, (_, index) => {
        const partition = (index * 17) % count;
        return workload === 'full'
          ? { offset: 0, size: bytes.byteLength }
          : { offset: partition * partitionBytes + (workload === 'boundary' ? 248 : 16), size: 16 };
      });
      test(`routes ${workload} updates across ${count} partitions, batch ${updateBatch}`, async ({ bench }) => {
        await bench('routes byte ranges', () => {
          observation.checksum = 0;
          for (const range of ranges) writeSharedInstanceBuffer({ bytes, device, lease, range });
          return observation.checksum;
        }).run({ ...options, teardown: () => lease.release() });
      });
    }
  }

  test(`routes 32 fragmented updates across 1,024 wrapped partitions, batch ${batch}`, async ({ bench }) => {
    const bytes = new Uint8Array(1_024 * partitionBytes);
    const partitions = createWrappedPartitions(1_024);
    const observation = { checksum: 0 };
    const device = createDevice(observation);
    const lease = acquireSharedInstanceBuffer(device, bytes, { partitions, stride: 16 });
    const ranges = Array.from({ length: 32 }, (_, index) => ({ offset: index * 31 * partitionBytes, size: 16 }));
    await bench('routes wrapped and duplicated spans', () => {
      observation.checksum = 0;
      for (let index = 0; index < batch; index += 1) {
        for (const range of ranges) writeSharedInstanceBuffer({ bytes, device, lease, range });
      }
      return observation.checksum;
    }).run({ ...options, teardown: () => lease.release() });
  });

  for (const count of [1, 64]) {
    test(`allocates and releases ${count} partitions, batch ${batch}`, async ({ bench }) => {
      const bytes = new Uint8Array(count * partitionBytes);
      const observation = { checksum: 0 };
      const device = createDevice(observation);
      await bench('creates buffer leases and routing metadata', () => {
        observation.checksum = 0;
        for (let index = 0; index < batch; index += 1) {
          const lease = acquireSharedInstanceBuffer(device, bytes, { stride: 16 });
          lease.release();
        }
        return observation.checksum;
      }).run(options);
    });
  }

  test(`allocates, routes a sparse update, and releases 64 partitions, batch ${batch}`, async ({ bench }) => {
    const bytes = new Uint8Array(64 * partitionBytes);
    const observation = { checksum: 0 };
    const device = createDevice(observation);
    const range = { offset: 16, size: 16 };
    await bench('includes first-update metadata construction', () => {
      observation.checksum = 0;
      for (let index = 0; index < batch; index += 1) {
        const lease = acquireSharedInstanceBuffer(device, bytes, { stride: 16 });
        writeSharedInstanceBuffer({ bytes, device, lease, range });
        lease.release();
      }
      return observation.checksum;
    }).run(options);
  });
});

function createWrappedPartitions(count: number): StoragePartition[] {
  return Array.from({ length: count }, (_, index) => ({
    byteLength: partitionBytes,
    byteOffset: index * partitionBytes,
    firstRecord: index * 16,
    recordCount: 16,
    sourceRanges: [
      { byteLength: 16, sourceByteOffset: ((index + count - 1) % count) * partitionBytes, targetByteOffset: 0 },
      { byteLength: 240, sourceByteOffset: index * partitionBytes, targetByteOffset: 16 }
    ]
  }));
}

function createDevice(observation: { checksum: number }): SharedInstanceBufferDevice {
  return {
    createBuffer: () => ({ destroy: () => undefined }),
    createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
    destroy: () => undefined,
    limits: { maxBufferSize: partitionBytes, maxStorageBufferBindingSize: partitionBytes },
    lost: new Promise<never>(() => undefined),
    queue: {
      submit: () => undefined,
      // A CPU benchmark measures routing and view creation, rather than native GPU submission time.
      writeBuffer: (_buffer, offset, data) => {
        observation.checksum += offset + data.byteOffset + data.byteLength;
      }
    }
  };
}
