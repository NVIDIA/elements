import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('toolbar lighthouse report', () => {
  test('toolbar should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-toolbar', /* html */`
      <mlv-toolbar>
        <mlv-button interaction="flat"><mlv-icon name="add"></mlv-icon> create</mlv-button>
        <mlv-button interaction="flat"><mlv-icon name="delete"></mlv-icon> delete</mlv-button>
        <mlv-icon-button interaction="flat" icon-name="gear" slot="suffix" aria-label="settings"></mlv-icon-button>
      </mlv-toolbar>
      <script type="module">
        import '@elements/elements/toolbar/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(19);
  });
});
