import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('time lighthouse report', () => {
  test('time should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-time', /* html */`
      <nve-time>
        <label>label</label>
        <input type="time" />
      </nve-time>
      <script type="module">
        import '@nvidia-elements/core/time/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(22.6);
  });
});
