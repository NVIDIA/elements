// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('meter visual', () => {
  it.each(['', 'dark'] as const)('should match the %s theme baseline', async theme => {
    const report = await visualRunner.render(
      `meter${theme ? '.dark' : ''}`,
      /* html */ `
      <script type="module">
        import '@nvidia-elements/core/meter/define.js';
        document.documentElement.setAttribute('nve-theme', '${theme}');
      </script>
      <div nve-layout="column gap:md" style="width: 640px">
      <nve-meter aria-label="Empty" value="0"></nve-meter>
      <nve-meter aria-label="Accent" value="25" status="accent"></nve-meter>
      <nve-meter aria-label="Success" value="50" status="success"></nve-meter>
      <nve-meter aria-label="Warning" value="75" status="warning"></nve-meter>
      <nve-meter aria-label="Full" value="100" status="danger"></nve-meter>
      <nve-meter aria-label="Palette" value="50" color="blue-cobalt" status="danger"></nve-meter>
      <nve-meter aria-label="Custom" value="50" style="--height: 12px; --accent-color: rebeccapurple; --background: lightgray"></nve-meter>
      <nve-meter aria-label="RTL" value="25" dir="rtl"></nve-meter>
    </div>
    `
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});
