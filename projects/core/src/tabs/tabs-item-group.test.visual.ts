// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('tabs item group visual', () => {
  test('tabs item group should match visual baseline', async () => {
    await visualRunner.inspect('tabs-item-group', template(), async page => {
      await page.locator('[dir="ltr"] nve-tabs:not([vertical]) nve-tabs-item-group nve-tabs-item').hover();
    });
  });

  test('tabs item group should match visual baseline dark theme', async () => {
    await visualRunner.inspect('tabs-item-group.dark', template('dark'), async page => {
      await page.locator('[dir="ltr"] nve-tabs:not([vertical]) nve-tabs-item-group nve-tabs-item').hover();
    });
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/tabs/define.js';
      import '@nvidia-elements/core/icon/define.js';
      import '@nvidia-elements/core/icon-button/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <style>
      body { min-width: 320px; width: fit-content; height: fit-content; font-synthesis: none; text-rendering: optimizeLegibility; }
    </style>
    ${['ltr', 'rtl']
      .map(
        dir => `
      <div dir="${dir}">
        <nve-tabs vertical behavior-select style="width: 250px">
          <nve-tabs-item-group>
            <nve-tabs-item selected>
              <nve-icon slot="prefix" name="beaker" aria-hidden="true"></nve-icon>
              <div nve-text="truncate">•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</div>
            </nve-tabs-item>
            <nve-icon-button slot="suffix" icon-name="pin" size="sm" container="flat" aria-label="Pin experiment"></nve-icon-button>
            <span slot="suffix" nve-layout="row align:center">
              <nve-icon-button icon-name="cancel" size="sm" container="flat" aria-label="Close experiment"></nve-icon-button>
            </span>
          </nve-tabs-item-group>
          <nve-tabs-item-group>
            <nve-tabs-item>
              <a href="#"><span nve-text="truncate">•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</span></a>
            </nve-tabs-item>
            <nve-icon-button slot="suffix" icon-name="cancel" size="sm" container="flat" aria-label="Close linked experiment"></nve-icon-button>
          </nve-tabs-item-group>
          <nve-tabs-item style="--gap: var(--nve-ref-space-md)">
            <a href="#"><nve-icon name="beaker" aria-hidden="true"></nve-icon><span nve-text="truncate"><strong>•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</strong></span></a>
          </nve-tabs-item>
          <nve-tabs-item-group style="--height: var(--nve-ref-size-1000)">
            <nve-tabs-item disabled>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
            <nve-icon-button slot="suffix" icon-name="cancel" size="sm" container="flat" disabled aria-label="Close unavailable"></nve-icon-button>
          </nve-tabs-item-group>
        </nve-tabs>
        <nve-tabs>
          <nve-tabs-item selected>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
          <nve-tabs-item-group>
            <nve-tabs-item>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
            <nve-icon-button slot="suffix" icon-name="more-actions" size="sm" container="flat" aria-label="Experiment actions"></nve-icon-button>
          </nve-tabs-item-group>
          <nve-tabs-item>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
          <nve-tabs-item>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
        </nve-tabs>
      </div>`
      )
      .join('')}
  `;
}
