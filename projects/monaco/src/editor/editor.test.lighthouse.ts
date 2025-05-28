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

    expect(report.scores.performance).toBeGreaterThanOrEqual(95);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(89);
    expect(report.payload.javascript.kb).toBeLessThan(1186);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(10);
    expect(report.payload.javascript.requests['monaco.global.css.js'].kb).toBeLessThan(57);
    expect(report.payload.javascript.requests['editor.main.css.js'].kb).toBeLessThan(22);
    expect(report.payload.javascript.requests['editor.main.js'].kb).toBeLessThan(1021);
    expect(report.payload.javascript.requests['dark.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor.worker2.js'].kb).toBeLessThan(72);
  });
});
