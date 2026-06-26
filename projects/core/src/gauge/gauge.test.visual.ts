// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('gauge visual', () => {
  test('gauge should match visual baseline', async () => {
    const report = await visualRunner.render('gauge', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('gauge should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('gauge.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/gauge/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    nve-gauge {
      --_animation-duration: 0s;
    }
  </style>

  <div nve-layout="row gap:xs">
    <nve-gauge value="0"></nve-gauge>
    <nve-gauge value="10"></nve-gauge>
    <nve-gauge status="accent" value="25"></nve-gauge>
    <nve-gauge status="success" value="50"></nve-gauge>
    <nve-gauge status="warning" value="75"></nve-gauge>
    <nve-gauge status="danger" value="100"></nve-gauge>
    <nve-gauge status="accent" value="0"></nve-gauge>
  </div>

  <div nve-layout="row gap:xs">
    <nve-gauge thumb="dot" value="82" style="
      --background: conic-gradient(
        from 225deg at 50% 50%,
        var(--nve-sys-support-success-emphasis-color) 0deg 18deg,
        var(--nve-sys-support-warning-emphasis-color) 135deg,
        var(--nve-sys-support-danger-emphasis-color) 252deg 300deg,
        var(--nve-sys-support-success-emphasis-color) 300deg 360deg
      );
      --thumb-background: var(--color);
    ">
      <span>82&deg;C</span>
    </nve-gauge>
  </div>

  <div nve-layout="row gap:xs">
    <nve-gauge thumb="fill" value="66" status="accent">
      <span>fill</span>
    </nve-gauge>
    <nve-gauge thumb="dot" value="66" status="accent">
      <span>dot</span>
    </nve-gauge>
    <nve-gauge thumb="needle" value="66" status="accent">
      <span>needle</span>
    </nve-gauge>
  </div>

  <div nve-layout="row gap:xs">
    <nve-gauge value="50" status="accent" size="sm"></nve-gauge>
    <nve-gauge value="50" status="accent" size="md"></nve-gauge>
    <nve-gauge value="50" status="accent" size="lg"></nve-gauge>
  </div>

  <div nve-layout="row gap:xs">
    <nve-gauge value="50" status="accent" size="sm">
      <span>30Hz</span>
    </nve-gauge>
    <nve-gauge value="50" status="accent" size="md">
      <span>12Hz</span>
    </nve-gauge>
    <nve-gauge value="50" status="accent" size="lg">
      <span>84%</span>
    </nve-gauge>
  </div>

  <div nve-layout="row gap:xs">
    <nve-gauge shape="half" value="25" status="accent"></nve-gauge>
    <nve-gauge shape="half" value="50" status="success"></nve-gauge>
    <nve-gauge shape="half" value="75" status="warning">
      <span>75%</span>
    </nve-gauge>
    <nve-gauge shape="half" value="100" status="danger">
      <span>100%</span>
    </nve-gauge>
  </div>
  `;
}
