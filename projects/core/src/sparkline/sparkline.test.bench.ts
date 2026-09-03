// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { toLinePath, toPlotPoints } from './sparkline.utils.js';

const values = Array.from({ length: 10_000 }, (_, index) => Math.sin(index / 10) * 100);
const points = toPlotPoints(values.slice(0, 1_000), { min: -100, max: 100 }, { width: 1_000, height: 100 });
const runOptions = {
  iterations: 10,
  throws: true,
  time: 500,
  warmupIterations: 5,
  warmupTime: 100
} satisfies BenchRunOptions;

describe('sparkline data transforms', () => {
  test('transforms 10,000 values into plot points', async ({ bench }) => {
    await bench('transforms 10,000 values into plot points', () => {
      toPlotPoints(values, { min: -100, max: 100 }, { width: 10_000, height: 100 });
    }).run(runOptions);
  });
});

describe('sparkline path interpolation', () => {
  test('generates a 1,000-point linear path', async ({ bench }) => {
    await bench('generates a 1,000-point linear path', () => {
      toLinePath(points, 'linear', 1_000);
    }).run(runOptions);
  });

  test('generates a 1,000-point smooth path', async ({ bench }) => {
    await bench('generates a 1,000-point smooth path', () => {
      toLinePath(points, 'smooth', 1_000);
    }).run(runOptions);
  });

  test('generates a 1,000-point step path', async ({ bench }) => {
    await bench('generates a 1,000-point step path', () => {
      toLinePath(points, 'step', 1_000);
    }).run(runOptions);
  });
});
