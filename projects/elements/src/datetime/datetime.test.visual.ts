// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('datetime visual', () => {
  test('datetime should match visual baseline', async () => {
    const report = await visualRunner.render('datetime', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('datetime should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('datetime.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/datetime/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    nve-datetime {
      --color: transparent;
    }
  </style>

  <nve-datetime>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="datetime-local" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-datetime>

  <nve-datetime>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="datetime-local" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-datetime>

  <nve-datetime>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="datetime-local" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-datetime>

  <nve-datetime>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="datetime-local" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-datetime>

  <nve-datetime layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="datetime-local" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-datetime>
  `;
}
