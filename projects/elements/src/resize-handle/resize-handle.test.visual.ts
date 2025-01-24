import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('resize-handle visual', () => {
  test('resize-handle should match visual baseline', async () => {
    const report = await visualRunner.render('resize-handle', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('resize-handle should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('resize-handle.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/resize-handle/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-resize-handle>
    <input type="range" />
  </nve-resize-handle>
  `;
}
