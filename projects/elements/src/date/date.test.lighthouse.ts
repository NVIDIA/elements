import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('date lighthouse report', () => {
  test('date should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-date', /* html */`
      <nve-date>
        <label>label</label>
        <input type="date" />
      </nve-date>
      <script type="module">
        import '@nvidia-elements/core/date/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(22.6);
  });
});
