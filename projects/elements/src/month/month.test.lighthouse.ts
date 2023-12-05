import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('month lighthouse report', () => {
  test('month should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-month', /* html */`
      <mlv-month>
        <label>label</label>
        <input type="month" />
      </mlv-month>
      <script type="module">
        import '@elements/elements/month/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(26);
  });
});
