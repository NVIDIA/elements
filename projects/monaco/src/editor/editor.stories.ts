import { html } from 'lit';
import '@nvidia-elements/monaco/editor/define.js';

export default {
  title: 'Monaco/Editor',
  component: 'nve-monaco-editor'
};

export const Default = {
  render: () => html`
<nve-monaco-editor></nve-monaco-editor>
`
};
