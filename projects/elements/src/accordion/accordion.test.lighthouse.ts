import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('accordion lighthouse report', () => {
  test('accordion should meet a lighthouse performance score of 100', async () => {
    const report = await lighthouseRunner.getReport('nve-accordion', /* html */`
      <nve-accordion>
        <nve-accordion-header>
          <h2 nve-text="heading" slot="prefix">heading</h2>
        </nve-accordion-header>
        <nve-accordion-content>
          <p nve-text="body">content</p>
        </nve-accordion-content>
      </nve-accordion>
      <script type="module">
        import '@nvidia-elements/core/accordion/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(22.7);
  });
});
