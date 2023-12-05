import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('progressive-filter-chip lighthouse report', () => {
  test('progressive-filter-chip should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-progressive-filter-chip', /* html */`
      <nve-progressive-filter-chip>
        <select aria-label="select">
          <option value="1">option 1</option>
          <option value="2">option 2</option>
        </select>
        <input type="text" value="text value" aria-label="text input" />
        <input type="date" value="2021-01-01" aria-label="date input" />
      </nve-progressive-filter-chip>
      <script type="module">
        import '@elements/elements/progressive-filter-chip/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(46);
  });
});
