// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import type { Quaternion, Vec3 } from '../types.js';
import { composeMat4, multiplyMat4, transformPointMat4 } from './mat4.js';

const BATCH_SIZE = 10_000;
const runOptions = {
  iterations: 10,
  throws: true,
  time: 1_000,
  warmupTime: 250
} satisfies BenchRunOptions;
const positions = Array.from(
  { length: BATCH_SIZE },
  (_, index): Vec3 => [index % 101, (index % 67) - 33, (index % 43) * 0.25]
);
const orientations = Array.from(
  { length: BATCH_SIZE },
  (_, index): Quaternion => [index % 11, (index % 13) - 6, (index % 17) + 1, (index % 19) + 2]
);
const scales = Array.from(
  { length: BATCH_SIZE },
  (_, index): Vec3 => [1 + (index % 5) * 0.1, 1 + (index % 7) * 0.1, 1 + (index % 3) * 0.1]
);
const leftMatrices = positions.map((position, index) =>
  composeMat4(position, orientations[index] ?? [0, 0, 0, 1], scales[index])
);
const rightMatrices = positions.map((position, index) =>
  composeMat4(
    [position[2], position[0], position[1]],
    orientations[BATCH_SIZE - index - 1] ?? [0, 0, 0, 1],
    scales[BATCH_SIZE - index - 1]
  )
);
const points = positions.map(([x, y, z]): Vec3 => [z, x, y]);

describe('mat4 math', () => {
  test('composes 10,000 affine matrices', async ({ bench }) => {
    await bench('composes 10,000 affine matrices', () => {
      let checksum = 0;
      for (let index = 0; index < BATCH_SIZE; index += 1) {
        const matrix = composeMat4(positions[index] ?? [0, 0, 0], orientations[index] ?? [0, 0, 0, 1], scales[index]);
        checksum += matrix[0] ?? 0;
      }
      return checksum;
    }).run(runOptions);
  });

  test('multiplies 10,000 matrices', async ({ bench }) => {
    await bench('multiplies 10,000 matrices', () => {
      let checksum = 0;
      for (const [index, leftMatrix] of leftMatrices.entries()) {
        const matrix = multiplyMat4(leftMatrix, rightMatrices[index] ?? leftMatrix);
        checksum += matrix[0] ?? 0;
      }
      return checksum;
    }).run(runOptions);
  });

  test('transforms 10,000 points', async ({ bench }) => {
    await bench('transforms 10,000 points', () => {
      let checksum = 0;
      for (const [index, matrix] of leftMatrices.entries()) {
        const point = transformPointMat4(matrix, points[index] ?? [0, 0, 0]);
        checksum += point[0];
      }
      return checksum;
    }).run(runOptions);
  });
});
