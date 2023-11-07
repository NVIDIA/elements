import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('menu lighthouse report', () => {
  test('menu should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-menu', /* html */`
      <mlv-menu>
        <mlv-menu-item>item 1</mlv-menu-item>
        <mlv-menu-item>item 2</mlv-menu-item>
        <mlv-menu-item>item 3</mlv-menu-item>
        <mlv-menu-item>item 4</mlv-menu-item>
      </mlv-menu>
      <script type="module">
        import '@elements/elements/menu/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(11.5);
  });
});
