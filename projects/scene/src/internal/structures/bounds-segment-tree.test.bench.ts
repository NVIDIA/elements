// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { BoundsSegmentTree } from './bounds-segment-tree.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;
const inputs = [new Float64Array([-1, -2, -3, 4, 5, 6]), new Float64Array([-10, -20, -30, 40, 50, 60])];

describe('bounds segment tree updates', () => {
  for (const length of [4096, 5000]) {
    for (const workload of ['two distant leaves', '32 distributed leaves', '64 contiguous leaves', 'all leaves']) {
      const batch = workload === 'two distant leaves' ? 512 : workload === '64 contiguous leaves' ? 256 : 64;
      const start = Math.floor(length / 2);
      const indices =
        workload === 'two distant leaves'
          ? [0, length - 1]
          : workload === '32 distributed leaves'
            ? Array.from({ length: 32 }, (_, index) => Math.floor((index * (length - 1)) / 31))
            : workload === '64 contiguous leaves'
              ? Array.from({ length: 64 }, (_, index) => start + index)
              : Array.from({ length }, (_, index) => index);

      test(`replaces ${workload} in ${length} leaves, batch ${batch}`, async ({ bench }) => {
        const tree = new BoundsSegmentTree();
        tree.reset(length);
        for (let index = 0; index < length; index += 1) tree.include(index, inputs[0]!);
        const result = new Float64Array(6);
        tree.extendPrefix(length, result);
        let iteration = 0;

        await bench('mutate and query', () => {
          let checksum = 0;
          for (let item = 0; item < batch; item += 1) {
            const input = inputs[iteration++ % 2]!;
            if (workload === 'all leaves') tree.clear(0, length);
            else if (workload === '64 contiguous leaves') tree.clear(start, start + 64);
            else for (const index of indices) tree.clear(index, index + 1);
            for (const index of indices) tree.include(index, input);
            result.fill(Infinity, 0, 3);
            result.fill(-Infinity, 3);
            tree.extendPrefix(length, result);
            checksum += result[0]! + result[5]!;
          }
          return checksum;
        }).run(options);
      });
    }
  }
});
