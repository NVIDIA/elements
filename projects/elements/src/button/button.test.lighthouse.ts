import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('button lighthouse report', () => {
  test('button should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-button', /* html */`
      <mlv-button>button</mlv-button>
      <mlv-button interaction="emphasis">button</mlv-button>
      <mlv-button interaction="destructive">button</mlv-button>
      <script type="module">
        import '@elements/elements/button/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(87);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(10.6);
  });
});
