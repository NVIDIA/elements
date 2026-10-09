// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { createHeightfieldIndices, prepareHeightfieldIndices } from './topology.js';
import type { PreparationContext } from '../../rendering/preparation.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;
// Immediate yields isolate CPU traversal and promise overhead from browser scheduling latency.
const context: PreparationContext = { isCurrent: () => true, yield: () => Promise.resolve() };

describe('heightfield topology generation', () => {
  for (const size of [2, 64, 256]) {
    const batch = size === 2 ? 4_096 : size === 64 ? 16 : 2;
    test(`creates ${size} by ${size} topology, batch ${batch}`, async ({ bench }) => {
      await bench('synchronous topology', () => {
        let checksum = 0;
        for (let index = 0; index < batch; index += 1) {
          const indices = createHeightfieldIndices(size, size);
          checksum += indices.length + indices.at(-1)!;
        }
        return checksum;
      }).run(options);
    });

    test(`prepares ${size} by ${size} topology, batch ${batch}`, async ({ bench }) => {
      await bench('cancellable topology', async () => {
        let checksum = 0;
        for (let index = 0; index < batch; index += 1) {
          const indices = await prepareHeightfieldIndices(size, size, context);
          if (indices) checksum += indices.length + indices.at(-1)!;
        }
        return checksum;
      }).run(options);
    });
  }
});
