// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('date visual', () => {
  test('date should match visual baseline', async () => {
    const report = await visualRunner.render('date', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('date should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('date.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/date/define.js';
    import '@nvidia-elements/core/input/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    nve-date {
      --color: transparent;
    }
  </style>

  <nve-date>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="date" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-date>

  <nve-date>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="date" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-date>

  <nve-date>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="date" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-date>

  <nve-date>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="date" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-date>

  <nve-date layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="date" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-date>

  <nve-input-group>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-date>
      <input type="date" aria-label="start date" value="2018-07-22" />
    </nve-date>
    <nve-date>
      <input type="date" aria-label="end date" value="2022-07-22" />
    </nve-date>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-input-group>
  `;
}
