import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('switch visual', () => {
  test('switch should match visual baseline', async () => {
    const report = await visualRunner.render('switch', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('switch should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('switch.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <style>
    body {
      min-width: 720px;
    }
  </style>
  <script type="module">
    import '@nvidia-elements/core/switch/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <!-- states -->
  <nve-switch>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="checkbox" />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-switch>

  <nve-switch>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="checkbox" disabled />
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-switch>

  <nve-switch>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="checkbox" />
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-switch>

  <nve-switch>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="checkbox" />
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-switch>

  <!-- vertical group -->
  <nve-switch-group>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-switch>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-switch-group>

  <!-- vertical inline group -->
  <nve-switch-group layout="vertical-inline">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-switch>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-switch-group>

  <!-- horizontal group -->
  <nve-switch-group layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-switch>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-switch-group>

  <!-- horizontal inline group -->
  <nve-switch-group layout="horizontal-inline">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <nve-switch>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" checked />
    </nve-switch>

    <nve-switch>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="checkbox" />
    </nve-switch>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-switch-group>
  `;
}
