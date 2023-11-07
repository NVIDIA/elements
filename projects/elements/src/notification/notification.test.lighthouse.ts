import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('notification lighthouse report', () => {
  test('notification should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-notification', /* html */`
      <nve-notification>hello</nve-notification>
      <script type="module">
        import '@elements/elements/notification/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(30.5);
  });
});
