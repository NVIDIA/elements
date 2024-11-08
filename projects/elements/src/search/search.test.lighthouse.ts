import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('search lighthouse report', () => {
  test('search should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-search', /* html */`
      <nve-search>
        <label>label</label>
        <input type="search" />
      </nve-search>
      <script type="module">
        import '@nvidia-elements/core/search/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(22.1);
  });
});
