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
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(1318);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(11);
    expect(report.payload.javascript.requests['editor2.global.js'].kb).toBeLessThan(78);
    expect(report.payload.javascript.requests['editor2.main.js'].kb).toBeLessThan(24);
    expect(report.payload.javascript.requests['dist.js'].kb).toBeLessThan(1114);
    expect(report.payload.javascript.requests['dark.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor2.worker.js'].kb).toBeLessThan(88);
  });
});
