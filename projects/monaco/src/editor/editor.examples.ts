// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/monaco/editor/define.js';

export default {
  title: 'Monaco/Editor',
  component: 'nve-monaco-editor'
};

/**
 * @summary Basic Monaco editor with model creation via the ready event
 * @tags test-case
 */
export const Default = {
  render: () => html`
<nve-monaco-editor></nve-monaco-editor>
<script type="module">
  const editor = document.querySelector('nve-monaco-editor');
  editor.addEventListener('ready', (event) => {
    const { editor, monaco } = event.target;
    const model = monaco.editor.createModel(
      'Hello World!',
      'plaintext'
    );
    editor.setModel(model);
  });
</script>
`
};
