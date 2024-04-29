import { expect, test, describe } from 'vitest';
import { runner } from '@nvidia-elements/lighthouse';

describe('grid lighthouse report', () => {
  test('grid should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-grid', /* html */`
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
    expect(report.scores.accessibility).toBe(83);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(20.4);
  });
});
