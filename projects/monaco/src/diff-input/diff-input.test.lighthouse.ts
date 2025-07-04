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
    expect(report.scores.bestPractices).toBe(89);
    expect(report.payload.javascript.kb).toBeLessThan(1190);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(14);
    expect(report.payload.javascript.requests['editor.global.css2.js'].kb).toBeLessThan(57);
    expect(report.payload.javascript.requests['editor.main.css2.js'].kb).toBeLessThan(22);
    expect(report.payload.javascript.requests['index2.js'].kb).toBeLessThan(1022);
    expect(report.payload.javascript.requests['dark.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor.worker2.js'].kb).toBeLessThan(72);
  });

  test('monaco-diff-input should meet lighthouse benchmarks for CSS', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-diff-input_css', /* html */`
      <nve-monaco-diff-input language="css"></nve-monaco-diff-input>
      <script type="module">
        import '@nvidia-elements/monaco/diff-input/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(90);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(89);
    expect(report.payload.javascript.kb).toBeLessThan(1418);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(14);
    expect(report.payload.javascript.requests['editor.global.css2.js'].kb).toBeLessThan(57);
    expect(report.payload.javascript.requests['editor.main.css2.js'].kb).toBeLessThan(22);
    expect(report.payload.javascript.requests['index2.js'].kb).toBeLessThan(1022);
    expect(report.payload.javascript.requests['dark.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['css.worker2.js'].kb).toBeLessThan(229);
    expect(report.payload.javascript.requests['editor.worker2.js'].kb).toBeLessThan(72);
  });

  test('monaco-diff-input should meet lighthouse benchmarks for HTML', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-diff-input_html', /* html */`
      <nve-monaco-diff-input language="html"></nve-monaco-diff-input>
      <script type="module">
        import '@nvidia-elements/monaco/diff-input/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(90);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(89);
    expect(report.payload.javascript.kb).toBeLessThan(1367);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(14);
    expect(report.payload.javascript.requests['editor.global.css2.js'].kb).toBeLessThan(57);
    expect(report.payload.javascript.requests['editor.main.css2.js'].kb).toBeLessThan(22);
    expect(report.payload.javascript.requests['index2.js'].kb).toBeLessThan(1022);
    expect(report.payload.javascript.requests['dark.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor.worker2.js'].kb).toBeLessThan(72);
    expect(report.payload.javascript.requests['html.worker2.js'].kb).toBeLessThan(178);
  });

  test('monaco-diff-input should meet lighthouse benchmarks for JSON', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-diff-input_json', /* html */`
      <nve-monaco-diff-input language="json"></nve-monaco-diff-input>
      <script type="module">
        import '@nvidia-elements/monaco/diff-input/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(90);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(89);
    expect(report.payload.javascript.kb).toBeLessThan(1299);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(14);
    expect(report.payload.javascript.requests['editor.global.css2.js'].kb).toBeLessThan(57);
    expect(report.payload.javascript.requests['editor.main.css2.js'].kb).toBeLessThan(22);
    expect(report.payload.javascript.requests['index2.js'].kb).toBeLessThan(1022);
    expect(report.payload.javascript.requests['dark.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor.worker2.js'].kb).toBeLessThan(72);
    expect(report.payload.javascript.requests['json.worker2.js'].kb).toBeLessThan(110);
  });

  test('monaco-diff-input should meet lighthouse benchmarks for TypeScript', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-diff-input_typescript', /* html */`
      <nve-monaco-diff-input language="typescript"></nve-monaco-diff-input>
      <script type="module">
        import '@nvidia-elements/monaco/diff-input/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(90);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(89);
    expect(report.payload.javascript.kb).toBeLessThan(2558);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(14);
    expect(report.payload.javascript.requests['editor.global.css2.js'].kb).toBeLessThan(57);
    expect(report.payload.javascript.requests['editor.main.css2.js'].kb).toBeLessThan(22);
    expect(report.payload.javascript.requests['index2.js'].kb).toBeLessThan(1022);
    expect(report.payload.javascript.requests['dark.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor.worker2.js'].kb).toBeLessThan(72);
    expect(report.payload.javascript.requests['ts.worker2.js'].kb).toBeLessThan(1368);
  });
}); 