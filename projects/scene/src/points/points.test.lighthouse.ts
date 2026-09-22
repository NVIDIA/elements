// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('scene points lighthouse report', () => {
  test('meets representative scene benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-scene-points',
      `<nve-scene aria-label="points"><nve-scene-points></nve-scene-points></nve-scene><script type="module">import '@nvidia-elements/scene/points/define.js';</script>`
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
  });
});
