// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('media pause button visual', () => {
  test('media pause button should match visual baseline', async () => {
    const report = await visualRunner.render('media-pause-button', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('media pause button should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('media-pause-button.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/media/pause-button/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div nve-layout="row gap:xs">
      <nve-media-pause-button aria-label="pause media"></nve-media-pause-button>
      <nve-media-pause-button aria-label="play media" checked></nve-media-pause-button>
      <nve-media-pause-button aria-label="disabled pause media" disabled></nve-media-pause-button>
    </div>
  `;
}
