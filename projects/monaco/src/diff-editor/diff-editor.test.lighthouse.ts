import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('monaco-diff-editor lighthouse report', () => {
  test('monaco-diff-editor should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-diff-editor', /* html */`
      <nve-monaco-diff-editor></nve-monaco-diff-editor>
      <script type="module">
        import '@nvidia-elements/monaco/diff-editor/define.js';

        const diffEditorEl = document.querySelector('nve-monaco-diff-editor');
        diffEditorEl.addEventListener('ready', (event) => {
          const { editor, monaco } = event.target;
          const original = monaco.editor.createModel(
            'Hello World!',
            'plaintext',
            monaco.Uri.parse('diff:///src/example.txt')
          );
          const modified = monaco.editor.createModel(
            'Hello world!',
            'plaintext',
            monaco.Uri.parse('file:///src/example.txt')
          );
          editor.setModel({ original, modified });
        });
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(72);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(1318);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(10.6);
    expect(report.payload.javascript.requests['editor2.global.js'].kb).toBeLessThan(78);
    expect(report.payload.javascript.requests['editor2.main.js'].kb).toBeLessThan(24);
    expect(report.payload.javascript.requests['dist.js'].kb).toBeLessThan(1114);
    expect(report.payload.javascript.requests['dark.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor2.worker.js'].kb).toBeLessThan(88);
  });
});
