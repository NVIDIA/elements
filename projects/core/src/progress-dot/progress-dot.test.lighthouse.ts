// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('progress-dot lighthouse report', () => {
  test('should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-progress-dot', /* html */ `
      <nve-progress-dot aria-label="Loading results"></nve-progress-dot>
      <script type="module">
        import '@nvidia-elements/core/progress-dot/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(12);
  });
});
