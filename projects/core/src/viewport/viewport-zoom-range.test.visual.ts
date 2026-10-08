// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('viewport zoom range visual', () => {
  test('viewport zoom range should match visual baseline', async () => {
    const report = await visualRunner.render('viewport-zoom-range', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('viewport zoom range should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('viewport-zoom-range.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
  test('vertical viewport zoom range should match visual baseline', async () => {
    const report = await visualRunner.render('viewport-zoom-range-vertical', template('', 'vertical'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('vertical viewport zoom range should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('viewport-zoom-range-vertical.dark', template('dark', 'vertical'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '', orientation: 'horizontal' | 'vertical' = 'horizontal') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/viewport/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div style="inline-size: 320px">
      <div hidden><nve-viewport id="target" behavior-zoom min-scale="0.25" max-scale="4"></nve-viewport></div>
      <nve-viewport-zoom-range commandfor="target" orientation="${orientation}" aria-label="zoom" value="1"></nve-viewport-zoom-range>
      <nve-viewport-zoom-range commandfor="target" orientation="${orientation}" aria-label="filled zoom with outlined thumb"
        style="--background: var(--nve-sys-interaction-color);
          --thumb-background: var(--nve-sys-layer-canvas-background);
          --thumb-border: 2px solid var(--nve-sys-interaction-color)"></nve-viewport-zoom-range>
      <nve-viewport-zoom-range orientation="${orientation}" aria-label="disabled zoom" disabled></nve-viewport-zoom-range>
    </div>
  `;
}
