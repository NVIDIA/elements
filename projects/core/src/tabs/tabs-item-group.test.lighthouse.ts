// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('tabs item group lighthouse report', () => {
  test('tabs item group should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-tabs-item-group',
      /* html */ `
      <nve-tabs aria-label="Experiments">
        <nve-tabs-item-group>
          <nve-tabs-item selected>Experiment</nve-tabs-item>
          <button slot="suffix" type="button" aria-label="Close experiment">Close</button>
        </nve-tabs-item-group>
        <nve-tabs-item>Comparison</nve-tabs-item>
      </nve-tabs>
      <script type="module">
        import '@nvidia-elements/core/tabs/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(19);
  });
});
