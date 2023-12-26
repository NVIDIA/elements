import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('breadcrumb lighthouse report', () => {
  test('breadcrumb should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-breadcrumb', /* html */`
      <mlv-breadcrumb>
        <mlv-icon-button icon-name="home" aria-label="link to first page"></mlv-icon-button>
        <mlv-button>Item</mlv-button>
        <span>Static item</span>
      </mlv-breadcrumb>
      <script type="module">
        import '@elements/elements/breadcrumb/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(18);
  });
});
