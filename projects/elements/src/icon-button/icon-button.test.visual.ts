import { expect, test, describe } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

describe('icon-button visual', () => {
  test('icon-button should match visual baseline', async () => {
    const report = await visualRunner.render('icon-button', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('icon-button should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('icon-button.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/icon-button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="row gap:xs">
    <nve-icon-button icon-name="menu"></nve-icon-button>
    <nve-icon-button interaction="emphasis" icon-name="menu"></nve-icon-button>
    <nve-icon-button interaction="destructive" icon-name="menu"></nve-icon-button>
    <nve-icon-button disabled icon-name="menu"></nve-icon-button>
  </div>

  <div nve-layout="row gap:xs">
    <nve-icon-button size="sm" icon-name="menu"></nve-icon-button>
    <nve-icon-button icon-name="menu"></nve-icon-button>
    <nve-icon-button size="lg" icon-name="menu"></nve-icon-button>
  </div>

  <div nve-layout="row gap:xs">
    <nve-icon-button container="flat" icon-name="menu"></nve-icon-button>
    <nve-icon-button container="flat" interaction="emphasis" icon-name="menu"></nve-icon-button>
    <nve-icon-button container="flat" interaction="destructive" icon-name="menu"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="menu" disabled></nve-icon-button>
  </div>

  <div nve-layout="row gap:sm">
    <nve-icon-button icon-name="filter-stroke"></nve-icon-button>
    <nve-icon-button pressed icon-name="filter"></nve-icon-button>
  </div>

  <div nve-layout="row gap:sm">
    <nve-icon-button selected container="flat" icon-name="split-vertical" aria-label="split vertical"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="split-horizontal" aria-label="split horizontal"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="split-none" aria-label="preview"></nve-icon-button>
  </div>

  <div nve-layout="row gap:sm">
    <nve-icon-button selected container="inline" icon-name="split-vertical" aria-label="split vertical"></nve-icon-button>
    <nve-icon-button container="inline" icon-name="split-horizontal" aria-label="split horizontal"></nve-icon-button>
    <nve-icon-button container="inline" icon-name="split-none" aria-label="preview"></nve-icon-button>
  </div>

  <div nve-layout="row gap:sm">
    <nve-icon-button icon-name="menu">
      <a href="#" aria-label="link to page"></a>
    </nve-icon-button>
    <nve-icon-button container="flat" icon-name="menu">
      <a href="#" aria-label="link to page"></a>
    </nve-icon-button>
  </div>
  `;
}
