// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { lighthouseRunner } from '@internals/vite';

describe('dashboard lighthouse', () => {
  it('meets performance, accessibility, and best-practice scores with supplied content and arrangement controls', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-dashboard',
      /* html */ `
        <nve-dashboard fullscreenable rearrangeable style="height:320px"
          value='{"version":1,"grid":{"flow":"vertical","tracks":4},"items":[{"id":"notes","column":0,"row":0,"columnSpan":2,"rowSpan":2},{"id":"summary","column":2,"row":0,"columnSpan":2,"rowSpan":2}]}'>
          <nve-dashboard-panel id="notes">
            <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
            <nve-dashboard-panel-content>
              <textarea aria-label="Investigation notes">Inspect regression</textarea>
            </nve-dashboard-panel-content>
            <nve-dashboard-panel-footer>Pending review</nve-dashboard-panel-footer>
          </nve-dashboard-panel>
          <nve-dashboard-panel id="summary">
            <nve-dashboard-panel-header>Summary</nve-dashboard-panel-header>
            <nve-dashboard-panel-content>Twelve cases need review.</nve-dashboard-panel-content>
          </nve-dashboard-panel>
        </nve-dashboard>
        <script type="module">
          import '@nvidia-elements/core/dashboard/define.js';
        </script>
      `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThanOrEqual(46.7);
  });
});
