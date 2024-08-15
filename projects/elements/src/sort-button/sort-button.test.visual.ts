import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('sort-button visual', () => {
  test('sort-button should match visual baseline', async () => {
    const report = await visualRunner.render('sort-button', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('sort-button should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('sort-button.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/sort-button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <div nve-theme="root light" nve-layout="row gap:xs">
    <nve-sort-button></nve-sort-button>
    <nve-sort-button sort="ascending"></nve-sort-button>
    <nve-sort-button sort="descending"></nve-sort-button>
  </div>
  `;
}
