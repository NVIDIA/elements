import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('week visual', () => {
  test('week should match visual baseline', async () => {
    const report = await visualRunner.render('week', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('week should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('week.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/week/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    nve-week {
      --color: transparent;
    }
  </style>

  <nve-week>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="week" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-week>

  <nve-week>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="week" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-week>

  <nve-week>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="week" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-week>

  <nve-week>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="week" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-week>

  <nve-week layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="week" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-week>
  `;
}
