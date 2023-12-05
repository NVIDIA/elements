import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('date lighthouse report', () => {
  test('date should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-date', /* html */`
      <mlv-date>
        <label>label</label>
        <input type="date" />
      </mlv-date>
      <script type="module">
        import '@elements/elements/date/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(26);
  });
});
