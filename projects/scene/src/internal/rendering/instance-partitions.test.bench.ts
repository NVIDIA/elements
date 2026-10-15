// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { createGpu, createLineItem } from '../../../test/rendering.js';
import { LINE_VERTEX } from '../records/layouts/built-ins.js';
import { getInstanceAllocation } from './instance-partitions.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;

describe('connected sequence allocation', () => {
  for (const count of [4096, 65_536]) {
    for (const capacity of [1024, 16_384]) {
      const batch = count <= capacity ? 16_384 : count / capacity <= 4 ? 8192 : 512;
      for (const topology of ['strip', 'loop'] as const) {
        const item = createLineItem(count, topology);
        const device = {
          ...createGpu().device,
          limits: { maxStorageBufferBindingSize: capacity * LINE_VERTEX.stride, maxBufferSize: 256 * 1024 * 1024 }
        };
        test(`plans ${count} ${topology} records at capacity ${capacity}, batch ${batch}`, async ({ bench }) => {
          await bench('allocation planning', () => {
            let checksum = 0;
            for (let iteration = 0; iteration < batch; iteration += 1) {
              const allocation = getInstanceAllocation(item, device);
              checksum += allocation.partitions!.length + allocation.linePartitions!.at(-1)!.segmentBase;
            }
            return checksum;
          }).run(options);
        });
      }
    }
  }
});
