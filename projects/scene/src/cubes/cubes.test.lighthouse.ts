// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('scene cubes lighthouse report', () => {
  test('should meet representative scene benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-scene-cubes',
      /* html */ `
        <nve-scene aria-label="cubes scene">
          <nve-scene-cubes><nve-scene-marker position="[0,0,0]"></nve-scene-marker></nve-scene-cubes>
        </nve-scene>
        <script type="module">import '@nvidia-elements/scene/cubes/define.js';</script>
      `
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
  });
});
