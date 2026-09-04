// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('scene label lighthouse report', () => {
  test('should meet representative scene benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-scene-label',
      `<nve-scene aria-label="Robot visualization"><nve-scene-label><span>Robot base</span></nve-scene-label></nve-scene><script type="module">import '@nvidia-elements/scene/label/define.js';</script>`
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
  });
});
