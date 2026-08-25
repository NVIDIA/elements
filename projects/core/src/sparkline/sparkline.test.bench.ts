// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { bench, describe } from 'vitest';
import { toLinePath, toPlotPoints } from './sparkline.utils.js';

const values = Array.from({ length: 10_000 }, (_, index) => Math.sin(index / 10) * 100);
const points = toPlotPoints(values.slice(0, 1_000), { min: -100, max: 100 }, { width: 1_000, height: 100 });
const options = { throws: true };

describe('sparkline data transforms', () => {
  bench(
    'transforms 10,000 values into plot points',
    () => {
      toPlotPoints(values, { min: -100, max: 100 }, { width: 10_000, height: 100 });
    },
    options
  );
});

describe('sparkline path interpolation', () => {
  bench(
    'generates a 1,000-point linear path',
    () => {
      toLinePath(points, 'linear', 1_000);
    },
    options
  );

  bench(
    'generates a 1,000-point smooth path',
    () => {
      toLinePath(points, 'smooth', 1_000);
    },
    options
  );

  bench(
    'generates a 1,000-point step path',
    () => {
      toLinePath(points, 'step', 1_000);
    },
    options
  );
});
