import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('page-header lighthouse report', () => {
  test('page-header should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-page-header', /* html */`
      <nve-page-header></nve-page-header>
      <script type="module">
        import '@nvidia-elements/core/page-header/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(8.5);
  });
});
