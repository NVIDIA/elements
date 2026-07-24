// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('media fullscreen button visual', () => {
  test('media fullscreen button should match visual baseline', async () => {
    const report = await visualRunner.render('media-fullscreen-button', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('media fullscreen button should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('media-fullscreen-button.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/media/fullscreen-button/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div nve-layout="row gap:xs">
      <nve-media-fullscreen-button aria-label="enter full screen"></nve-media-fullscreen-button>
      <nve-media-fullscreen-button aria-label="exit full screen" pressed></nve-media-fullscreen-button>
      <nve-media-fullscreen-button aria-label="disabled full screen" disabled></nve-media-fullscreen-button>
    </div>
  `;
}
