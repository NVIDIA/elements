import { expect, test, describe } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

describe('range visual', () => {
  test('range should match visual baseline', async () => {
    const report = await visualRunner.render('range', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('range should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('range.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/range/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-range>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="range" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-range>

  <nve-range>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="range" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-range>

  <nve-range>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="range" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-range>

  <nve-range>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="range" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-range>

  <nve-range layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="range" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-range>
  `;
}
