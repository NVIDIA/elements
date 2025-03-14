import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('sort-button lighthouse report', () => {
  test('sort-button should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-sort-button', /* html */`
      <nve-sort-button aria-label="sort"></nve-sort-button>
      <script type="module">
        import '@nvidia-elements/core/sort-button/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(16.6);
  });
});
