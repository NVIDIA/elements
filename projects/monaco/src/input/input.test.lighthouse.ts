import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('monaco-input lighthouse report', () => {
  test('monaco-input should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-input', /* html */`
      <nve-monaco-input></nve-monaco-input>
      <nve-monaco-input language="css"></nve-monaco-input>
      <nve-monaco-input language="html"></nve-monaco-input>
      <nve-monaco-input language="javascript"></nve-monaco-input>
      <nve-monaco-input language="json"></nve-monaco-input>
      <nve-monaco-input language="typescript"></nve-monaco-input>
      <script type="module">
        import '@nvidia-elements/monaco/input/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThan(95);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(89);
    expect(report.payload.javascript.kb).toBeLessThan(2950);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(13);
    expect(report.payload.javascript.requests['monaco.global.css.js'].kb).toBeLessThan(57);
    expect(report.payload.javascript.requests['editor.main.css.js'].kb).toBeLessThan(22);
    expect(report.payload.javascript.requests['editor.main.js'].kb).toBeLessThan(850);
    expect(report.payload.javascript.requests['dark.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['css.js'].kb).toBeLessThan(2);
    expect(report.payload.javascript.requests['html.js'].kb).toBeLessThan(2);
    expect(report.payload.javascript.requests['javascript.js'].kb).toBeLessThan(1);
    expect(report.payload.javascript.requests['typescript.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['cssMode.js'].kb).toBeLessThan(10);
    expect(report.payload.javascript.requests['htmlMode.js'].kb).toBeLessThan(10);
    expect(report.payload.javascript.requests['jsonMode.js'].kb).toBeLessThan(13);
    expect(report.payload.javascript.requests['tsMode.js'].kb).toBeLessThan(7);
    expect(report.payload.javascript.requests['editor.worker2.js'].kb).toBeLessThan(73);
    expect(report.payload.javascript.requests['css.worker2.js'].kb).toBeLessThan(230);
    expect(report.payload.javascript.requests['html.worker2.js'].kb).toBeLessThan(180);
    expect(report.payload.javascript.requests['json.worker2.js'].kb).toBeLessThan(111);
    expect(report.payload.javascript.requests['ts.worker2.js'].kb).toBeLessThan(1370);
  });
}); 