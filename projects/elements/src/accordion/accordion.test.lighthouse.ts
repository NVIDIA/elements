import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('accordion lighthouse report', () => {
  test('accordion should meet a lighthouse performance score of 100', async () => {
    const report = await lighthouseRunner.getReport('nve-accordion', /* html */`
      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading</div>
        </nve-accordion-header>
        <nve-accordion-content>
          Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
        </nve-accordion-content>
      </nve-accordion>
      <script type="module">
        import '@nvidia-elements/core/accordion/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(19);
  });
});
