import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('page lighthouse report', () => {
  test('page should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-page', /* html */`
      <nve-page>
        <nve-page-panel slot="left">
          <nve-page-panel-header></nve-page-panel-header>
          <nve-page-panel-content></nve-page-panel-content>
          <nve-page-panel-footer></nve-page-panel-footer>
        </nve-page-panel>
      </nve-page>
      <script type="module">
        import '@nvidia-elements/core/page/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(21.6);
  });
});
