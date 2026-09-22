// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('menu-group lighthouse report', () => {
  test('menu-group should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-menu-group',
      /* html */ `
      <nve-menu-group behavior-expand expanded>
        Resources
        <span slot="suffix">2</span>
        <nve-menu>
          <nve-menu-item current="page">Documentation</nve-menu-item>
          <nve-menu-item>Examples</nve-menu-item>
        </nve-menu>
      </nve-menu-group>
      <script type="module">
        import '@nvidia-elements/core/menu/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(24);
  });
});
