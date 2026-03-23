import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('month visual', () => {
  test('month should match visual baseline', async () => {
    const report = await visualRunner.render('month', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('month should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('month.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/month/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    nve-month {
      --color: transparent;
    }
  </style>

  <nve-month>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="month" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-month>

  <nve-month>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="month" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-month>

  <nve-month>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="month" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-month>

  <nve-month>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="month" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-month>

  <nve-month layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="month" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-month>
  `;
}
