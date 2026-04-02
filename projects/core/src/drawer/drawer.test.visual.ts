// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('drawer visual', () => {
  test('drawer should match visual baseline', async () => {
    const report = await visualRunner.render('drawer', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('drawer should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('drawer.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/drawer/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <style>
    body {
      width: 1024px;
      height: 780px;
    }

    nve-drawer {
      transition: none !important;
    }
  </style>

  <nve-drawer closable>
    <nve-drawer-header>
      •︎•︎•
    </nve-drawer-header>
    <nve-drawer-content>
      •︎•︎•
    </nve-drawer-content>
    <nve-drawer-footer>
      •︎•︎•︎
    </nve-drawer-footer>
  </nve-drawer>
  `;
}
