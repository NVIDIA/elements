import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('tooltip visual', () => {
  test('tooltip should match visual baseline', async () => {
    const report = await visualRunner.render('tooltip', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('tooltip should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('tooltip.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/tooltip/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="row align:center" style="height: 400px">
    <nve-tooltip anchor="btn" closable>
      •︎•︎•︎•︎•︎•︎
    </nve-tooltip>
    <nve-button id="btn">•︎•︎•︎•︎•︎•︎</nve-button>
  </div>
  `;
}
