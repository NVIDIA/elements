// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('nve-meter lighthouse report', () => {
  it('should meet lighthouse and payload benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-meter', /* html */ `
      <nve-meter aria-label="Storage used" value="58" max="128"></nve-meter>
      <script type="module">import '@nvidia-elements/core/meter/define.js';</script>
    `);
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThanOrEqual(12);
  });
});
