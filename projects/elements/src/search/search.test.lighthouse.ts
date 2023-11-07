import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('search lighthouse report', () => {
  test('search should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-search', /* html */`
      <mlv-search>
        <label>label</label>
        <input type="search" />
      </mlv-search>
      <script type="module">
        import '@elements/elements/search/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25.5);
  });
});
