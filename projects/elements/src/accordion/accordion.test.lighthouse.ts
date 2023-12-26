import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('accordion lighthouse report', () => {
  test('accordion should meet a lighthouse performance score of 100', async () => {
    const report = await runner.getReport('mlv-accordion', /* html */`
      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading</div>
        </mlv-accordion-header>
        <mlv-accordion-content>
          Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
        </mlv-accordion-content>
      </mlv-accordion>
      <script type="module">
        import '@elements/elements/accordion/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(21);
  });
});
