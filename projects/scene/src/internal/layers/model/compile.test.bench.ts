// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { compileParts, type ModelPart } from './compile.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;
const shapes = ['cube', 'sphere', 'cylinder', 'cone', 'pyramid'] as const;

describe('model part compilation', () => {
  for (const kind of ['cube', 'sphere', 'mixed'] as const) {
    for (const count of kind === 'mixed' ? [100] : [1, 100]) {
      const batch = count === 1 ? 64 : 1;
      const parts = Array.from(
        { length: count },
        (_, index): ModelPart => ({
          shape: kind === 'mixed' ? shapes[index % shapes.length]! : kind,
          position: [index, index % 3, 0],
          orientation: [0, 0, Math.SQRT1_2, Math.SQRT1_2],
          scale: [index % 2 ? -1 : 1, 2, 0.5],
          color: [0.25, 0.5, 0.75, 1]
        })
      );

      test(`compiles ${count} ${kind} parts, batch ${batch}`, async ({ bench }) => {
        await bench('complete compilation', () => {
          let checksum = 0;
          for (let item = 0; item < batch; item += 1) {
            const compiled = compileParts(parts);
            checksum += compiled.positions.length + compiled.indices.length + compiled.normals[0]!;
          }
          return checksum;
        }).run(options);
      });
    }
  }
});
