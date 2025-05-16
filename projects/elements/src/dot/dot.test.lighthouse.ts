import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('dot lighthouse report', () => {
  test('dot should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-dot', /* html */`
      <nve-dot>1</nve-dot>
      <script type="module">
        import '@nvidia-elements/core/dot/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(8.8);
  });
});
