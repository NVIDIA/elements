// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('progress-bar visual', () => {
  test('progress-bar should match visual baseline', async () => {
    const report = await visualRunner.render('progress-bar', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('progress-bar should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('progress-bar.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/progress-bar/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-progress-bar value="0"></nve-progress-bar>

  <nve-progress-bar status="accent" value="25"></nve-progress-bar>

  <nve-progress-bar status="success" value="50"></nve-progress-bar>

  <nve-progress-bar status="warning" value="75"></nve-progress-bar>

  <nve-progress-bar status="danger" value="100"></nve-progress-bar>

  <nve-progress-bar style="--height: 6px"></nve-progress-bar>
  `;
}
