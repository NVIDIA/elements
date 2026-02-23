import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('page-header visual', () => {
  test('page-header should match visual baseline', async () => {
    const report = await visualRunner.render('page-header', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('page-header should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('page-header.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/page-header/define.js';
    import '@nvidia-elements/core/logo/define.js';
    import '@nvidia-elements/core/button/define.js';
    import '@nvidia-elements/core/icon/define.js';
    import '@nvidia-elements/core/icon-button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-page-header style="min-width: 768px">
    <nve-logo slot="prefix" size="sm" color="green-grass">•︎•︎</nve-logo>
    <h2 nve-text="heading" slot="prefix">•︎•︎•︎•︎•︎•︎</h2>
    <nve-button selected container="flat">•︎•︎•︎</nve-button>
    <nve-button container="flat">•︎•︎•︎</nve-button>
    <nve-icon-button container="flat" icon-name="chat-bubble" slot="suffix"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="search" slot="suffix"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="switch-apps" slot="suffix"></nve-icon-button>
    <nve-icon-button interaction="emphasis" slot="suffix">•︎•︎</nve-icon-button>
  </nve-page-header>
  `;
}
