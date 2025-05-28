import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('dropzone lighthouse report', () => {
  test('dropzone should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-dropzone', /* html */`
      <nve-dropzone></nve-dropzone>
      <script type="module">
        import '@nvidia-elements/core/dropzone/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(17.5);
  });
});
