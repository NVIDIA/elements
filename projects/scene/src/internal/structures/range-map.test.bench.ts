// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { RangeMap } from './range-map.js';

const runOptions = { iterations: 10, throws: true, time: 1_000, warmupTime: 250 } satisfies BenchRunOptions;
// Batch enough lookups to exceed the browser timer resolution even for small tables.
const QUERY_COUNT = 65_536;

describe('pick target range lookup', () => {
  for (const count of [16, 256, 4_096]) {
    const entries = Array.from({ length: count }, (_, index) => ({
      start: index * 3 + 1,
      end: index * 3 + 4,
      value: index
    }));
    const ranges = new RangeMap(entries);
    const previous = entries.map(entry => ({ firstId: entry.start, endId: entry.end, value: entry.value }));
    // Include misses and distribute hits across the table. Construction is outside the measured work.
    const ids = Array.from({ length: QUERY_COUNT }, (_, index) => (index * 17) % (count * 3 + 2));

    test(`looks up ${QUERY_COUNT} IDs across ${count} ranges with a linear scan`, async ({ bench }) => {
      await bench('linear scan', () => {
        let decoded = 0;
        for (const id of ids) {
          const entry = previous.find(candidate => id >= candidate.firstId && id < candidate.endId);
          if (entry) decoded += entry.value + id - entry.firstId;
        }
        return decoded;
      }).run(runOptions);
    });

    test(`looks up ${QUERY_COUNT} IDs across ${count} ranges with RangeMap`, async ({ bench }) => {
      await bench('RangeMap', () => {
        let decoded = 0;
        for (const id of ids) {
          const entry = ranges.get(id);
          if (entry) decoded += entry.value + id - entry.start;
        }
        return decoded;
      }).run(runOptions);
    });
  }
});
