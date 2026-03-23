import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('alert visual', () => {
  test('alert should match visual baseline', async () => {
    const report = await visualRunner.render(
      'alert',
      /* html */ `
      <script type="module">
        import '@nvidia-elements/core/alert/define.js';
      </script>
      <nve-alert>•︎•︎•︎</nve-alert>
      <nve-alert status="accent">•︎•︎•︎</nve-alert>
      <nve-alert status="warning">•︎•︎•︎</nve-alert>
      <nve-alert status="success">•︎•︎•︎</nve-alert>
      <nve-alert status="danger">•︎•︎•︎</nve-alert>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('alert should match visual baseline dark theme', async () => {
    const report = await visualRunner.render(
      'alert.dark',
      /* html */ `
      <script type="module">
        import '@nvidia-elements/core/alert/define.js';
        document.documentElement.setAttribute('nve-theme', 'dark');
      </script>
      <nve-alert>•︎•︎•︎</nve-alert>
      <nve-alert status="accent">•︎•︎•︎</nve-alert>
      <nve-alert status="warning">•︎•︎•︎</nve-alert>
      <nve-alert status="success">•︎•︎•︎</nve-alert>
      <nve-alert status="danger">•︎•︎•︎</nve-alert>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});
