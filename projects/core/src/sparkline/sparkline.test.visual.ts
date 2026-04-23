// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('sparkline visual', () => {
  test('matches visual baseline', async () => {
    const report = await visualRunner.render('sparkline', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('matches visual baseline in dark theme', async () => {
    const report = await visualRunner.render('sparkline.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/sparkline/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="column gap:sm" style="padding: 16px;">
    <!-- Mark -->
    <div nve-layout="row gap:md align:wrap">
      <nve-sparkline data="[14, 18, 17, 20, 19, 24, 21]"></nve-sparkline>
      <nve-sparkline mark="area" data="[14, 18, 17, 20, 19, 24, 21]"></nve-sparkline>
      <nve-sparkline mark="gradient" data="[14, 18, 17, 20, 19, 24, 21]"></nve-sparkline>
      <nve-sparkline mark="column" data="[6, 10, 8, 16, 13, 18, 15]"></nve-sparkline>
      <nve-sparkline mark="winloss" data="[5, -3, 2, -1, 4, 0, 3]"></nve-sparkline>
    </div>

    <!-- Status -->
    <div nve-layout="row gap:md align:wrap">
      <nve-sparkline status="accent" mark="area" data="[3, 2, 10, 8, 4, 6, 9]"></nve-sparkline>
      <nve-sparkline status="danger" mark="area" data="[15, 14, 12, 9, 8, 7, 5]"></nve-sparkline>
      <nve-sparkline status="warning" mark="area" data="[8, 9, 7, 10, 9, 8, 9]"></nve-sparkline>
      <nve-sparkline status="success" mark="area" data="[5, 7, 8, 9, 12, 14, 15]"></nve-sparkline>
    </div>

    <!-- Size -->
    <div nve-layout="row gap:md align:wrap">
      <nve-sparkline size="xs" data="[9, 12, 11, 13, 15, 14, 16]"></nve-sparkline>
      <nve-sparkline size="sm" data="[9, 12, 11, 13, 15, 14, 16]"></nve-sparkline>
      <nve-sparkline size="md" data="[9, 12, 11, 13, 15, 14, 16]"></nve-sparkline>
      <nve-sparkline size="lg" data="[9, 12, 11, 13, 15, 14, 16]"></nve-sparkline>
      <nve-sparkline size="xl" data="[9, 12, 11, 13, 15, 14, 16]"></nve-sparkline>
    </div>

    <!-- Default Size -->
    <div nve-layout="row gap:md align:wrap">
      <div nve-layout="row gap:sm" nve-text="heading">
        <nve-sparkline data="[9, 12, 11, 13, 15, 14, 16]"></nve-sparkline>
      </div>
      <div nve-layout="row gap:sm" nve-text="body">
        <nve-sparkline data="[9, 12, 11, 13, 15, 14, 16]"></nve-sparkline>
      </div>
      <div nve-layout="row gap:sm" nve-text="label sm">
        <nve-sparkline data="[9, 12, 11, 13, 15, 14, 16]"></nve-sparkline>
      </div>
    </div>

    <!-- Interpolation (line) -->
    <div nve-layout="row gap:md align:wrap">
      <nve-sparkline interpolation="linear" mark="line" data="[6, 10, 8, 16, 13, 18, 15]"></nve-sparkline>
      <nve-sparkline interpolation="smooth" mark="line" data="[6, 10, 8, 16, 13, 18, 15]"></nve-sparkline>
      <nve-sparkline interpolation="step" mark="line" data="[6, 10, 8, 16, 13, 18, 15]"></nve-sparkline>
    </div>

    <!-- Interpolation (area) -->
    <div nve-layout="row gap:md align:wrap">
      <nve-sparkline interpolation="linear" mark="area" data="[6, 10, 8, 16, 13, 18, 15]"></nve-sparkline>
      <nve-sparkline interpolation="smooth" mark="area" data="[6, 10, 8, 16, 13, 18, 15]"></nve-sparkline>
      <nve-sparkline interpolation="step" mark="area" data="[6, 10, 8, 16, 13, 18, 15]"></nve-sparkline>
    </div>

    <!-- Interpolation (gradient) -->
    <div nve-layout="row gap:md align:wrap">
      <nve-sparkline interpolation="linear" mark="gradient" data="[6, 10, 8, 16, 13, 18, 15]"></nve-sparkline>
      <nve-sparkline interpolation="smooth" mark="gradient" data="[6, 10, 8, 16, 13, 18, 15]"></nve-sparkline>
      <nve-sparkline interpolation="step" mark="gradient" data="[6, 10, 8, 16, 13, 18, 15]"></nve-sparkline>
    </div>

    <!-- Accent -->
    <div nve-layout="row gap:md align:wrap">
      <nve-sparkline denote-last data="[10, 12, 15, 14, 18, 16, 20]"></nve-sparkline>
      <nve-sparkline denote-first denote-last data="[10, 12, 15, 14, 18, 16, 20]"></nve-sparkline>
      <nve-sparkline denote-min denote-max data="[12, 8, 15, 10, 18, 14, 11]"></nve-sparkline>
    </div>

    <!-- Single-Point -->
    <div nve-layout="row gap:md align:wrap">
      <nve-sparkline data="[5]" mark="line" denote-first denote-last denote-min denote-max aria-label="single point line accents"></nve-sparkline>
      <nve-sparkline data="[5]" mark="area" aria-label="single point area"></nve-sparkline>
      <nve-sparkline data="[5]" mark="column" aria-label="single point column"></nve-sparkline>
      <nve-sparkline data="[1]" mark="winloss" aria-label="single point winloss"></nve-sparkline>
    </div>

    <!-- Aligned Domain -->
    <div nve-layout="row gap:md align:wrap">
      <nve-sparkline min="0" max="100" mark="area" status="accent" data="[80, 85, 90, 95, 100]"></nve-sparkline>
      <nve-sparkline min="0" max="100" mark="area" status="accent" data="[40, 45, 50, 55, 60]"></nve-sparkline>
      <nve-sparkline min="0" max="100" mark="area" status="accent" data="[0, 5, 10, 15, 20]"></nve-sparkline>
    </div>

    <!-- Zero Line -->
    <div nve-layout="row gap:md align:wrap">
      <nve-sparkline aria-label="mixed values" mark="gradient" data="[-3, 2, 5, -1, 3, -2, 4]"></nve-sparkline>
      <nve-sparkline aria-label="mostly negative values" mark="gradient" data="[-8, -5, -2, 1, -3, -6, -4]"></nve-sparkline>
      <nve-sparkline aria-label="mixed values column" mark="column" data="[-3, 2, 5, -1, 3, -2, 4]"></nve-sparkline>
    </div>

    <!-- Interval Length -->
    <div nve-layout="row gap:md align:wrap">
      <nve-sparkline interval-length="0.3" mark="line" data="[10, 20, 15, 25, 18]"></nve-sparkline>
      <nve-sparkline interval-length="0.6" mark="line" data="[10, 20, 15, 25, 18]"></nve-sparkline>
      <nve-sparkline interval-length="2.0" mark="line" data="[10, 20, 15, 25, 18]"></nve-sparkline>
    </div>

    <!-- Custom Styling -->
    <div nve-layout="row gap:md align:wrap">
      <nve-sparkline 
        data="[8, 12, 10, 15, 11, 17]" 
        mark="gradient" 
        style="
        --height: 120px;
        --accent-color: var(--nve-sys-layer-canvas-background);
        --accent-radius: 5px;
        --accent-border-width: 3px;
        --line-width: 2.5px;
        --line-color: var(--nve-ref-color-blue-cobalt-1100);
          --gradient-max-color: color-mix(in oklab, var(--nve-ref-color-blue-cobalt-1100) 45%, transparent);
          --gradient-min-color: color-mix(in oklab, var(--nve-ref-color-blue-cobalt-1100), transparent 90%);" 
        denote-last aria-label="custom properties"></nve-sparkline>
    </div>
  </div>
  `;
}
