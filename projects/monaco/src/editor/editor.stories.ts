import { html } from 'lit';
import '@nvidia-elements/monaco/editor/define.js';

export default {
  title: 'Monaco/Editor',
  component: 'nve-monaco-editor'
};

export const Default = {
  render: () => html`
<nve-monaco-editor language="javascript"></nve-monaco-editor>
<script type="module">
  const editor = document.querySelector('nve-monaco-editor');
  editor.addEventListener('input', () => console.log(editor.value));
  editor.source = 'console.log("Hello, world!");';
</script>
`
};
