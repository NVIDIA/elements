// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('plot visual', () => {
  test('plot should match visual baseline', async () => {
    const report = await visualRunner.render('plot', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('plot should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('plot.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/plot/plot/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-plot></nve-plot>
  `;
}
