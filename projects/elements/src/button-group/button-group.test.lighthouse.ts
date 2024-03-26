import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('button-group lighthouse report', () => {
  test('button-group should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-button-group', /* html */`
      <mlv-button-group>
        <mlv-icon-button pressed icon-name="split-vertical" aria-label="split vertical"></mlv-icon-button>
        <mlv-icon-button icon-name="split-horizontal" aria-label="split horizontal"></mlv-icon-button>
        <mlv-icon-button icon-name="split-none" aria-label="split none"></mlv-icon-button>
      </mlv-button-group>
      <script type="module">
        import '@elements/elements/button-group/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(10.3);
  });
});
