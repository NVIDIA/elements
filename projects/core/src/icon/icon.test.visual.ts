// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';
import { ICON_NAMES } from '@nvidia-elements/core/icon';

describe('icon visual', () => {
  test('icon should match visual baseline', async () => {
    const report = await visualRunner.render('icon', template(), { network: true });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('icon should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('icon.dark', template('dark'), { network: true });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/icon/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <style>
    nve-icon {
      outline: 1px solid var(--nve-ref-border-color-muted);
    }
  </style>

  <div nve-layout="row gap:xs">
    <nve-icon name="person"></nve-icon>
    <nve-icon name="person" status="accent"></nve-icon>
    <nve-icon name="person" status="success"></nve-icon>
    <nve-icon name="person" status="warning"></nve-icon>
    <nve-icon name="person" status="danger"></nve-icon>
  </div>

  <div nve-layout="row gap:xs">
    <nve-icon name="person" size="sm"></nve-icon>
    <nve-icon name="person"></nve-icon>
    <nve-icon name="person" size="lg"></nve-icon>
  </div>

  <div nve-layout="row gap:xs">
    <nve-icon name="arrow-stop" direction="left"></nve-icon>
    <nve-icon name="arrow-stop" direction="right"></nve-icon>
    <nve-icon name="arrow" direction="up"></nve-icon>
    <nve-icon name="arrow" direction="down"></nve-icon>
    <nve-icon name="arrow" direction="left"></nve-icon>
    <nve-icon name="arrow" direction="right"></nve-icon>
    <nve-icon name="caret" direction="up"></nve-icon>
    <nve-icon name="caret" direction="down"></nve-icon>
    <nve-icon name="caret" direction="left"></nve-icon>
    <nve-icon name="caret" direction="right"></nve-icon>
    <nve-icon name="chevron" direction="up"></nve-icon>
    <nve-icon name="chevron" direction="down"></nve-icon>
    <nve-icon name="chevron" direction="left"></nve-icon>
    <nve-icon name="chevron" direction="right"></nve-icon>
  </div>

  <div nve-layout="row gap:xs align:wrap" style="max-width: 600px;">
    ${ICON_NAMES.map(i => `<nve-icon name="${i}"></nve-icon>`).join('')}
  </div>
  `;
}
