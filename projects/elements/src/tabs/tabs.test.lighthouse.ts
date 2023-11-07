import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('tabs lighthouse report', () => {
  test('tabs should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-tabs', /* html */`
      <mlv-tabs>
        <mlv-tabs-item>Tab 1</mlv-tabs-item>
        <mlv-tabs-item selected>Tab 2</mlv-tabs-item>
        <mlv-tabs-item disabled>Tab 3</mlv-tabs-item>
      </mlv-tabs>
      <script type="module">
        import '@elements/elements/tabs/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(87);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(11.5);
  });
});
