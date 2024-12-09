import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('preferences input visual', () => {
  test('preferences input should match visual baseline', async () => {
    const report = await visualRunner.render('preferences-input', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('preferences input should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('preferences-input.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/preferences-input/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    :root {
     --nve-config-light: true;
     --nve-config-dark: true;
     --nve-config-high-contrast: true;
     --nve-config-compact: true;
     --nve-config-reduced-motion: true;
    }
  </style>
  <div nve-layout="row gap:xs">
    <nve-preferences-input></nve-preferences-input>
  </div>
  `;
}
