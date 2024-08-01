import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('color visual', () => {
  test('color should match visual baseline', async () => {
    const report = await visualRunner.render('color', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('color should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('color.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/color/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-color>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="color" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-color>

  <nve-color>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="color" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-color>

  <nve-color>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="color" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-color>

  <nve-color>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="color" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-color>

  <nve-color layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="color" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-color>
  `;
}
