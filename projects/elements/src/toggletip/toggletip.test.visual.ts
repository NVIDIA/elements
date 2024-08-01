import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('toggletip visual', () => {
  test('toggletip should match visual baseline', async () => {
    const report = await visualRunner.render('toggletip', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('toggletip should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('toggletip.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/toggletip/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="row align:center" style="height: 400px">
    <nve-toggletip anchor="btn" closable style="--min-width: 250px">
      <nve-toggletip-header>
        <h3 nve-text="heading sm">•︎•︎•︎•︎•︎•︎</h3>
      </nve-toggletip-header>
        <p nve-text="body">•︎•︎•︎•︎•︎•︎</p>
      <nve-toggletip-footer>
        <p nve-text="body">•︎•︎•︎•︎•︎•︎</p>
      </nve-toggletip-footer>
    </nve-toggletip>
    <nve-button id="btn">•︎•︎•︎•︎•︎•︎</nve-button>
  </div>
  `;
}
