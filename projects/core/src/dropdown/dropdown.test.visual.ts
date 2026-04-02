// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('dropdown visual', () => {
  test('dropdown should match visual baseline', async () => {
    const report = await visualRunner.render('dropdown', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('dropdown should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('dropdown.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/button/define.js';
    import '@nvidia-elements/core/dropdown/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <style>
    body {
      min-width: 1024px;
      min-height: 780px;
    }
  </style>

  <div><nve-button id="btn">•︎•︎•</nve-button></div>
  <nve-dropdown anchor="btn" closable style="--min-width: 250px">
    <nve-dropdown-header>
      •︎•︎••︎•︎••︎•︎•
    </nve-dropdown-header>
    •︎•︎••︎•︎••︎•︎•
    <nve-dropdown-footer>
      •︎•︎•︎•︎•︎••︎•︎•
    </nve-dropdown-footer>
  </nve-dropdown>
  `;
}
