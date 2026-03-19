// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('input visual', () => {
  test('input should match visual baseline', async () => {
    const report = await visualRunner.render('input', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('input should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('input.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/input/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-input>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="input" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-input>

  <nve-input>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="input" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-input>

  <nve-input>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="input" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-input>

  <nve-input>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="input" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-input>

  <nve-input layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="input" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-input>

  <nve-input-group>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-input>
      <input type="input" aria-label="start input" />
    </nve-input>
    <nve-input>
      <input type="input" aria-label="end input" />
    </nve-input>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-input-group>
  `;
}
