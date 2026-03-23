import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('select visual', () => {
  test('select should match visual baseline', async () => {
    const report = await visualRunner.render('select', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('select should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('select.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/select/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-select>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <select>
      <option value="1">•︎•︎•︎•︎•︎•︎</option>
      <option value="2">•︎•︎•︎•︎•︎•︎</option>
      <option value="3">•︎•︎•︎•︎•︎•︎</option>
    </select>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-select>

  <nve-select>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <select disabled>
      <option value="1">•︎•︎•︎•︎•︎•︎</option>
      <option value="2">•︎•︎•︎•︎•︎•︎</option>
      <option value="3">•︎•︎•︎•︎•︎•︎</option>
    </select>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-select>

  <nve-select>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <select>
      <option value="1">•︎•︎•︎•︎•︎•︎</option>
      <option value="2">•︎•︎•︎•︎•︎•︎</option>
      <option value="3">•︎•︎•︎•︎•︎•︎</option>
    </select>
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-select>

  <nve-select>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <select>
      <option value="1">•︎•︎•︎•︎•︎•︎</option>
      <option value="2">•︎•︎•︎•︎•︎•︎</option>
      <option value="3">•︎•︎•︎•︎•︎•︎</option>
    </select>
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-select>

  <nve-select layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <select>
      <option value="1">•︎•︎•︎•︎•︎•︎</option>
      <option value="2">•︎•︎•︎•︎•︎•︎</option>
      <option value="3">•︎•︎•︎•︎•︎•︎</option>
    </select>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-select>

  <nve-select>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <select multiple>
      <option value="1">•︎•︎•︎•︎•︎•︎</option>
      <option value="2" selected>•︎•︎•︎•︎•︎•︎</option>
      <option value="3" selected>•︎•︎•︎•︎•︎•︎</option>
      <option value="4" selected>•︎•︎•︎•︎•︎•︎</option>
      <option value="5">•︎•︎•︎•︎•︎•︎</option>
    </select>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-select>

  <nve-select>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <select multiple disabled>
      <option value="1">•︎•︎•︎•︎•︎•︎</option>
      <option value="2" selected>•︎•︎•︎•︎•︎•︎</option>
      <option value="3" selected>•︎•︎•︎•︎•︎•︎</option>
      <option value="4" selected>•︎•︎•︎•︎•︎•︎</option>
      <option value="5">•︎•︎•︎•︎•︎•︎</option>
    </select>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-select>

  <nve-select>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <select size="5">
      <option value="1">•︎•︎•︎•︎•︎•︎</option>
      <option value="2" selected>•︎•︎•︎•︎•︎•︎</option>
      <option value="3">•︎•︎•︎•︎•︎•︎</option>
      <option value="4">•︎•︎•︎•︎•︎•︎</option>
      <option value="5">•︎•︎•︎•︎•︎•︎</option>
    </select>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-select>

  <nve-select container="flat">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <select>
      <option value="1">•︎•︎•︎•︎•︎•︎</option>
      <option value="2">•︎•︎•︎•︎•︎•︎</option>
      <option value="3">•︎•︎•︎•︎•︎•︎</option>
    </select>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-select>

  <nve-select container="flat">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <select multiple>
      <option selected value="1">•︎•︎•︎•︎•︎•︎</option>
      <option selected value="2">•︎•︎•︎•︎•︎•︎</option>
      <option selected value="3">•︎•︎•︎•︎•︎•︎</option>
    </select>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-select>
`;
}
