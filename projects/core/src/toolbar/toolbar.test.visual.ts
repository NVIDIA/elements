// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('toolbar visual', () => {
  test('toolbar should match visual baseline', async () => {
    const report = await visualRunner.render('toolbar', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('toolbar should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('toolbar.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/toolbar/define.js';
    import '@nvidia-elements/core/divider/define.js';
    import '@nvidia-elements/core/button/define.js';
    import '@nvidia-elements/core/button-group/define.js';
    import '@nvidia-elements/core/icon-button/define.js';
    import '@nvidia-elements/core/select/define.js';
    import '@nvidia-elements/core/switch/define.js';
    import '@nvidia-elements/core/checkbox/define.js';
    import '@nvidia-elements/core/input/define.js';
    import '@nvidia-elements/core/copy-button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-toolbar>
    <nve-button><nve-icon name="add"></nve-icon> •︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button><nve-icon name="delete"></nve-icon> •︎•︎•︎•︎•︎•︎</nve-button>
    <nve-icon-button icon-name="gear" slot="suffix" aria-label="settings"></nve-icon-button>
  </nve-toolbar>

  <nve-toolbar container="flat">
    <nve-button><nve-icon name="add"></nve-icon> •︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button><nve-icon name="delete"></nve-icon> •︎•︎•︎•︎•︎•︎</nve-button>
    <nve-icon-button container="flat" icon-name="gear" slot="suffix" aria-label="settings"></nve-icon-button>
  </nve-toolbar>

  <nve-toolbar container="inset">
    <nve-button><nve-icon name="add"></nve-icon> •︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button><nve-icon name="delete"></nve-icon> •︎•︎•︎•︎•︎•︎</nve-button>
    <nve-icon-button container="flat" icon-name="gear" slot="suffix" aria-label="settings"></nve-icon-button>
  </nve-toolbar>

  <nve-toolbar>
    <nve-select fit-text>
      <select aria-label="element type">
        <option value="1">•︎•︎•︎•︎•︎•︎</option>
        <option value="2">•︎•︎•︎•︎•︎•︎</option>
        <option value="p">•︎•︎•︎•︎•︎•︎</option>
      </select>
      <div slot="option-1">
        <span nve-text="heading">•︎•︎•︎•︎•︎•︎</span>
      </div>
      <div slot="option-2">
        <span nve-text="heading sm">•︎•︎•︎•︎•︎•︎</span>
      </div>
      <div slot="option-3">
        <span nve-text="body sm">•︎•︎•︎•︎•︎•︎</span>
      </div>
    </nve-select>

    <nve-divider></nve-divider>

    <nve-button-group>
      <nve-icon-button pressed icon-name="bars-3-bottom-left"></nve-icon-button>
      <nve-icon-button icon-name="bars-3-bottom-right"></nve-icon-button>
      <nve-icon-button icon-name="bars-4"></nve-icon-button>
    </nve-button-group>

    <nve-divider></nve-divider>

    <nve-button-group>
      <nve-icon-button icon-name="bold" size="sm"></nve-icon-button>
      <nve-icon-button icon-name="italic" size="sm"></nve-icon-button>
      <nve-icon-button icon-name="strikethrough" size="sm"></nve-icon-button>
    </nve-button-group>

    <nve-divider></nve-divider>

    <nve-button-group>
      <nve-icon-button icon-name="code"></nve-icon-button>
      <nve-icon-button icon-name="fork"></nve-icon-button>
      <nve-icon-button icon-name="merge"></nve-icon-button>
    </nve-button-group>

    <nve-button slot="suffix" container="flat">•︎•︎•︎•︎•︎•︎</nve-button>
  </nve-toolbar>

  <nve-toolbar orientation="vertical">
    <nve-button-group>
      <nve-icon-button pressed icon-name="bars-3-bottom-left"></nve-icon-button>
      <nve-icon-button icon-name="bars-3-bottom-right"></nve-icon-button>
      <nve-icon-button icon-name="bars-4"></nve-icon-button>
    </nve-button-group>

    <nve-divider></nve-divider>

    <nve-button-group>
      <nve-icon-button icon-name="bold" size="sm"></nve-icon-button>
      <nve-icon-button icon-name="italic" size="sm"></nve-icon-button>
      <nve-icon-button icon-name="strikethrough"></nve-icon-button>
    </nve-button-group>
  </nve-toolbar>

  <nve-toolbar status="accent">
    <nve-icon-button icon-name="cancel" slot="prefix"></nve-icon-button>  
    <p nve-text="body">•︎•︎•︎•︎•︎•︎</p>
    <nve-button slot="suffix">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-icon-button icon-name="more-actions" slot="suffix"></nve-icon-button>
  </nve-toolbar>

  <nve-toolbar>
    <nve-button><nve-icon name="copy"></nve-icon> •︎•︎•︎•︎</nve-button>
    <nve-button><nve-icon name="copy"></nve-icon></nve-button>
    <nve-icon-button icon-name="copy"></nve-icon-button>
    <nve-copy-button></nve-copy-button>
    <nve-switch prominence="muted">
      <input type="checkbox" checked aria-label="switch" />
    </nve-switch>
    <nve-checkbox prominence="muted">
      <input type="checkbox" checked aria-label="checkbox" />
    </nve-checkbox>
    <nve-input>
      <input aria-label="input" />
    </nve-input>
  </nve-toolbar>
  `;
}
