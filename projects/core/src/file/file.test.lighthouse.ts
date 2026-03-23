import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('file lighthouse report', () => {
  test('file should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-file', /* html */`
      <nve-file>
        <label>label</label>
        <input type="file" />
      </nve-file>
      <script type="module">
        import '@nvidia-elements/core/file/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(19.5);
  });
});
