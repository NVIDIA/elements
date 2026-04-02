// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('radio visual', () => {
  test('radio should match visual baseline', async () => {
    const report = await visualRunner.render('radio', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('radio should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('radio.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <style>
    body {
      min-width: 720px;
    }
  </style>
  <script type="module">
    import '@nvidia-elements/core/radio/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <!-- states -->
  <nve-radio>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="radio" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-radio>

  <nve-radio>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="radio" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-radio>

  <nve-radio>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="radio" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-radio>

  <nve-radio>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="radio" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-radio>

  <!-- vertical group -->
  <nve-radio-group>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-radio>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-radio-group>

  <!-- vertical inline group -->
  <nve-radio-group layout="vertical-inline">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-radio>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-radio-group>

  <!-- horizontal group -->
  <nve-radio-group layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-radio>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-radio-group>

  <!-- horizontal inline group -->
  <nve-radio-group layout="horizontal-inline">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-radio>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-radio-group>

  <!-- indeterminate -->
  <nve-radio>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="radio" checked id="indeterminate" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-radio>
  <script type="module">
    document.querySelector('#indeterminate').indeterminate = true;
  </script>
  `;
}
