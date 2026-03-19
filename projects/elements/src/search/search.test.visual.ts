// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('search visual', () => {
  test('search should match visual baseline', async () => {
    const report = await visualRunner.render('search', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('search should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('search.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/search/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-search>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="search" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-search>

  <nve-search>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="search" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-search>

  <nve-search>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="search" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-search>

  <nve-search>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="search" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-search>

  <nve-search layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="search" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-search>
  `;
}
