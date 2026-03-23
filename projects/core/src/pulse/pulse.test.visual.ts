import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('pulse visual', () => {
  test('pulse should match visual baseline', async () => {
    const report = await visualRunner.render('pulse', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('pulse should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('pulse.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/pulse/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <style>
    nve-pulse {
        --animation-duration: 0s;
    }
  </style>

  <div nve-layout="row gap:xs">
    <nve-pulse status="accent"></nve-pulse>
    <nve-pulse status="warning"></nve-pulse>
    <nve-pulse status="danger"></nve-pulse>
  </div>

  <div nve-layout="row gap:xs">
    <nve-pulse size="xs"></nve-pulse>
    <nve-pulse size="sm"></nve-pulse>
    <nve-pulse size="md"></nve-pulse>
    <nve-pulse size="lg"></nve-pulse>
  </div>
  `;
}
