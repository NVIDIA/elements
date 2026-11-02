// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('virtual list lighthouse report', () => {
  test('meets standalone budgets', async () => {
    const report = await lighthouseRunner.getReport('nve-virtual-list', `
      <nve-virtual-list item-count="10000" item-height="40" style="--scroll-height:200px"></nve-virtual-list>
      <script type="module">
        import '@nvidia-elements/foundations/virtual-list/define.js';
        const list = document.querySelector('nve-virtual-list');
        list.addEventListener('virtual-change', ({detail}) => {
          list.replaceChildren(...Array.from({length: detail.end - detail.start}, (_, i) => {
            const row = document.createElement('div'); row.style.height = '40px'; row.textContent = 'Activity ' + (detail.start+i); return row;
          }));
        });
      </script>`);
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(15);
  });
});
