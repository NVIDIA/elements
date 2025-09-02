import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

/* eslint-disable elements/deprecated-tags */

describe('app-header visual', () => {
  test('app-header should match visual baseline', async () => {
    const report = await visualRunner.render('app-header', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('app-header should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('app-header.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/app-header/define.js';
    import '@nvidia-elements/core/logo/define.js';
    import '@nvidia-elements/core/button/define.js';
    import '@nvidia-elements/core/icon/define.js';
    import '@nvidia-elements/core/icon-button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-app-header style="min-width: 768px">
    <nve-logo></nve-logo>
    <nve-button slot="nav-items" selected>•︎•︎•︎</nve-button>
    <nve-button slot="nav-items">•︎•︎•︎</nve-button>
    <nve-icon-button icon-name="chat-bubble" slot="nav-actions"></nve-icon-button>
    <nve-icon-button icon-name="search" slot="nav-actions"></nve-icon-button>
    <nve-icon-button icon-name="switch-apps" slot="nav-actions"></nve-icon-button>
    <nve-icon-button interaction="emphasis" slot="nav-actions">EL</nve-icon-button>
  </nve-app-header>
  `;
}
