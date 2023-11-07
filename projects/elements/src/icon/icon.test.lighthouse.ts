import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('icon lighthouse report', () => {
  test('icon should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-icon', /* html */`
      <mlv-icon name="user"></mlv-icon>
      <script type="module">
        import '@elements/elements/icon/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(14.5);
  });
});
