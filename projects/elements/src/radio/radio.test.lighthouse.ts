import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('radio lighthouse report', () => {
  test('radio should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-radio', /* html */`
      <nve-radio>
        <label>label</label>
        <input type="radio" />
      </nve-radio>
      <script type="module">
        import '@elements/elements/radio/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25);
  });
});
