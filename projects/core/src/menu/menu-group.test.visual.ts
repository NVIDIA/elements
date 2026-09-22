// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('menu-group visual', () => {
  test('menu-group should match visual baseline', async () => {
    const report = await visualRunner.render('menu-group', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('menu-group should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('menu-group.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/menu/define.js';
      import '@nvidia-elements/core/dot/define.js';
      import '@nvidia-elements/core/icon/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div style="width: 240px">
      <nve-menu-group behavior-expand>
        <nve-icon name="folder" slot="prefix"></nve-icon>
        •︎•︎•︎•︎•︎•︎
        <nve-dot slot="suffix"></nve-dot>
        <nve-menu>
          <nve-menu-item>•︎•︎•︎•︎</nve-menu-item>
        </nve-menu>
      </nve-menu-group>
      <nve-menu-group behavior-expand expanded>
        <nve-icon name="gear" slot="prefix"></nve-icon>
        •︎•︎•︎•︎•︎•︎
        <nve-dot slot="suffix"></nve-dot>
        <nve-menu>
          <nve-menu-item current="page">•︎•︎•︎•︎</nve-menu-item>
          <nve-menu-item>•︎•︎•︎•︎</nve-menu-item>
        </nve-menu>
      </nve-menu-group>
      <nve-menu-group expanded disabled>
        •︎•︎•︎•︎•︎•︎
        <nve-menu>
          <nve-menu-item>•︎•︎•︎•︎</nve-menu-item>
        </nve-menu>
      </nve-menu-group>
    </div>
  `;
}
