import { html } from 'lit';
import '@nvidia-elements/monaco/diff-editor/define.js';

export default {
  title: 'Monaco/Diff Editor',
  component: 'nve-monaco-diff-editor'
};

export const Default = {
  render: () => html`
<nve-monaco-diff-editor></nve-monaco-diff-editor>
<script type="module">
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
`
};
