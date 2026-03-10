import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('sparkline lighthouse report', () => {
  test('sparkline should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-sparkline', /* html */`
      <nve-sparkline data="[4, 7, 5, 8, 6, 10]"></nve-sparkline>
      <script type="module">
        import '@nvidia-elements/core/sparkline/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(12.2);
  });
});
