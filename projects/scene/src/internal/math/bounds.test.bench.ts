// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { BoundsAccumulator, type SceneBounds } from './bounds.js';
import { composePreciseMat4 } from './mat4.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;
const box: SceneBounds = { minimum: [-0.5, -0.5, -0.5], maximum: [0.5, 0.5, 0.5] };

describe('transformed bounds accumulation', () => {
  for (const count of [128, 4096]) {
    const batch = count === 128 ? 32 : 1;
    for (const kind of ['rotated', 'sheared', 'singular'] as const) {
      const matrices = Array.from({ length: count }, (_, index) => {
        const matrix = composePreciseMat4(
          [1e12 + index, index % 7, index % 11],
          [1, index % 5, 2, 3],
          [index % 2 ? -1 : 1, kind === 'singular' ? 0 : 2, 0.5]
        );
        if (kind === 'sheared') matrix[4] = matrix[4]! + 0.25;
        return matrix;
      });
      test(`accumulates ${count} ${kind} boxes, batch ${batch}`, async ({ bench }) => {
        await bench('complete bounds accumulation', () => {
          let maximum = 0;
          for (let iteration = 0; iteration < batch; iteration += 1) {
            const bounds = new BoundsAccumulator();
            for (const matrix of matrices) bounds.includeBox(box, matrix);
            maximum = bounds.bounds!.maximum[0];
          }
          return maximum;
        }).run(options);
      });
    }
  }
});
