import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('pagination lighthouse report', () => {
  test('pagination should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-pagination', /* html */`
      <nve-pagination name="page" value="1" step="10" items="100"></nve-pagination>
      <script type="module">
        import '@nvidia-elements/core/pagination/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(33.6);
  });
});
