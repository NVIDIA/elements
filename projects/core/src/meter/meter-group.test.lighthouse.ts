// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('nve-meter-group lighthouse report', () => {
  it('should meet lighthouse and payload benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-meter-group', /* html */ `
      <nve-meter-group aria-label="Storage"><nve-meter aria-label="Apps" value="20"></nve-meter><nve-meter aria-label="Media" value="30"></nve-meter></nve-meter-group>
      <script type="module">import '@nvidia-elements/core/meter/define.js';</script>
    `);
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThanOrEqual(12);
  });
});
