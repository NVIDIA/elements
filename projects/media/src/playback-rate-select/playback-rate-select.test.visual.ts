// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('media playback rate select visual', () => {
  test('media playback rate select should match visual baseline', async () => {
    const report = await visualRunner.render('media-playback-rate-select', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('media playback rate select should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('media-playback-rate-select.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/media/playback-rate-select/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div style="inline-size: 360px">
      <nve-media-playback-rate-select aria-label="playback rate" value="1"></nve-media-playback-rate-select>
      <nve-media-playback-rate-select aria-label="disabled playback rate" disabled></nve-media-playback-rate-select>
    </div>
  `;
}
