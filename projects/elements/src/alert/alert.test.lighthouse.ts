import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('alert lighthouse report', () => {
  test('alert should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-alert', /* html */`
      <nve-alert>alert</nve-alert>
      <script type="module">
        import '@nvidia-elements/core/alert/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(22);
  });

  test('alert-group should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-alert-group', /* html */`
      <nve-alert-group>
        <nve-alert>default</nve-alert>
        <nve-alert>default</nve-alert>
      </nve-alert-group>
      <script type="module">
        import '@nvidia-elements/core/alert/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(21.5);
  });
});
