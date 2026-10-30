// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('skeleton lighthouse report', () => {
  test('skeleton should meet lighthouse benchmarks', async () => {
    // Keep the page-load audit static; effect variants have visual and accessibility coverage.
    const report = await lighthouseRunner.getReport('nve-skeleton', /* html */`
      <nve-skeleton></nve-skeleton>
      <nve-skeleton shape="pill"></nve-skeleton>
      <nve-skeleton shape="round" style="width: 40px; height: 40px;"></nve-skeleton>
      <script type="module">
        import '@nvidia-elements/core/skeleton/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThan(99);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(12);
  });
});

