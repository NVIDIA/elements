// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('scene marker lighthouse report', () => {
  test('should meet declarative data benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-scene-marker',
      /* html */ `<nve-scene-cubes><nve-scene-marker position="[1,2,3]"></nve-scene-marker></nve-scene-cubes>
        <script type="module">import '@nvidia-elements/scene/cubes/define.js';</script>`
    );
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
  });
});
