import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('pagination lighthouse report', () => {
  test('pagination should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-pagination', /* html */`
      <mlv-pagination name="page" value="1" step="10" items="100"></mlv-pagination>
      <script type="module">
        import '@elements/elements/pagination/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(46);
  });
});
