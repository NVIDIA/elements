// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('scene spheres lighthouse report', () => {
  test('should meet representative scene benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-scene-spheres',
      /* html */ `
        <nve-scene aria-label="spheres scene">
          <nve-scene-spheres><nve-scene-marker position="[0,0,0]"></nve-scene-marker></nve-scene-spheres>
        </nve-scene>
        <script type="module">import '@nvidia-elements/scene/spheres/define.js';</script>
      `
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
  });
});
