// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('viewport minimap lighthouse report', () => {
  test('external viewport minimap should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-viewport-minimap', /* html */ `
      <nve-viewport id="target" behavior-pan behavior-zoom style="width: 600px; height: 400px">
        <div style="width: 800px; height: 600px">Content</div>
      </nve-viewport>
      <nve-viewport-minimap commandfor="target" style="position: relative; inset: auto"></nve-viewport-minimap>
      <script type="module">
        import '@nvidia-elements/core/viewport/define.js';
      </script>
    `);
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(24.8);
  });
});
