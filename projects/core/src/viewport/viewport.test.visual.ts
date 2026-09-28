// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('viewport visual', () => {
  test('viewport should match visual baseline', async () => {
    const report = await visualRunner.render('viewport', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('viewport.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport minimap should match visual baseline', async () => {
    const report = await visualRunner.render('viewport-minimap', minimapTemplate(), { waitFor: waitForMinimap });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport minimap should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('viewport-minimap.dark', minimapTemplate('dark'), {
      waitFor: waitForMinimap
    });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport minimap custom should match visual baseline', async () => {
    const report = await visualRunner.render('viewport-minimap-custom', minimapTemplate('', 'custom'), {
      waitFor: waitForMinimap
    });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport minimap custom should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('viewport-minimap-custom.dark', minimapTemplate('dark', 'custom'), {
      waitFor: waitForMinimap
    });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

async function waitForMinimap(waitForFunction: (...args: unknown[]) => Promise<unknown>) {
  await waitForFunction(() => document.querySelector('nve-viewport-minimap')?.hasAttribute('data-visual-ready'));
}

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/viewport/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <nve-viewport id="visual-viewport" x="40" y="30" scale="1.25" style="width: 500px; height: 320px; border: 1px solid currentColor">
      <nve-viewport-gridlines origin-x="100" origin-y="100"></nve-viewport-gridlines>
      <svg aria-hidden="true" width="240" height="180" viewBox="0 0 240 180" style="position: absolute">
        <circle cx="100" cy="100" r="6" fill="var(--nve-sys-accent-primary-background)"></circle>
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

function minimapTemplate(theme: '' | 'dark' = '', preview: 'automatic' | 'custom' = 'automatic') {
  const content =
    preview === 'custom'
      ? /* html */ `<svg width="900" height="600" viewBox="0 0 900 600" style="position: absolute; left: 0; top: 0">
          <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
          <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
          <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
          <rect x="1" y="1" width="898" height="598" rx="24" fill="none" stroke="var(--nve-ref-border-color-emphasis)" stroke-width="2" stroke-dasharray="32 20" vector-effect="non-scaling-stroke"></rect>
        </svg>`
      : /* html */ `<svg width="200" height="200" viewBox="0 0 200 200" style="position: absolute; left: 100px; top: 300px">
          <circle cx="100" cy="100" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
        </svg>
        <svg width="200" height="200" viewBox="0 0 200 200" style="position: absolute; left: 350px; top: 100px">
          <rect width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
        </svg>
        <svg width="220" height="220" viewBox="0 0 220 220" style="position: absolute; left: 590px; top: 290px">
          <path d="M 110 0 L 220 110 L 110 220 L 0 110 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
        </svg>`;
  const customPreview =
    preview === 'custom'
      ? /* html */ `<svg slot="preview" width="900" height="600" viewBox="0 0 900 600" style="position: absolute; left: 0; top: 0">
          <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
          <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
          <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
        </svg>`
      : '';
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/viewport/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <nve-viewport id="visual-minimap-viewport" behavior-pan x="40" y="30" style="width: 500px; height: 320px; border: 1px solid currentColor">
      <nve-viewport-gridlines></nve-viewport-gridlines>
      ${content}
      <nve-viewport-minimap id="visual-minimap">
        ${customPreview}
      </nve-viewport-minimap>
    </nve-viewport>
    <script type="module">
      await customElements.whenDefined('nve-viewport-minimap');
      const minimap = document.querySelector('#visual-minimap');
      await minimap.updateComplete;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await minimap.updateComplete;
      await new Promise(resolve => requestAnimationFrame(resolve));
      minimap.setAttribute('data-visual-ready', '');
    </script>
  `;
}
