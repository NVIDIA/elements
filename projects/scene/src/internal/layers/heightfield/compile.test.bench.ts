// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { compileHeightfield } from './compile.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;

describe('heightfield compilation', () => {
  for (const size of [64, 256]) {
    const batch = size === 64 ? 16 : 2;
    const grid = {
      columns: size,
      rows: size,
      spacing: 0.5,
      heights: Float32Array.from({ length: size * size }, (_, index) => {
        const x = index % size;
        const y = Math.floor(index / size);
        return (x * x) / 128 + y / 4;
      })
    };
    test(`compiles ${size} by ${size} terrain samples, batch ${batch}`, async ({ bench }) => {
      await bench('complete compilation', () => {
        let checksum = 0;
        for (let index = 0; index < batch; index += 1) {
          const result = compileHeightfield(grid);
          checksum += result.indices.length + result.normals[17]!;
        }
        return checksum;
      }).run(options);
    });
  }
});
