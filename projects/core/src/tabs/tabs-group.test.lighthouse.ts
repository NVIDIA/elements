// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('tabs-group lighthouse report', () => {
  test('tabs-group should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-tabs-group', /* html */`
      <nve-tabs-group id="tab-group">
        <nve-tabs>
          <nve-tabs-item selected command="--toggle" commandfor="tab-group" value="overview">Overview</nve-tabs-item>
          <nve-tabs-item command="--toggle" commandfor="tab-group" value="details">Details</nve-tabs-item>
        </nve-tabs>
        <div slot="overview">Overview panel</div>
        <div slot="details">Details panel</div>
      </nve-tabs-group>
      <nve-button command="--toggle" commandfor="tab-group" value="details">Details</nve-button>
      <script type="module">
        import '@nvidia-elements/core/tabs/define.js';
        import '@nvidia-elements/core/button/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(30);
  });
});
