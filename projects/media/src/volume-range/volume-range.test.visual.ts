// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('media volume range visual', () => {
  test('media volume range should match visual baseline', async () => {
    const report = await visualRunner.render('media-volume-range', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('media volume range should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('media-volume-range.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/media/volume-range/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div style="inline-size: 320px">
      <nve-media-volume-range aria-label="volume" value="0.5"></nve-media-volume-range>
      <nve-media-volume-range aria-label="disabled volume" disabled></nve-media-volume-range>
    </div>
  `;
}
