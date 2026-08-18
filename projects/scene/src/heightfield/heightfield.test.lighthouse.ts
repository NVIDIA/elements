// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuLighthouseRunner } from '@internals/vite';

describe('scene heightfield lighthouse report', () => {
  test('meets representative scene benchmarks', async () => {
    const report = await webgpuLighthouseRunner.getReport(
      'nve-scene-heightfield',
      `<nve-scene aria-label="Heightfield"><nve-scene-heightfield></nve-scene-heightfield></nve-scene><script type="module">import '@nvidia-elements/scene/heightfield/define.js';</script>`
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
  });
});
