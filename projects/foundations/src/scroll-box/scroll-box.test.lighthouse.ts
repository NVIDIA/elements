// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('scroll box lighthouse report', () => {
  test('scroll box should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-scroll-box', /* html */ `
      <nve-scroll-box scroll-shadow role="region" aria-label="Activity" style="width: 200px; height: 150px;">
        <div style="width: 600px; height: 500px;">Activity content</div>
      </nve-scroll-box>
      <script type="module">
        import '@nvidia-elements/foundations/scroll-box/define.js';
      </script>
    `);
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(15);
  });
});
