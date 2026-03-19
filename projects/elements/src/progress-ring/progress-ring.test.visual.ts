// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('progress-ring visual', () => {
  test('progress-ring should match visual baseline', async () => {
    const report = await visualRunner.render('progress-ring', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('progress-ring should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('progress-ring.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/icon/define.js';
    import '@nvidia-elements/core/progress-ring/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="row gap:xs">
    <nve-progress-ring value="0"></nve-progress-ring>
    <nve-progress-ring status="accent" value="25"></nve-progress-ring>
    <nve-progress-ring status="success" value="50"></nve-progress-ring>
    <nve-progress-ring status="warning" value="75"></nve-progress-ring>
    <nve-progress-ring status="danger" value="100"></nve-progress-ring>
  </div>

  <div nve-layout="row gap:xs">
    <nve-progress-ring value="50" status="accent" size="xxs"></nve-progress-ring>
    <nve-progress-ring value="50" status="accent" size="xs"></nve-progress-ring>
    <nve-progress-ring value="50" status="accent" size="sm"></nve-progress-ring>
    <nve-progress-ring value="50" status="accent" size="md"></nve-progress-ring>
    <nve-progress-ring value="50" status="accent" size="lg"></nve-progress-ring>
    <nve-progress-ring value="50" status="accent" size="xl"></nve-progress-ring>
  </div>

  <div nve-layout="row gap:xs">
    <nve-progress-ring value="50" status="accent" size="xxs">
      <nve-icon name="pause" status="accent"></nve-icon>
    </nve-progress-ring>
    <nve-progress-ring value="50" status="accent" size="xs">
      <nve-icon name="pause" status="accent"></nve-icon>
    </nve-progress-ring>
    <nve-progress-ring value="50" status="accent" size="sm">
      <nve-icon name="pause" status="accent"></nve-icon>
    </nve-progress-ring>
    <nve-progress-ring value="50" status="accent" size="md">
      <nve-icon name="pause" status="accent"></nve-icon>
    </nve-progress-ring>
    <nve-progress-ring value="50" status="accent" size="lg">
      <nve-icon name="pause" status="accent"></nve-icon>
    </nve-progress-ring>
    <nve-progress-ring value="50" status="accent" size="xl">
      <nve-icon name="pause" status="accent"></nve-icon>
    </nve-progress-ring>
  </div>
  `;
}
