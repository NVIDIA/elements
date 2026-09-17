// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('viewport lighthouse report', () => {
  test('viewport should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-viewport',
      /* html */ `
      <nve-viewport style="width: 600px; height: 400px">
        <nve-viewport-gridlines></nve-viewport-gridlines>
        <div style="position: absolute; left: 100px; top: 100px">content</div>
      </nve-viewport>
      <script type="module">
        import '@nvidia-elements/core/viewport/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(21.8);
  });
});
