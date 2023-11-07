import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('sort-button lighthouse report', () => {
  test('sort-button should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-sort-button', /* html */`
      <mlv-sort-button aria-label="sort"></mlv-sort-button>
      <script type="module">
        import '@elements/elements/sort-button/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(18);
  });
});
