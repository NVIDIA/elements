// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('toast visual', () => {
  test('toast should match visual baseline', async () => {
    const report = await visualRunner.render('toast', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('toast should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('toast.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('should position correctly with body anchor', async () => {
    const report = await visualRunner.render('toast.body-anchor', bodyAnchorTemplate());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/toast/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-toast anchor="btn" position="top">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast anchor="btn" status="success" position="right">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast anchor="btn" status="warning" position="bottom">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast anchor="btn" status="danger" position="left">•︎•︎•︎•︎•︎•︎</nve-toast>
  <div nve-layout="row align:center" style="height: 400px; width: 100%;">
    <nve-button id="btn">•︎•︎•︎•︎•︎•︎</nve-button>
  </div>
  `;
}

function bodyAnchorTemplate() {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/toast/define.js';
  </script>
  <style>
    body {
      height: 920px;
      width: 1200px;
    }
  </style>
  <nve-toast style="--background: red" position="center" alignment="center">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast style="--background: blue" position="top" alignment="start">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast style="--background: yellow" position="top">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast style="--background: green" position="top" alignment="end">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast style="--background: purple" position="bottom" alignment="start">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast style="--background: orange" position="bottom">•︎︎•︎•︎•︎•︎</nve-toast>
  <nve-toast style="--background: pink" position="bottom" alignment="end">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast style="--background: brown; margin-left: 150px" position="left" alignment="start">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast style="--background: gray;" position="left">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast style="--background: black; margin-left: 150px" position="left" alignment="end">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast style="--background: red; margin-right: 150px" position="right" alignment="start">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast style="--background: blue" position="right">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast style="--background: yellow; margin-right: 150px" position="right" alignment="end">•︎•︎•︎•︎•︎•︎</nve-toast>
  `;
}
