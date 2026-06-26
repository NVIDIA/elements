// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('progress-gauge visual', () => {
  test('progress-gauge should match visual baseline', async () => {
    const report = await visualRunner.render('progress-gauge', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('progress-gauge should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('progress-gauge.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/progress-gauge/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    nve-progress-gauge {
      --_animation-duration: 0s;
    }
  </style>

  <div nve-layout="row gap:xs">
    <nve-progress-gauge value="0"></nve-progress-gauge>
    <nve-progress-gauge status="accent" value="25"></nve-progress-gauge>
    <nve-progress-gauge status="success" value="50"></nve-progress-gauge>
    <nve-progress-gauge status="warning" value="75"></nve-progress-gauge>
    <nve-progress-gauge status="danger" value="100"></nve-progress-gauge>
    <nve-progress-gauge status="accent" value="0"></nve-progress-gauge>
  </div>

  <div nve-layout="row gap:xs">
    <nve-progress-gauge value="50" status="accent" size="sm"></nve-progress-gauge>
    <nve-progress-gauge value="50" status="accent" size="md"></nve-progress-gauge>
    <nve-progress-gauge value="50" status="accent" size="lg"></nve-progress-gauge>
  </div>

  <div nve-layout="row gap:xs">
    <nve-progress-gauge value="50" status="accent" size="sm">
      <span>30Hz</span>
    </nve-progress-gauge>
    <nve-progress-gauge value="50" status="accent" size="md">
      <span>12Hz</span>
    </nve-progress-gauge>
    <nve-progress-gauge value="50" status="accent" size="lg">
      <span>84%</span>
    </nve-progress-gauge>
  </div>

  <div nve-layout="row gap:xs">
    <nve-progress-gauge container="half" value="25" status="accent"></nve-progress-gauge>
    <nve-progress-gauge container="half" value="50" status="success"></nve-progress-gauge>
    <nve-progress-gauge container="half" value="75" status="warning">
      <span>75%</span>
    </nve-progress-gauge>
    <nve-progress-gauge container="half" value="100" status="danger">
      <span>100%</span>
    </nve-progress-gauge>
  </div>
  `;
}
