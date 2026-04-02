// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('checkbox visual', () => {
  test('checkbox should match visual baseline', async () => {
    const report = await visualRunner.render('checkbox', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('checkbox should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('checkbox.dark', template('dark'));
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
    import '@nvidia-elements/core/checkbox/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <!-- states -->
  <nve-checkbox>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="checkbox" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-checkbox>

  <nve-checkbox>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="checkbox" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-checkbox>

  <nve-checkbox>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="checkbox" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-checkbox>

  <nve-checkbox>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="checkbox" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-checkbox>

  <!-- vertical group -->
  <nve-checkbox-group>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-checkbox>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-checkbox-group>

  <!-- vertical inline group -->
  <nve-checkbox-group layout="vertical-inline">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-checkbox>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-checkbox-group>

  <!-- horizontal group -->
  <nve-checkbox-group layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-checkbox>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-checkbox-group>

  <!-- horizontal inline group -->
  <nve-checkbox-group layout="horizontal-inline">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-checkbox>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-checkbox-group>

  <!-- indeterminate -->
  <nve-checkbox>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="checkbox" checked id="indeterminate" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-checkbox>
  <script type="module">
    document.querySelector('#indeterminate').indeterminate = true;
  </script>
  `;
}
