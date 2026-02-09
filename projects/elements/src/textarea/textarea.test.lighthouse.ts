import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('textarea lighthouse report', () => {
  test('textarea should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-textarea', /* html */`
      <nve-textarea>
        <label>label</label>
        <textarea></textarea>
      </nve-textarea>
      <script type="module">
        import '@nvidia-elements/core/textarea/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(19.4);
  });
});
