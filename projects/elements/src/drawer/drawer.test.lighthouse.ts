import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('drawer lighthouse report', () => {
  test('drawer should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-drawer', /* html */`
      <mlv-drawer closable>hello</mlv-drawer>
      <script type="module">
        import '@elements/elements/drawer/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(33.5);
  });
});
