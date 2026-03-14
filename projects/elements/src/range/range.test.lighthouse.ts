import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('range lighthouse report', () => {
  test('range should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-range', /* html */`
      <nve-range>
        <label>label</label>
        <input type="range" value="50" />
      </nve-range>
      <script type="module">
        import '@nvidia-elements/core/range/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(20.5);
  });
});
