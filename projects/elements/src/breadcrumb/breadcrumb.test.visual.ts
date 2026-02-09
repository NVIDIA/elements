import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('breadcrumb visual', () => {
  test('breadcrumb should match visual baseline', async () => {
    const report = await visualRunner.render('breadcrumb', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('breadcrumb should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('breadcrumb.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/breadcrumb/define.js';
    import '@nvidia-elements/core/button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-breadcrumb>
    <nve-button><a href="#" target="_self">•︎•︎•︎</a></nve-button>
    <nve-button><a href="#" target="_self">•︎•︎•︎</a></nve-button>
    <span>•︎•︎•︎</span>
  </nve-breadcrumb>
  `;
}
