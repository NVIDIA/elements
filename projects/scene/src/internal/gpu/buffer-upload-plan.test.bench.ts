// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { planBufferUploads } from './buffer-upload-plan.js';
import {
  acquireSharedInstanceBuffer,
  writeSharedInstanceBuffer,
  writeSharedInstanceBufferRanges,
  type SharedInstanceBufferDevice
} from './shared-instance-buffer.js';

const options = { iterations: 10, throws: true, time: 500, warmupTime: 150 } satisfies BenchRunOptions;
const batch = 1_024;

describe('buffer upload planning', () => {
  for (const count of [1, 32, 256]) {
    const routingBatch = count === 1 ? 16_384 : count === 32 ? 2_048 : 256;
    for (const partitions of [1, 64]) {
      const bytes = new Uint8Array(64 * 4096);
      const observation = { checksum: 0 };
      const device = createDevice(bytes.byteLength / partitions, observation);
      const ranges = Array.from({ length: count }, (_, index) => ({ offset: index * 1024, size: 16 }));
      test(`routes ${count} normalized dirty ranges across ${partitions} partitions, batch ${routingBatch}`, async ({
        bench
      }) => {
        const lease = acquireSharedInstanceBuffer(device, bytes, { stride: 16 });
        await bench('existing per-range routing', () => {
          observation.checksum = 0;
          for (let index = 0; index < routingBatch; index += 1) {
            for (const range of ranges) writeSharedInstanceBuffer({ bytes, device, lease, range });
          }
          return observation.checksum;
        }).run(options);
        await bench('planned batch routing', () => {
          observation.checksum = 0;
          for (let index = 0; index < routingBatch; index += 1) {
            writeSharedInstanceBufferRanges({ bytes, device, lease, ranges });
          }
          return observation.checksum;
        }).run({ ...options, teardown: () => lease.release() });
      });
    }
  }

  for (const count of [32, 256]) {
    const ranges = Array.from({ length: count }, (_, index) => ({ offset: ((index * 17) % count) * 32 + 1, size: 16 }));
    for (const callOverheadBytes of [0, 16]) {
      test(`normalizes ${count} unordered byte ranges with write cost ${callOverheadBytes}, batch ${batch}`, async ({
        bench
      }) => {
        await bench('aligns and coalesces upload ranges', () => {
          let checksum = 0;
          for (let index = 0; index < batch; index += 1) {
            const plan = planBufferUploads({ byteLength: count * 32, callOverheadBytes, ranges });
            checksum += plan.length + plan[0]!.size;
          }
          return checksum;
        }).run(options);
      });
    }
  }
});

describe('bounded buffer upload planning', () => {
  for (const count of [64, 65, 256, 4096]) {
    const planningBatch = count <= 65 ? 1_024 : count === 256 ? 256 : 16;
    const ranges = Array.from({ length: count }, (_, index) => ({ offset: index * 72, size: 12 }));
    for (const maxWrites of [64, Number.MAX_SAFE_INTEGER]) {
      test(`plans ${count} normalized ranges with write budget ${maxWrites}, batch ${planningBatch}`, async ({
        bench
      }) => {
        await bench('bounded upload planning', () => {
          let checksum = 0;
          for (let index = 0; index < planningBatch; index += 1) {
            const plan = planBufferUploads({ byteLength: 1024 * 1024, maxWrites, ranges });
            checksum += plan.length + plan[0]!.size;
          }
          return checksum;
        }).run(options);
      });
    }
  }
});

function createDevice(byteLength: number, observation: { checksum: number }): SharedInstanceBufferDevice {
  return {
    createBuffer: () => ({ destroy: () => undefined }),
    createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
    destroy: () => undefined,
    limits: { maxBufferSize: byteLength, maxStorageBufferBindingSize: byteLength },
    lost: new Promise<never>(() => undefined),
    queue: {
      submit: () => undefined,
      // CPU routing evidence excludes WebGPU validation, transfer, and GPU execution.
      writeBuffer: (_buffer, offset, data) => {
        observation.checksum += offset + data.byteLength;
      }
    }
  };
}
