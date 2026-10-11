// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('foundations visual', () => {
  test('foundations should match visual baseline', async () => {
    const report = await visualRunner.render('foundations', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('foundations should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('foundations.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/foundations/foundations/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-foundations><p nve-text="body">Container content</p></nve-foundations>
  `;
}
