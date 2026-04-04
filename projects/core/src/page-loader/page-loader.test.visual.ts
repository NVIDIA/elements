// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('page-loader visual', () => {
  test('page-loader should match visual baseline', async () => {
    const report = await visualRunner.render('page-loader', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('page-loader should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('page-loader.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/page-loader/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    body {
      width: 1180px;
      height: 820px;
    }
  </style>

  <nve-page-loader></nve-page-loader>
  `;
}
