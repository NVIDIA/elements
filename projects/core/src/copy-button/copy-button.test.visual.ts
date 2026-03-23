import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('copy-button visual', () => {
  test('copy-button should match visual baseline', async () => {
    const report = await visualRunner.render('copy-button', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('copy-button should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('copy-button.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/copy-button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="row gap:xs">
    <nve-copy-button value="hello"></nve-copy-button>
  </div>

  <div nve-layout="row gap:sm">
    <nve-copy-button container="flat" value="hello"></nve-copy-button>
    <nve-copy-button container="flat" disabled value="hello"></nve-copy-button>
  </div>

  <div nve-layout="row gap:sm">
    <nve-copy-button value="hello"></nve-copy-button>
    <nve-copy-button disabled value="hello"></nve-copy-button>
  </div>
  
  <div nve-layout="row gap:xs">
    <nve-copy-button size="sm"></nve-copy-button>
    <nve-copy-button></nve-copy-button>
    <nve-copy-button size="lg"></nve-copy-button>
  </div>
  `;
}
