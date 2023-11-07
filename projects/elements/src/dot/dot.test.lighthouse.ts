import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('dot lighthouse report', () => {
  test('dot should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-dot', /* html */`
      <mlv-dot>1</mlv-dot>
      <script type="module">
        import '@elements/elements/dot/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(9);
  });
});
