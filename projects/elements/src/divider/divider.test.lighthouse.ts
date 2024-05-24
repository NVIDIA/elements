import { expect, test, describe } from 'vitest';
import { runner } from '@nvidia-elements/testing-lighthouse';

describe('divider lighthouse report', () => {
  test('divider should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-divider', /* html */`
      <nve-divider></nve-divider>
      <script type="module">
        import '@nvidia-elements/core/divider/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(8.4);
  });
});
