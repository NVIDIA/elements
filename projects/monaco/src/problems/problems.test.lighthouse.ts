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
    expect(report.payload.javascript.kb).toBeLessThan(1342);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(13);
    expect(report.payload.javascript.requests['editor.global.css2.js'].kb).toBeLessThan(78);
    expect(report.payload.javascript.requests['editor.main.css2.js'].kb).toBeLessThan(24);
    expect(report.payload.javascript.requests['index2.js'].kb).toBeLessThan(1147);
    expect(report.payload.javascript.requests['dark.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['problems-format.css.js'].kb).toBeLessThan(1);
    expect(report.payload.javascript.requests['editor.worker2.js'].kb).toBeLessThan(77);
  });
}); 