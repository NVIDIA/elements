// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('viewport zoom range lighthouse report', () => {
  test('viewport zoom range should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-viewport-zoom-range', /* html */`
      <div hidden><nve-viewport id="target" behavior-zoom min-scale="0.25" max-scale="4"></nve-viewport></div>
      <nve-viewport-zoom-range commandfor="target" aria-label="zoom" value="1"></nve-viewport-zoom-range>
      <script type="module">
        import '@nvidia-elements/core/viewport/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(30.7);
  });
});
