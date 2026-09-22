// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { RangeSet, type RangeInterval } from './range-set.js';

const runOptions = { iterations: 10, throws: true, time: 1_000, warmupTime: 250 } satisfies BenchRunOptions;
// Batch 100 collections so samples exceed the browser timer resolution.
const BATCH_SIZE = 100;

describe('dirty range merging', () => {
  for (const [name, ranges] of [
    ['1K adjacent ranges', createRanges(1_000, 48, 48)],
    ['1K disjoint ranges', createRanges(1_000, 64, 32)],
    ['1K overlapping ranges', createRanges(1_000, 32, 96)]
  ] as const) {
    test(name, async ({ bench }) => {
      await bench(name, () => {
        let rangeCount = 0;
        for (let batch = 0; batch < BATCH_SIZE; batch += 1) {
          const pending = new RangeSet();
          pending.addAll(ranges);
          rangeCount += pending.drain().length;
        }
        return rangeCount;
      }).run(runOptions);
    });
  }
});

function createRanges(count: number, offsetStep: number, size: number): RangeInterval[] {
  return Array.from({ length: count }, (_, index) => ({ offset: index * offsetStep, size }));
}
