import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('week lighthouse report', () => {
  test('week should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-week', /* html */`
      <nve-week>
        <label>label</label>
        <input type="week" />
      </nve-week>
      <script type="module">
        import '@elements/elements/week/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25.5);
  });
});
