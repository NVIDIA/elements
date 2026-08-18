// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test } from 'vitest';
import { webgpuLighthouseRunner } from '@internals/vite';
describe('scene lines lighthouse report', () => {
  test('meets representative scene benchmarks', async () => {
    const report = await webgpuLighthouseRunner.getReport(
      'nve-scene-lines',
      `<nve-scene aria-label="lines"><nve-scene-lines></nve-scene-lines></nve-scene><script type="module">import '@nvidia-elements/scene/lines/define.js';</script>`
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
  });
});
