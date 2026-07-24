// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('media mute button visual', () => {
  test('media mute button should match visual baseline', async () => {
    const report = await visualRunner.render('media-mute-button', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('media mute button should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('media-mute-button.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/media/mute-button/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div nve-layout="row gap:xs">
      <nve-media-mute-button aria-label="mute media"></nve-media-mute-button>
      <nve-media-mute-button aria-label="unmute media" checked></nve-media-mute-button>
      <nve-media-mute-button aria-label="disabled mute media" disabled></nve-media-mute-button>
    </div>
  `;
}
