import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('format-datetime lighthouse report', () => {
  test('format-datetime should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-format-datetime', /* html */`
      <nve-format-datetime date-style="long">2023-07-28T04:20:17.434Z</nve-format-datetime>
      <script type="module">
        import '@nvidia-elements/core/format-datetime/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(12);
  });
});
