import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('time visual', () => {
  test('time should match visual baseline', async () => {
    const report = await visualRunner.render('time', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('time should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('time.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/time/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    nve-time {
      --color: transparent;
    }
  </style>

  <nve-time>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="time" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-time>

  <nve-time>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="time" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-time>

  <nve-time>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="time" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-time>

  <nve-time>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="time" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-time>

  <nve-time layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="time" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-time>
  `;
}
