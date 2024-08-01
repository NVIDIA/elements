import { expect, test, describe } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

describe('dialog visual', () => {
  test('dialog should match visual baseline', async () => {
    const report = await visualRunner.render('dialog', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('dialog should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('dialog.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/dialog/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <style>
    body {
      min-width: 1024px;
      min-height: 780px;
    }
  </style>

  <nve-dialog closable>
    <nve-dialog-header>
      •︎•︎•
    </nve-dialog-header>
    •︎•︎•︎
    <nve-dialog-footer>
      •︎•︎•︎
    </nve-dialog-footer>
  </nve-dialog>
  `;
}
