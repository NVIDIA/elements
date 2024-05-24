import { expect, test, describe } from 'vitest';
import { runner } from '@nvidia-elements/testing-lighthouse';

describe('tag lighthouse report', () => {
  test('tag should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-tag', /* html */`
      <nve-tag>tag</nve-tag>
      <script type="module">
        import '@nvidia-elements/core/tag/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(18);
  });
});
