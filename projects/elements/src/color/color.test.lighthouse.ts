import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('color lighthouse report', () => {
  test('color should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-color', /* html */`
        <nve-color>
          <label>label</label>
          <input type="color" />
        </nve-color>
        <script type="module">
          import '@elements/elements/color/define.js';
        </script>
      `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(26);
  });
});
