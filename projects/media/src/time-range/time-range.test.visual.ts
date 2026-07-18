// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('media time range visual', () => {
  test('media time range should match visual baseline', async () => {
    const report = await visualRunner.render('media-time-range', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('media time range should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('media-time-range.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/media/time-range/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div style="inline-size: 320px">
      <nve-media-time-range aria-label="current time" min="0" max="100" value="50"></nve-media-time-range>
      <nve-media-time-range aria-label="ended current time" min="0" max="100.05" value="100.05"></nve-media-time-range>
      <nve-media-time-range aria-label="disabled current time" disabled></nve-media-time-range>
    </div>
  `;
}
