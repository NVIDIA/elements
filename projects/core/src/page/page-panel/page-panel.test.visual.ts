// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('page-panel visual', () => {
  test('page-panel should match visual baseline', async () => {
    const report = await visualRunner.render('page-panel', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('page-panel should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('page-panel.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/page/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    body {
      padding: 0 !important;
      width: 1024px;
      height: 780px;
    }
    
  </style>
  <section nve-layout="row gap:lg align:vertical-stretch" style="height: 100vh">
    <nve-page-panel>
      <nve-page-panel-header>•︎•︎•︎•︎•︎•︎</nve-page-panel-header>
      <nve-page-panel-content>•︎•︎•︎•︎•︎•︎</nve-page-panel-content>
      <nve-page-panel-footer>•︎•︎•︎•︎•︎•︎</nve-page-panel-footer>
    </nve-page-panel>
    <nve-page-panel closable>
      <nve-page-panel-header>•︎•︎•︎•︎•︎•︎</nve-page-panel-header>
      <nve-page-panel-content>•︎•︎•︎•︎•︎•︎</nve-page-panel-content>
      <nve-page-panel-footer>•︎•︎•︎•︎•︎•︎</nve-page-panel-footer>
    </nve-page-panel>
    <nve-page-panel expandable>
      <nve-page-panel-header>•︎•︎•︎•︎•︎•︎</nve-page-panel-header>
      <nve-page-panel-content>•︎•︎•︎•︎•︎•︎</nve-page-panel-content>
      <nve-page-panel-footer>•︎•︎•︎•︎•︎•︎</nve-page-panel-footer>
    </nve-page-panel>
  </section>
  `;
}
