import { expect, test, describe } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

describe('steps visual', () => {
  test('steps should match visual baseline', async () => {
    const report = await visualRunner.render('steps', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('steps should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('steps.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/steps/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-steps>
    <nve-steps-item status="success">•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item status="danger">•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item selected>•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item disabled>•︎•︎•︎•︎•︎•︎</nve-steps-item>
  </nve-steps>

  <nve-steps>
    <nve-steps-item selected status="success">•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item selected status="danger">•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item selected>•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item selected disabled>•︎•︎•︎•︎•︎•︎</nve-steps-item>
  </nve-steps>

  <nve-steps>
    <nve-steps-item disabled status="success">•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item disabled status="danger">•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item disabled>•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item disabled>•︎•︎•︎•︎•︎•︎</nve-steps-item>
  </nve-steps>

  <nve-steps container="condensed">
    <nve-steps-item status="success">•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item status="danger">•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item selected>•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item disabled>•︎•︎•︎•︎•︎•︎</nve-steps-item>
  </nve-steps>

  <nve-steps vertical style="width: 150px">
    <nve-steps-item status="success">•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item status="danger">•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item selected>•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item disabled>•︎•︎•︎•︎•︎•︎</nve-steps-item>
  </nve-steps>

  <nve-steps vertical container="condensed" behavior-select>
    <nve-steps-item status="success">•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item status="danger">•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item selected>•︎•︎•︎•︎•︎•︎</nve-steps-item>
    <nve-steps-item disabled>•︎•︎•︎•︎•︎•︎</nve-steps-item>
  </nve-steps>
  `;
}
