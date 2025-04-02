import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('page-loader lighthouse report', () => {
  test('page-loader should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-page-loader', /* html */`
      <nve-page-loader aria-label="page-loader"></nve-page-loader>
      <script type="module">
        import '@nvidia-elements/core/page-loader/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(17.3);
  });
});
