import { expect, test, describe } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

describe('markdown visual', () => {
  test('markdown should match visual baseline', async () => {
    const report = await visualRunner.render('markdown', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('markdown should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('markdown.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/markdown/markdown/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-markdown></nve-markdown>
  `;
}
