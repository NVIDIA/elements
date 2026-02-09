import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('password visual', () => {
  test('password should match visual baseline', async () => {
    const report = await visualRunner.render('password', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('password should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('password.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/password/define.js';
    import '@nvidia-elements/core/input/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    nve-password {
      --color: transparent;
    }
  </style>

  <nve-password>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="password" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-password>

  <nve-password>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="password" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-password>

  <nve-password>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="password" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-password>

  <nve-password>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="password" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-password>

  <nve-password layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="password" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-password>
  `;
}
