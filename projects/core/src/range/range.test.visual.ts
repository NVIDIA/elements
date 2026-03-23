import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

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

  <nve-range>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="range" min="0" max="100" value="50" list="datalist-1" />
    <datalist id="datalist-1">
      <option value="0">0</option>
      <option value="25">25</option>
      <option value="50">50</option>
      <option value="75">75</option>
      <option value="100">100</option>
    </datalist>
  </nve-range>

  <nve-range>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <input type="range" min="0" max="100" value="50" list="datalist-2" />
    <datalist id="datalist-2">
      <option value="0">0</option>
      <option value="25">25</option>
      <option value="50">50</option>
      <option value="75">75</option>
      <option value="100">100</option>
    </datalist>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-range>

  <div style="height: 200px; display: flex; gap: 24px">
    <nve-range orientation="vertical">
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="range" />
      <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
    </nve-range>

    <nve-range orientation="vertical">
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="range" disabled />
      <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
    </nve-range>

    <nve-range orientation="vertical">
      <label>•︎•︎•︎•︎•︎•︎</label>
      <input type="range" min="0" max="100" value="50" list="datalist-v" />
      <datalist id="datalist-v">
        <option value="0">0</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="75">75</option>
        <option value="100">100</option>
      </datalist>
    </nve-range>
  </div>
  `;
}
