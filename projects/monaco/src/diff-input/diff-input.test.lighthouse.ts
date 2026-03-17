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
    expect(report.payload.javascript.kb).toBeLessThan(1320);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(14.2);
    expect(report.payload.javascript.requests['editor2.global.js'].kb).toBeLessThan(78);
    expect(report.payload.javascript.requests['editor2.main.js'].kb).toBeLessThan(24);
    expect(report.payload.javascript.requests['dist.js'].kb).toBeLessThan(1114);
    expect(report.payload.javascript.requests['dark.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor2.worker.js'].kb).toBeLessThan(88);
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
    expect(report.payload.javascript.kb).toBeLessThan(3367);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(14.2);
    expect(report.payload.javascript.requests['editor2.global.js'].kb).toBeLessThan(78);
    expect(report.payload.javascript.requests['editor2.main.js'].kb).toBeLessThan(24);
    expect(report.payload.javascript.requests['dist.js'].kb).toBeLessThan(1114);
    expect(report.payload.javascript.requests['dark.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor2.worker.js'].kb).toBeLessThan(88);
    expect(report.payload.javascript.requests['css2.worker.js'].kb).toBeLessThan(243);
    expect(report.payload.javascript.requests['html2.worker.js'].kb).toBeLessThan(192);
    expect(report.payload.javascript.requests['json2.worker.js'].kb).toBeLessThan(124);
    expect(report.payload.javascript.requests['ts2.worker.js'].kb).toBeLessThan(1492);
  });
});