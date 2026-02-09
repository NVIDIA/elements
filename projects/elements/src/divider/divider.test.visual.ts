import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('divider visual', () => {
  test('divider should match visual baseline', async () => {
    const report = await visualRunner.render('divider', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('divider should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('divider.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/divider/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-divider></nve-divider>
  <div nve-layout="row gap:sm align:vertical-center" style="height: 50px">
    <nve-divider orientation="vertical"></nve-divider>
    <nve-icon-button icon-name="information-circle-stroke"></nve-icon-button>
    <nve-icon-button icon-name="more-actions"></nve-icon-button>
  </div>
  `;
}
