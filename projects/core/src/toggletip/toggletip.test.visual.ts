// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('toggletip visual', () => {
  test('toggletip should match visual baseline', async () => {
    const report = await visualRunner.render('toggletip', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('toggletip should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('toggletip.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
  test('toggletip should match visual baseline in RTL', async () => {
    const report = await visualRunner.render('toggletip.rtl', template('', 'rtl'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('toggletip should match visual baseline in RTL dark theme', async () => {
    const report = await visualRunner.render('toggletip.rtl.dark', template('dark', 'rtl'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '', direction: 'ltr' | 'rtl' = 'ltr') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/button/define.js';
    import '@nvidia-elements/core/card/define.js';
    import '@nvidia-elements/core/toggletip/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
    document.documentElement.dir = '${direction}';
  </script>

  <style>
    body { gap: 64px; width: 1180px; margin: 0; padding: 16px; }
  </style>
  <div nve-layout="row align:horizontal-center align:bottom" style="height: 200px">
    <nve-toggletip anchor="btn" closable style="--min-width: 250px">
      <nve-toggletip-header>
        <h3 nve-text="heading sm">•︎•︎•︎•︎•︎•︎</h3>
      </nve-toggletip-header>
        <p nve-text="body">•︎•︎•︎•︎•︎•︎</p>
      <nve-toggletip-footer>
        <p nve-text="body">•︎•︎•︎•︎•︎•︎</p>
      </nve-toggletip-footer>
    </nve-toggletip>
    <nve-button id="btn">•︎•︎•︎•︎•︎•︎</nve-button>
  </div>

  <div nve-layout="row align:center" style="height: 280px; padding-block: 40px">
    <nve-toggletip anchor="card" position="top" alignment="start">•︎•︎•︎</nve-toggletip>
    <nve-toggletip anchor="card" position="top">•︎•︎•︎•︎•︎•︎</nve-toggletip>
    <nve-toggletip anchor="card" position="top" alignment="end">•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-toggletip>

    <nve-toggletip anchor="card" position="right" alignment="start">•︎•︎•︎</nve-toggletip>
    <nve-toggletip anchor="card" position="right">•︎•︎•︎•︎•︎•︎</nve-toggletip>
    <nve-toggletip anchor="card" position="right" alignment="end">•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-toggletip>

    <nve-toggletip anchor="card" position="bottom" alignment="start">•︎•︎•︎</nve-toggletip>
    <nve-toggletip anchor="card" position="bottom">•︎•︎•︎•︎•︎•︎</nve-toggletip>
    <nve-toggletip anchor="card" position="bottom" alignment="end">•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-toggletip>

    <nve-toggletip anchor="card" position="left" alignment="start">•︎•︎•︎</nve-toggletip>
    <nve-toggletip anchor="card" position="left">•︎•︎•︎•︎•︎•︎</nve-toggletip>
    <nve-toggletip anchor="card" position="left" alignment="end">•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-toggletip>

    <nve-card id="card" style="width: 400px; height: 200px"></nve-card>
  </div>

  <div nve-layout="row align:horizontal-center align:bottom" style="height: 72px; width: calc(100% - 240px); margin-inline: auto">
    <nve-toggletip alignment="start" anchor="btn1">•︎•︎•︎</nve-toggletip>
    <nve-button id="btn1" style="margin-inline-end: auto">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-toggletip anchor="btn2">•︎•︎•︎•︎•︎•︎</nve-toggletip>
    <nve-button id="btn2">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-toggletip alignment="end" anchor="btn3">•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-toggletip>
    <nve-button id="btn3" style="margin-inline-start: auto">•︎•︎•︎•︎•︎•︎</nve-button>
  </div>
  `;
}
