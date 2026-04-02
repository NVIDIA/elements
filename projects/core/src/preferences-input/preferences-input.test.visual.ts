// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('preferences input visual', () => {
  test('preferences input should match visual baseline', async () => {
    const report = await visualRunner.render('preferences-input', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('preferences input should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('preferences-input.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/preferences-input/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    :root {
     --nve-config-color-scheme-light: true;
     --nve-config-color-scheme-dark: true;
     --nve-config-color-scheme-high-contrast: true;
     --nve-config-scale-compact: true;
     --nve-config-reduced-motion: true;
    }
  </style>
  <div nve-layout="row gap:xs">
    <nve-preferences-input></nve-preferences-input>
  </div>
  `;
}
