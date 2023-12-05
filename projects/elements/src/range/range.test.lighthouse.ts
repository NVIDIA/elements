import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('range lighthouse report', () => {
  test('range should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-range', /* html */`
      <nve-range>
        <label>label</label>
        <input type="range" value="50" />
      </nve-range>
      <script type="module">
        import '@elements/elements/range/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25);
  });
});
