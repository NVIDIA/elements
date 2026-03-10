import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('monaco-diff-input lighthouse report', () => {
  test('monaco-diff-input should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-diff-input', /* html */`
      <nve-monaco-diff-input language="plaintext"></nve-monaco-diff-input>
      <script type="module">
        import '@nvidia-elements/monaco/diff-input/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(90);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(1343);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(14.2);
    expect(report.payload.javascript.requests['editor.global.css2.js'].kb).toBeLessThan(78);
    expect(report.payload.javascript.requests['editor.main.css2.js'].kb).toBeLessThan(24);
    expect(report.payload.javascript.requests['index2.js'].kb).toBeLessThan(1145);
    expect(report.payload.javascript.requests['dark.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor.worker2.js'].kb).toBeLessThan(77);
  });

  test('monaco-diff-input language worker bundles should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-diff-input', /* html */`
      <nve-monaco-diff-input language="plaintext"></nve-monaco-diff-input>
      <nve-monaco-diff-input language="css"></nve-monaco-diff-input>
      <nve-monaco-diff-input language="html"></nve-monaco-diff-input>
      <nve-monaco-diff-input language="json"></nve-monaco-diff-input>
      <nve-monaco-diff-input language="typescript"></nve-monaco-diff-input>
      <script type="module">
        import '@nvidia-elements/monaco/diff-input/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(90);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(3419);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(14.2);
    expect(report.payload.javascript.requests['editor.global.css2.js'].kb).toBeLessThan(78);
    expect(report.payload.javascript.requests['editor.main.css2.js'].kb).toBeLessThan(24);
    expect(report.payload.javascript.requests['index2.js'].kb).toBeLessThan(1145);
    expect(report.payload.javascript.requests['dark.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor.worker2.js'].kb).toBeLessThan(77);
    expect(report.payload.javascript.requests['css.worker2.js'].kb).toBeLessThan(234);
    expect(report.payload.javascript.requests['html.worker2.js'].kb).toBeLessThan(183);
    expect(report.payload.javascript.requests['json.worker2.js'].kb).toBeLessThan(115);
    expect(report.payload.javascript.requests['ts.worker2.js'].kb).toBeLessThan(1546);
  });
}); 