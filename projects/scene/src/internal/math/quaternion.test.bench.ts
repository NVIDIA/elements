// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import type { Quaternion } from '../types.js';
import { multiplyQuaternions, normalizeQuaternion } from './quaternion.js';

const BATCH_SIZE = 100_000;
const runOptions = {
  iterations: 10,
  throws: true,
  time: 1_000,
  warmupTime: 250
} satisfies BenchRunOptions;
const leftQuaternions = Array.from(
  { length: BATCH_SIZE },
  (_, index): Quaternion => [(index % 11) + 1, (index % 13) - 6, (index % 17) + 1, (index % 19) + 2]
);
const rightQuaternions = Array.from(
  { length: BATCH_SIZE },
  (_, index): Quaternion => [(index % 7) - 3, (index % 5) + 1, (index % 23) - 11, (index % 29) + 1]
);

describe('quaternion math', () => {
  test('normalizes 100,000 quaternions', async ({ bench }) => {
    await bench('normalizes 100,000 quaternions', () => {
      let checksum = 0;
      for (const quaternion of leftQuaternions) checksum += normalizeQuaternion(quaternion)[0];
      return checksum;
    }).run(runOptions);
  });

  test('multiplies 100,000 quaternions', async ({ bench }) => {
    await bench('multiplies 100,000 quaternions', () => {
      let checksum = 0;
      for (let index = 0; index < BATCH_SIZE; index += 1) {
        checksum += multiplyQuaternions(
          leftQuaternions[index] ?? [0, 0, 0, 1],
          rightQuaternions[index] ?? [0, 0, 0, 1]
        )[0];
      }
      return checksum;
    }).run(runOptions);
  });
});
