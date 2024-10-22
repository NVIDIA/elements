import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('copy-button lighthouse report', () => {
  test('copy-button should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-copy-button', /* html */`
      <nve-copy-button value="copy button"></nve-copy-button>
      <script type="module">
        import '@nvidia-elements/core/copy-button/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(24);
  });
});
