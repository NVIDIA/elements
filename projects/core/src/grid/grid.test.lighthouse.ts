import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('grid lighthouse report', () => {
  test('grid should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-grid', /* html */`
      <nve-grid aria-label="grid example">
        <nve-grid-header>
          <nve-grid-column>column 1</nve-grid-column>
          <nve-grid-column>column 2</nve-grid-column>
          <nve-grid-column>column 3</nve-grid-column>
          <nve-grid-column>column 4</nve-grid-column>
        </nve-grid-header>
        <nve-grid-row>
          <nve-grid-cell>cell 1-1</nve-grid-cell>
          <nve-grid-cell>cell 1-2</nve-grid-cell>
          <nve-grid-cell>cell 1-3</nve-grid-cell>
          <nve-grid-cell>cell 1-4</nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
      <script type="module">
        import '@nvidia-elements/core/grid/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(91); // https://github.com/dequelabs/axe-core/issues/4259
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(23.5);
  });
});
