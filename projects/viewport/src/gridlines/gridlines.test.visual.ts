// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('gridlines visual', () => {
  test('gridlines should match visual baseline', async () => {
    const report = await visualRunner.render('gridlines', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('gridlines should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('gridlines.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('gridlines dots should match visual baseline', async () => {
    const report = await visualRunner.render('gridlines-dots', template('', 'dots'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('gridlines dots should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('gridlines-dots.dark', template('dark', 'dots'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('gridlines crosses should match visual baseline', async () => {
    const report = await visualRunner.render('gridlines-crosses', template('', 'crosses'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('gridlines crosses should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('gridlines-crosses.dark', template('dark', 'crosses'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '', pattern: 'lines' | 'dots' | 'crosses' = 'lines') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/viewport/viewport/define.js';
      import '@nvidia-elements/viewport/gridlines/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <nve-viewport id="visual-viewport" x="40" y="30" scale="1.25" style="width: 500px; height: 320px; border: 1px solid currentColor">
      <nve-viewport-gridlines pattern="${pattern}" origin-x="100" origin-y="100"></nve-viewport-gridlines>
      <svg aria-hidden="true" width="240" height="180" viewBox="0 0 240 180" style="position: absolute">
        <circle cx="85" cy="125" r="24" fill="var(--nve-sys-accent-primary-background)"></circle>
      </svg>
      <div style="position: absolute; left: 120px; top: 90px; padding: 24px; background: var(--nve-sys-layer-container-background)">•︎•︎•︎•︎•︎</div>
      <div style="position: absolute; left: 380px; top: 220px; padding: 16px; background: var(--nve-sys-layer-container-background)">•︎•︎•︎</div>
    </nve-viewport>
    <script type="module">
      const viewport = document.querySelector('#visual-viewport');
      const gridlines = viewport.querySelector('nve-viewport-gridlines');
      await viewport.updateComplete;
      viewport.x = 55;
      viewport.y = 45;
      viewport.scale = 2;
      await viewport.updateComplete;
      await gridlines.updateComplete;
    </script>
  `;
}
