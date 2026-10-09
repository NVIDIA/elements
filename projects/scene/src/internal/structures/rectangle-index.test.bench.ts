// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { RectangleIndex, type RectangleBounds } from './rectangle-index.js';

const runOptions = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;
const QUERY_COUNT = 4_096;

describe('rectangle candidate indexing', () => {
  for (const count of [64, 1_024, 4_096]) {
    const bounds: RectangleBounds[] = Array.from({ length: count }, (_, index) => [
      index * 2,
      index % 32,
      index * 2 + 1,
      (index % 32) + 1
    ]);
    const indexed = new RectangleIndex(bounds);

    test(`builds 16 indices with ${count} rectangles`, async ({ bench }) => {
      await bench('construction including bounds copy', () => {
        let bytes = 0;
        for (let iteration = 0; iteration < 16; iteration += 1) bytes += new RectangleIndex(bounds).byteLength;
        return bytes;
      }).run(runOptions);
    });

    test(`queries ${QUERY_COUNT} sparse envelopes across ${count} rectangles`, async ({ bench }) => {
      await bench('indexed candidates', () => {
        let checksum = 0;
        for (let query = 0; query < QUERY_COUNT; query += 1) {
          const slot = (query * 17) % count;
          indexed.some(slot * 2, slot % 32, slot * 2 + 1, (slot % 32) + 1, candidate => {
            checksum += candidate;
            return false;
          });
        }
        return checksum;
      }).run(runOptions);
    });

    test(`scans ${QUERY_COUNT} sparse envelopes across ${count} rectangles`, async ({ bench }) => {
      await bench('exhaustive candidates', () => {
        let checksum = 0;
        for (let query = 0; query < QUERY_COUNT; query += 1) {
          const slot = (query * 17) % count;
          for (let candidate = 0; candidate < bounds.length; candidate += 1) {
            const rectangle = bounds[candidate]!;
            if (
              rectangle[0] <= slot * 2 + 1 &&
              rectangle[2] >= slot * 2 &&
              rectangle[1] <= (slot % 32) + 1 &&
              rectangle[3] >= slot % 32
            )
              checksum += candidate;
          }
        }
        return checksum;
      }).run(runOptions);
    });

    test(`queries 64 full envelopes across ${count} rectangles`, async ({ bench }) => {
      await bench('worst case without pruning', () => {
        let checksum = 0;
        for (let query = 0; query < 64; query += 1)
          indexed.some(-Infinity, -Infinity, Infinity, Infinity, candidate => {
            checksum += candidate;
            return false;
          });
        return checksum;
      }).run(runOptions);
    });

    test(`removes and restores 256 slots across ${count} rectangles`, async ({ bench }) => {
      await bench('ancestor updates', () => {
        for (let operation = 0; operation < 256; operation += 1) {
          const slot = (operation * 17) % count;
          indexed.remove(slot);
          indexed.set(slot, ...bounds[slot]!);
        }
        return indexed.size;
      }).run(runOptions);
    });
  }
});
