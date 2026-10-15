// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { drape, drapeToSurface, heightAt, prepareHeightfieldSampler, surfaceHeightAt } from './query.js';
import type { HeightfieldGrid } from './types.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;
const grid: HeightfieldGrid = {
  columns: 257,
  rows: 129,
  spacing: 0.5,
  origin: [10, -20],
  heights: Float32Array.from({ length: 257 * 129 }, (_, index) => ((index * 17) % 113) / 7)
};

const sampler = prepareHeightfieldSampler(grid);

describe('heightfield sampling', () => {
  for (const count of [256, 65_536]) {
    const batch = 65_536 / count;
    const points = Float32Array.from({ length: count * 3 }, (_, index) => {
      const point = Math.floor(index / 3);
      if (index % 3 === 0) return point % 8 === 0 ? 200 : 10 + ((point * 37) % 1025) / 8;
      if (index % 3 === 1) return -20 + ((point * 19) % 513) / 8;
      return 99;
    });
    for (const interpolation of ['bilinear', 'triangle'] as const) {
      const sample = interpolation === 'bilinear' ? heightAt : surfaceHeightAt;
      const project = interpolation === 'bilinear' ? drape : drapeToSurface;
      test(`samples ${count} ${interpolation} points, batch ${batch}`, async ({ bench }) => {
        await bench('scalar queries', () => {
          let sum = 0;
          for (let iteration = 0; iteration < batch; iteration += 1) {
            for (let offset = 0; offset < points.length; offset += 3) {
              sum += sample(sampler, points[offset]!, points[offset + 1]!) ?? 0;
            }
          }
          return sum;
        }).run(options);
      });
      test(`drapes ${count} ${interpolation} points, batch ${batch}`, async ({ bench }) => {
        await bench('copy and drape', () => {
          let result: Float32Array = points;
          for (let iteration = 0; iteration < batch; iteration += 1) result = project(sampler, points, 0.25);
          return result;
        }).run(options);
      });
    }
  }
});
