// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('page visual', () => {
  test('page should match visual baseline', async () => {
    const report = await visualRunner.render('page', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('page should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('page.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/page/define.js';
    import '@nvidia-elements/core/page-header/define.js';
    import '@nvidia-elements/core/icon-button/define.js';
    import '@nvidia-elements/core/button-group/define.js';
    import '@nvidia-elements/core/toolbar/define.js';
    import '@nvidia-elements/core/logo/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    body {
      padding: 0 !important;
      width: 1024px;
      height: 780px;
    }
  </style>
  <nve-page>
    <nve-page-header slot="header">
      <nve-logo slot="prefix" size="sm">NV</nve-logo>
      <h2 nve-text="heading" slot="prefix">•︎•︎•︎•︎•︎•︎</h2>
    </nve-page-header>

    <nve-page-panel slot="subheader">
      <nve-page-panel-content>•︎•︎•︎•︎•︎•︎</nve-page-panel-content>
    </nve-page-panel>

    <nve-toolbar slot="left-aside" orientation="vertical">
      <nve-button-group>
        <nve-icon-button icon-name="gear"></nve-icon-button>
      </nve-button-group>
    </nve-toolbar>

    <nve-page-panel id="panel-left" slot="left" size="sm">
      <nve-icon-button commandfor="panel-left" command="--close" slot="actions" container="inline" icon-name="double-chevron" direction="left" aria-label="close"></nve-icon-button>
      <nve-page-panel-content>•︎•︎•︎•︎•︎•︎</nve-page-panel-content>
    </nve-page-panel>

    <main nve-layout="pad:lg">
      <h1 nve-text="heading">•︎•︎•︎•︎•︎•︎</h1>
    </main>

    <nve-page-panel id="panel-bottom" slot="bottom" size="sm">
      <nve-icon-button commandfor="panel-bottom" command="--close" slot="actions" container="inline" icon-name="cancel" aria-label="close"></nve-icon-button>
      <nve-page-panel-content>•︎•︎•︎•︎•︎•︎</nve-page-panel-content>
    </nve-page-panel>

    <nve-page-panel id="panel-right" slot="right" size="sm">
      <nve-icon-button commandfor="panel-right" command="--close" slot="actions" container="inline" icon-name="double-chevron" direction="right" aria-label="close"></nve-icon-button>
      <nve-page-panel-content>•︎•︎•︎•︎•︎•︎</nve-page-panel-content>
    </nve-page-panel>

    <nve-toolbar slot="right-aside" orientation="vertical">
      <nve-button-group>
        <nve-icon-button icon-name="gear"></nve-icon-button>
      </nve-button-group>
    </nve-toolbar>

    <nve-toolbar slot="subfooter">
      <span nve-text="body sm muted">•︎•︎•︎•︎•︎•︎</span>
    </nve-toolbar>

    <nve-toolbar slot="footer">
      <span nve-text="body sm muted">•︎•︎•︎•︎•︎•︎</span>
    </nve-toolbar>
  </nve-page>
  `;
}
