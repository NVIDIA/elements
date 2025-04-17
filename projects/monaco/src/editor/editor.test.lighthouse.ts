import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('monaco-editor lighthouse report', () => {
  test('monaco-editor should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-editor', /* html */`
      <nve-monaco-editor></nve-monaco-editor>
      <script type="module">
        import '@nvidia-elements/monaco/editor/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(89);
    expect(report.payload.javascript.kb).toBeLessThan(1250);
  });
});
