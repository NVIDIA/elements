import { expect, test, describe } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

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
    import '@nvidia-elements/core/app-header/define.js';
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
    <nve-app-header slot="header">
      <nve-logo></nve-logo>
      <h2 slot="title">•︎•︎•︎•︎•︎•︎</h2>
    </nve-app-header>

    <nve-page-panel slot="subheader">
      <nve-page-panel-content>•︎•︎•︎•︎•︎•︎</nve-page-panel-content>
    </nve-page-panel>

    <nve-toolbar slot="left-aside" orientation="vertical">
      <nve-button-group>
        <nve-icon-button icon-name="gear"></nve-icon-button>
      </nve-button-group>
    </nve-toolbar>

    <nve-page-panel slot="left" size="sm" expandable>
      <nve-page-panel-content>•︎•︎•︎•︎•︎•︎</nve-page-panel-content>
    </nve-page-panel>

    <h1 nve-text="heading">•︎•︎•︎•︎•︎•︎</h1>

    <nve-page-panel slot="bottom" size="sm" closable>
      <nve-page-panel-content>•︎•︎•︎•︎•︎•︎</nve-page-panel-content>
    </nve-page-panel>

    <nve-page-panel slot="right" size="sm" expandable>
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
