import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('month lighthouse report', () => {
  test('month should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-month', /* html */`
      <nve-month>
        <label>label</label>
        <input type="month" />
      </nve-month>
      <script type="module">
        import '@nvidia-elements/core/month/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(23.8);
  });
});
