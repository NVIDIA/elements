// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('format-bytes visual', () => {
  test('format-bytes should match visual baseline', async () => {
    const report = await visualRunner.render('format-bytes', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('format-bytes should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('format-bytes.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/format-bytes/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <div nve-layout="column gap:sm">
    <nve-format-bytes locale="en-US">1024</nve-format-bytes>
    <nve-format-bytes locale="en-US">1048576</nve-format-bytes>
    <nve-format-bytes locale="en-US" display="binary">1048576</nve-format-bytes>
    <nve-format-bytes locale="en-US" unit-display="long">1048576</nve-format-bytes>
    <nve-format-bytes locale="de-DE">1048576</nve-format-bytes>
  </div>
  `;
}
