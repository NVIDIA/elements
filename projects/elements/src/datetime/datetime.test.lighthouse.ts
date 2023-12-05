import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('datetime lighthouse report', () => {
  test('datetime should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-datetime', /* html */`
      <nve-datetime>
        <label>label</label>
        <input type="datetime" />
      </nve-datetime>
      <script type="module">
        import '@elements/elements/datetime/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(26);
  });
});
