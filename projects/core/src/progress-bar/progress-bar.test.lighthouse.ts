import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('progress-bar lighthouse report', () => {
  test('progress-bar should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-progress-bar', /* html */`
      <nve-progress-bar></nve-progress-bar>
      <script type="module">
        import '@nvidia-elements/core/progress-bar/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(10.5);
  });
});
