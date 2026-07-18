// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('media seek button visual', () => {
  test('media seek button should match visual baseline', async () => {
    const report = await visualRunner.render('media-seek-button', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('media seek button should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('media-seek-button.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/media/seek-button/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div nve-layout="row gap:xs">
      <nve-media-seek-button action="start" aria-label="seek to start"></nve-media-seek-button>
      <nve-media-seek-button action="backward" aria-label="seek backward"></nve-media-seek-button>
      <nve-media-seek-button action="forward" aria-label="seek forward"></nve-media-seek-button>
      <nve-media-seek-button action="end" aria-label="seek to end"></nve-media-seek-button>
    </div>
  `;
}
