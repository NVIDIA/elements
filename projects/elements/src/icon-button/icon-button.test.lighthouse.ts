import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('icon-button lighthouse report', () => {
  test('icon-button should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-icon-button', /* html */`
      <nve-icon-button aria-label="icon button"></nve-icon-button>
      <script type="module">
        import '@elements/elements/icon-button/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(18.5);
  });
});
