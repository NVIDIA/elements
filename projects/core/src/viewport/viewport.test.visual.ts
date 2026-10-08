// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('viewport visual', () => {
  test('viewport should match visual baseline', async () => {
    const report = await visualRunner.render('viewport', template(''));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('viewport.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport lines should match visual baseline', async () => {
    const report = await visualRunner.render('viewport-lines', template('', 'lines'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport lines should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('viewport-lines.dark', template('dark', 'lines'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport dots should match visual baseline', async () => {
    const report = await visualRunner.render('viewport-dots', template('', 'dots'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport dots should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('viewport-dots.dark', template('dark', 'dots'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport crosses should match visual baseline', async () => {
    const report = await visualRunner.render('viewport-crosses', template('', 'crosses'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport crosses should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('viewport-crosses.dark', template('dark', 'crosses'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});
test('embedded viewport controls should match visual baseline', async () => {
  const report = await visualRunner.render('viewport-controls', controlsTemplate(''), { waitFor: waitForControls });
  expect(report.maxDiffPercentage).toBeLessThan(1);
});

test('embedded viewport controls should match visual baseline dark theme', async () => {
  const report = await visualRunner.render('viewport-controls.dark', controlsTemplate('dark'), {
    waitFor: waitForControls
  });
  expect(report.maxDiffPercentage).toBeLessThan(1);
});

function template(theme: '' | 'dark' = '', pattern?: 'lines' | 'dots' | 'crosses') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/viewport/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <nve-viewport id="visual-viewport" x="40" y="30" scale="1.25" style="width: 500px; height: 320px; border: 1px solid currentColor">
      ${pattern ? `<nve-viewport-gridlines pattern="${pattern}" origin-x="100" origin-y="100"></nve-viewport-gridlines>` : ''}
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
      if (gridlines) await gridlines.updateComplete;
    </script>
  `;
}

async function waitForControls(waitForFunction: (...args: unknown[]) => Promise<unknown>) {
  await waitForFunction(() => document.querySelector('nve-viewport')?.hasAttribute('data-visual-ready'));
}

function controlsTemplate(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/viewport/define.js';
      import '@nvidia-elements/core/toolbar/define.js';
      import '@nvidia-elements/core/button/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>

    <nve-viewport id="viewport-default" autofit fit-inset="24" behavior-pan behavior-zoom style="width: 500px; height: 420px">
      <nve-viewport-gridlines></nve-viewport-gridlines>

      <svg
        role="img"
        aria-label="Three geometric forms in a spatial field"
        width="900"
        height="600"
        viewBox="0 0 900 600"
        style="position: absolute; left: 0; top: 0"
      >
        <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
        <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
        <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
        <rect x="1" y="1" width="898" height="598" rx="24" fill="none" stroke="var(--nve-ref-border-color-emphasis)" stroke-width="2" stroke-dasharray="32 20" vector-effect="non-scaling-stroke"></rect>
      </svg>

      <nve-viewport-minimap></nve-viewport-minimap>
      <nve-toolbar slot="overlay" orientation="vertical" aria-label="Viewport zoom controls"
        style="position: absolute; inset-block-start: var(--nve-ref-space-md); inset-inline-start: var(--nve-ref-space-md); width: fit-content">
        <nve-button commandfor="viewport-default" command="--zoom-in" aria-label="Zoom in">+</nve-button>
        <nve-viewport-zoom-range commandfor="viewport-default" orientation="vertical" aria-label="Viewport zoom"></nve-viewport-zoom-range>
        <nve-button commandfor="viewport-default" command="--zoom-out" aria-label="Zoom out">−</nve-button>
      </nve-toolbar>
    </nve-viewport>

    <script type="module">
      await customElements.whenDefined('nve-viewport-zoom-range');
      const viewport = document.querySelector('nve-viewport');
      const minimap = document.querySelector('nve-viewport-minimap');
      const range = document.querySelector('nve-viewport-zoom-range');
      await viewport.updateComplete;
      await range.updateComplete;
      await minimap.updateComplete;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await minimap.updateComplete;
      viewport.setAttribute('data-visual-ready', '');
    </script>
  `;
}
