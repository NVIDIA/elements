// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { compileBodyGeometry } from './geometry.js';
import type { SceneBodyGeometry } from './types.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;

describe('colored body mesh compilation', () => {
  for (const count of [128, 2048]) {
    const batch = count === 128 ? 16 : 2;
    const positions = Float32Array.from({ length: count * 9 }, (_, index) => [0, 0, 0, 1, 0, 0, 0, 1, 0][index % 9]!);
    const normals = Float32Array.from({ length: count * 9 }, (_, index) => (index % 3 === 2 ? 1 : 0));
    const colors = Float32Array.from({ length: count * 12 }, (_, index) => [0.25, 0.5, 0.75, 0.8][index % 4]!);
    const geometry: SceneBodyGeometry = [{ geometry: { positions, normals, colors }, color: [0.7, 0.5, 0.2, 0.8] }];
    test(`compiles ${count} colored triangles, batch ${batch}`, async ({ bench }) => {
      await bench('complete compilation', () => {
        let checksum = 0;
        for (let index = 0; index < batch; index += 1) {
          const result = compileBodyGeometry(geometry);
          checksum += result.positions.length + result.colors[0]!;
        }
        return checksum;
      }).run(options);
    });
  }
});
