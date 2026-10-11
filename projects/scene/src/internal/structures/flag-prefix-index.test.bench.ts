// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { FlagPrefixIndex } from './flag-prefix-index.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;

describe('flag prefix updates', () => {
  for (const length of [4096, 65_536]) {
    const batches = length === 4096 ? [32_768, 256, 2048, 32, 256] : [32_768, 256, 2048, 4, 16];
    for (const [workloadIndex, workload] of [
      'one record',
      '256 contiguous records',
      '32 distributed records',
      'all records',
      'unchanged'
    ].entries()) {
      const batch = batches[workloadIndex]!;
      const indices =
        workload === 'one record'
          ? [0]
          : workload === '256 contiguous records'
            ? Array.from({ length: 256 }, (_, index) => Math.floor(length / 2) + index)
            : workload === '32 distributed records'
              ? Array.from({ length: 32 }, (_, index) => Math.floor((index * (length - 1)) / 31))
              : Array.from({ length }, (_, index) => index);

      test(`updates ${workload} in ${length} records, batch ${batch}`, async ({ bench }) => {
        const summary = new FlagPrefixIndex(3);
        summary.reset(length);
        summary.finishInitialFlags(4);
        let iteration = 0;

        const run =
          workload === 'one record'
            ? () => {
                let checksum = 0;
                for (let item = 0; item < batch; item += 1) {
                  const flags = iteration++ % 2 === 0 ? 2 : 4;
                  for (const index of indices) summary.updateFlags(index, flags);
                  checksum += Number(summary.has(2, length)) + Number(summary.has(4, length, true));
                }
                return checksum;
              }
            : () => {
                let checksum = 0;
                for (let item = 0; item < batch; item += 1) {
                  const flags = workload === 'unchanged' ? 4 : iteration++ % 2 === 0 ? 2 : 4;
                  for (const index of indices) summary.updateFlagsBatched(index, flags);
                  checksum += Number(summary.has(2, length)) + Number(summary.has(4, length, true));
                }
                return checksum;
              };
        await bench('mutate and query', run).run(options);
      });
    }
  }
});
