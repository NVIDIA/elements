import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('markdown lighthouse report', () => {
  test('markdown should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-markdown', /* html */`
      <nve-markdown>1</nve-markdown>
      <script type="module">
        import '@nvidia-elements/markdown/markdown/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(12);
  });
});
