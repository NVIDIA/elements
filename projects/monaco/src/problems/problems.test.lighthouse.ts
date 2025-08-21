import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('monaco-problems lighthouse report', () => {
  test('monaco-problems should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-problems', /* html */`
      <nve-monaco-problems></nve-monaco-problems>
      <script type="module">
        import '@nvidia-elements/monaco/problems/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(90);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(1190);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(13);
    expect(report.payload.javascript.requests['editor.global.css2.js'].kb).toBeLessThan(57);
    expect(report.payload.javascript.requests['editor.main.css2.js'].kb).toBeLessThan(22);
    expect(report.payload.javascript.requests['index2.js'].kb).toBeLessThan(1022);
    expect(report.payload.javascript.requests['dark.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['problems-format.css.js'].kb).toBeLessThan(1);
    expect(report.payload.javascript.requests['editor.worker2.js'].kb).toBeLessThan(72);
  });
}); 