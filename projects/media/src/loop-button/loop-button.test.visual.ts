// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('media loop button visual', () => {
  test('media loop button should match visual baseline', async () => {
    const report = await visualRunner.render('media-loop-button', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('media loop button should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('media-loop-button.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/media/loop-button/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div nve-layout="row gap:xs">
      <nve-media-loop-button aria-label="enable looping"></nve-media-loop-button>
      <nve-media-loop-button aria-label="disable looping" pressed></nve-media-loop-button>
      <nve-media-loop-button aria-label="disabled looping" disabled></nve-media-loop-button>
    </div>
  `;
}
