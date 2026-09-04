// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';
describe('scene triangles lighthouse report', () => {
  test('meets representative scene benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-scene-triangles',
      `<nve-scene aria-label="triangles"><nve-scene-triangles></nve-scene-triangles></nve-scene><script type="module">import '@nvidia-elements/scene/triangles/define.js';</script>`
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
  });
});
