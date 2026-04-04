// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('combobox lighthouse report', () => {
  test('combobox should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-combobox', /* html */`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
          <option value="Option 3"></option>
        </datalist>
        <nve-control-message>message</nve-control-message>
      </nve-combobox>
      <script type="module">
        import '@nvidia-elements/core/combobox/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(36);
  });

  test('combobox multi select with large dataset should meet lighthouse benchmarks', async () => {
    const options = new Array(1000).fill('').map((_, i) => `<option value="${i} item"></option>`).join('');
    const report = await lighthouseRunner.getReport('nve-combobox-performance', /* html */`
      <nve-combobox>
        <input type="search" aria-label="performance test" />
        <select multiple>${options}</select>
      </nve-combobox>
      <script type="module">
        import '@nvidia-elements/core/combobox/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(96);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(36);
  });
});
