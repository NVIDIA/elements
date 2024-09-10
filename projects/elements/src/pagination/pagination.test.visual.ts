import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('pagination visual', () => {
  test('pagination should match visual baseline', async () => {
    const report = await visualRunner.render('pagination', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('pagination should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('pagination.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/pagination/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-pagination value="1" items="100" step="10"></nve-pagination>

  <nve-pagination value="1" items="100" step="10" skippable></nve-pagination>

  <nve-pagination disabled value="1" items="100" step="10" skippable></nve-pagination>

  <nve-pagination container="flat" value="1" items="100" step="10" skippable></nve-pagination>

  <nve-pagination disable-step container="inline" value="1" items="100" step="10"></nve-pagination>

  <nve-pagination value="1" items="10000" step="1000"></nve-pagination>

  `;
}
