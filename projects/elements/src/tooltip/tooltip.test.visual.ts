// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('tooltip visual', () => {
  test('tooltip should match visual baseline', async () => {
    const report = await visualRunner.render('tooltip', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('tooltip should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('tooltip.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/button/define.js';
    import '@nvidia-elements/core/card/define.js';
    import '@nvidia-elements/core/tooltip/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="row align:center" style="height: 200px">
    <nve-tooltip anchor="btn" closable>
      •︎•︎•︎•︎•︎•︎
    </nve-tooltip>
    <nve-button id="btn">•︎•︎•︎•︎•︎•︎</nve-button>
  </div>

  <div nve-layout="row align:center" style="width: 100vw; height: 300px">
    <nve-tooltip anchor="card" position="top" alignment="start">•︎•︎•︎•︎•︎•︎</nve-tooltip>
    <nve-tooltip anchor="card" position="top">•︎•︎•︎•︎•︎•︎</nve-tooltip>
    <nve-tooltip anchor="card" position="top" alignment="end">•︎•︎•︎•︎•︎•︎</nve-tooltip>

    <nve-tooltip anchor="card" position="right" alignment="start">•︎•︎•︎•︎•︎•︎</nve-tooltip>
    <nve-tooltip anchor="card" position="right">•︎•︎•︎•︎•︎•︎</nve-tooltip>
    <nve-tooltip anchor="card" position="right" alignment="end">•︎•︎•︎•︎•︎•︎</nve-tooltip>

    <nve-tooltip anchor="card" position="bottom" alignment="start">•︎•︎•︎•︎•︎•︎</nve-tooltip>
    <nve-tooltip anchor="card" position="bottom">•︎•︎•︎•︎•︎•︎</nve-tooltip>
    <nve-tooltip anchor="card" position="bottom" alignment="end">•︎•︎•︎•︎•︎•︎</nve-tooltip>

    <nve-tooltip anchor="card" position="left" alignment="start">•︎•︎•︎•︎•︎•︎</nve-tooltip>
    <nve-tooltip anchor="card" position="left">•︎•︎•︎•︎•︎•︎</nve-tooltip>
    <nve-tooltip anchor="card" position="left" alignment="end">•︎•︎•︎•︎•︎•︎</nve-tooltip>

    <nve-card id="card" style="width: 400px; height: 200px"></nve-card>
  </div>

  <div nve-layout="row align:center" style="width: 100vw; height: 200px">
    <nve-tooltip alignment="start" anchor="btn1">•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-tooltip>
    <nve-button id="btn1" style="margin-right: auto">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-tooltip anchor="btn2">•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-tooltip>
    <nve-button id="btn2">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-tooltip alignment="end" anchor="btn3">•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-tooltip>
    <nve-button id="btn3" style="margin-left: auto">•︎•︎•︎•︎•︎•︎</nve-button>
  </div>
  `;
}
