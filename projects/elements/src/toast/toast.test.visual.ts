import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('toast visual', () => {
  test('toast should match visual baseline', async () => {
    const report = await visualRunner.render('toast', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('toast should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('toast.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/toast/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-toast anchor="btn" position="top">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast anchor="btn" status="success" position="right">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast anchor="btn" status="warning" position="bottom">•︎•︎•︎•︎•︎•︎</nve-toast>
  <nve-toast anchor="btn" status="danger" position="left">•︎•︎•︎•︎•︎•︎</nve-toast>
  <div nve-layout="row align:center" style="height: 400px; width: 100%;">
    <nve-button id="btn">•︎•︎•︎•︎•︎•︎</nve-button>
  </div>
  `;
}
