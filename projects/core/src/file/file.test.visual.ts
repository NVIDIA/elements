// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('file visual', () => {
  test('file should match visual baseline', async () => {
    const report = await visualRunner.render('file', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('file should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('file.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/file/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-file>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="file" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-file>

  <nve-file>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="file" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-file>

  <nve-file>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="file" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-file>

  <nve-file>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="file" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-file>

  <nve-file layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="file" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-file>
  `;
}
