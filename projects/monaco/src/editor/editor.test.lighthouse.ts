import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('monaco-editor lighthouse report', () => {
  test('monaco-editor should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-editor', /* html */`
      <nve-monaco-editor></nve-monaco-editor>
      <script type="module">
        import '@nvidia-elements/monaco/editor/define.js';
        const diffEditorEl = document.querySelector('nve-monaco-editor');
        diffEditorEl.addEventListener('ready', (event) => {
          const { editor, monaco } = event.target;
          const model = monaco.editor.createModel(
            'Hello World!',
            'plaintext'
          );
          editor.setModel(model);
        });
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(72);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(88);
    expect(report.payload.javascript.kb).toBeLessThan(1186);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(10);
    expect(report.payload.javascript.requests['editor.global.css2.js'].kb).toBeLessThan(57);
    expect(report.payload.javascript.requests['editor.main.css2.js'].kb).toBeLessThan(22);
    expect(report.payload.javascript.requests['index2.js'].kb).toBeLessThan(1022);
    expect(report.payload.javascript.requests['dark.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.json.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor.worker2.js'].kb).toBeLessThan(72);
  });
});
