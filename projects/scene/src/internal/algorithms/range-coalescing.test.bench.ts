// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { coalesceRanges } from './range-coalescing.js';
import type { RangeInterval } from '../structures/range-interval.js';

const options = { iterations: 10, throws: true, time: 500, warmupTime: 100 } satisfies BenchRunOptions;
type GapDistribution = 'equal' | 'ascending' | 'descending' | 'shuffled';

describe('bounded range coalescing', () => {
  for (const count of [65, 256, 4_096, 65_536]) {
    for (const distribution of ['equal', 'ascending', 'descending', 'shuffled'] as const) {
      measure(count, 64, distribution);
    }
  }
  for (const maxRanges of [2_048, 4_095]) measure(4_096, maxRanges, 'shuffled');
});

function measure(count: number, maxRanges: number, distribution: GapDistribution): void {
  const ranges = createRanges(count, distribution);
  const batch = Math.max(1, Math.floor(65_536 / count));
  test(`coalesces ${count} ranges with ${distribution} gaps to ${maxRanges}, batch ${batch}`, async ({ bench }) => {
    await bench('coalesces bounded ranges', () => {
      let checksum = 0;
      for (let index = 0; index < batch; index += 1) {
        const plan = coalesceRanges({ ranges, maxRanges });
        checksum += plan.length + plan[0]!.size + plan[plan.length - 1]!.offset;
      }
      return checksum;
    }).run(options);
  });
}

function createRanges(count: number, distribution: GapDistribution): RangeInterval[] {
  let offset = 0;
  let state = 1;
  return Array.from({ length: count }, (_, index) => {
    const range = { offset, size: 12 };
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    const gap =
      distribution === 'equal'
        ? 60
        : distribution === 'ascending'
          ? index + 1
          : distribution === 'descending'
            ? count - index
            : (state % 4_096) + 1;
    offset += range.size + gap;
    return range;
  });
}
