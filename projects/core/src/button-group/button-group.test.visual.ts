// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('button-group visual', () => {
  test('button-group should match visual baseline', async () => {
    const report = await visualRunner.render('button-group', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('button-group should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('button-group.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/button-group/define.js';
    import '@nvidia-elements/core/icon-button/define.js';
    import '@nvidia-elements/core/button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-button-group>
    <nve-icon-button icon-name="copy"></nve-icon-button>
    <nve-icon-button icon-name="add-comment"></nve-icon-button>
    <nve-icon-button icon-name="download"></nve-icon-button>
  </nve-button-group>

  <nve-button-group>
    <nve-icon-button pressed icon-name="bars-3-bottom-left"></nve-icon-button>
    <nve-icon-button icon-name="bars-3-bottom-right"></nve-icon-button>
    <nve-icon-button icon-name="bars-4"></nve-icon-button>
  </nve-button-group>

  <nve-button-group behavior-select="multi">
    <nve-icon-button pressed icon-name="bold" size="sm"></nve-icon-button>
    <nve-icon-button icon-name="italic" size="sm"></nve-icon-button>
    <nve-icon-button pressed icon-name="strikethrough" size="sm"></nve-icon-button>
  </nve-button-group>

  <nve-button-group container="flat">
    <nve-icon-button pressed icon-name="split-vertical"></nve-icon-button>
    <nve-icon-button icon-name="split-horizontal"></nve-icon-button>
    <nve-icon-button icon-name="split-none"></nve-icon-button>
  </nve-button-group>

  <nve-button-group container="rounded" behavior-select="single">
    <nve-button pressed>•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button>•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button>•︎•︎•︎•︎•︎•︎</nve-button>
  </nve-button-group>

  <nve-button-group orientation="vertical">
    <nve-icon-button icon-name="copy"></nve-icon-button>
    <nve-icon-button icon-name="add-comment"></nve-icon-button>
    <nve-icon-button icon-name="download"></nve-icon-button>
  </nve-button-group>
  `;
}
