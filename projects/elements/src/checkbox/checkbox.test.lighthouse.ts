import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('checkbox lighthouse report', () => {
  test('checkbox should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-checkbox', /* html */`
        <nve-checkbox>
          <label>label</label>
          <input type="checkbox" />
        </nve-checkbox>
        <script type="module">
          import '@nvidia-elements/core/checkbox/define.js';
        </script>
      `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(20.7);
  });
});
