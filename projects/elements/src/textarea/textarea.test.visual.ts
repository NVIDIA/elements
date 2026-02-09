import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('textarea visual', () => {
  test('textarea should match visual baseline', async () => {
    const report = await visualRunner.render('textarea', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('textarea should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('textarea.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/textarea/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-textarea>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <textarea></textarea>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-textarea>

  <nve-textarea>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <textarea disabled></textarea>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-textarea>

  <nve-textarea>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <textarea></textarea>
    <nve-control-message status="success">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-textarea>

  <nve-textarea>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <textarea></textarea>
    <nve-control-message status="error">•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-textarea>

  <nve-textarea layout="horizontal">
    <label>•︎•︎•︎•︎•︎•︎</label>
    <textarea></textarea>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-textarea>

  <nve-textarea>
    <label>•︎•︎•︎•︎•︎•︎</label>
    <textarea rows="15" cols="40"></textarea>
    <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
  </nve-textarea>
  `;
}
