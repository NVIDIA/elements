import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('progress-ring lighthouse report', () => {
  test('progress-ring should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-progress-ring', /* html */`
      <nve-progress-ring aria-label="progress"></nve-progress-ring>
      <script type="module">
        import '@elements/elements/progress-ring/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(16.5);
  });
});
