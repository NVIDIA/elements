// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('combobox visual', () => {
  test('combobox should match visual baseline', async () => {
    const report = await visualRunner.render('combobox', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('combobox should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('combobox.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/combobox/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-combobox>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="search" />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-combobox>

  <nve-combobox>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="search" disabled />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-combobox>

  <nve-combobox>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="search" />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-combobox>

  <nve-combobox>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="search" />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-combobox>

  <nve-combobox layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="search" />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-combobox>

  <nve-combobox container="flat">
    <nve-icon name="filter" slot="prefix-icon"></nve-icon>
    <input type="search" aria-label="filter">
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
  </nve-combobox>
  `;
}
