// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/monaco/diff-input/define.js';

export default {
  title: 'Monaco/Diff Input',
  component: 'nve-monaco-diff-input'
};

/**
 * @summary Basic diff input comparing original and modified code with input/change event listeners
 */
export const Default = {
  render: () => html`
<nve-monaco-diff-input language="typescript" original="console.log('Hello, World!');"  value="console.log('Hello, world!');"></nve-monaco-diff-input>
<script type="module">
  const input = document.querySelector('nve-monaco-diff-input');
  input.addEventListener('input', () => console.log('input: ', input.value));
  input.addEventListener('change', () => console.log('change: ', input.value));
</script>
`
};

/**
 * @summary Diff input with optional features: line numbers, code folding, minimap, and side-by-side layout
 */
export const WithOptionalAttributes = {
  render: () => html`
<nve-monaco-diff-input original="console.log('Hello, World!');" value="console.log('Hello, world!');" line-numbers="on" folding minimap side-by-side></nve-monaco-diff-input>
`
};

/**
 * @summary Read-only diff input for displaying non-editable code comparisons
 */
export const ReadOnly = {
  render: () => html`
<nve-monaco-diff-input original="console.log('Hello, World!');" value="console.log('Hello, world!');" readonly></nve-monaco-diff-input>
`
};

/**
 * @summary Disabled diff input preventing user interaction
 */
export const Disabled = {
  render: () => html`
<nve-monaco-diff-input original="console.log('Hello, World!');" value="console.log('Hello, world!');" disabled></nve-monaco-diff-input>
`
};

/**
 * @summary Diff input integrated with nve-control for form labels and help messages
 */
export const Control = {
  render: () => html`
  <nve-control>
    <label>label</label>
    <nve-monaco-diff-input original="console.log('Hello, World!');" value="console.log('Hello, world!');" nve-control language="javascript"></nve-monaco-diff-input>
    <nve-control-message>message<span id="emoji"></span></nve-control-message>
  </nve-control>
  `
};

/**
 * @summary JSON diff input with schema validation in a form context, blocking submission on errors
 */
export const JSONSchemaValidation = {
  render: () => html`
  <form id="json-schema-validation-example" nve-layout="column gap:lg">
    <nve-control style="width: 100%;">
      <label>JSON Configuration</label>
      <nve-monaco-diff-input 
        nve-control 
        name="config" 
        language="json"
        line-numbers="on" 
        side-by-side
      ></nve-monaco-diff-input>
      <nve-control-message>JSON schema validation errors will prevent form submission</nve-control-message>
    </nve-control>
    <nve-button type="submit">Submit</nve-button>
  </form>

  <script type="module">
    const form = document.querySelector('form#json-schema-validation-example');
    const input = form.querySelector('nve-monaco-diff-input');
    input.schema = {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        version: { type: 'string', pattern: '^\\\\d+\\\\.\\\\d+\\\\.\\\\d+$', description: 'Semantic version number' },
        description: { type: 'string', description: 'Project description' }
      },
      required: ['name', 'version']
    };
    input.original = JSON.stringify({
      name: "my-original-app",
      version: "0.0.0"
    }, null, 2);
    input.value = JSON.stringify({
      name: "my-modified-app",
      version: "1.0.0"
    }, null, 2);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      console.log('Form data:', {
        config: formData.get('config')
      });
    });
  </script>
  `
};

/**
 * @summary TypeScript diff input with real-time type checking that blocks form submission on errors
 */
export const TypeScriptValidation = {
  render: () => html`
  <form id="typescript-validation-example" nve-layout="column gap:lg">
    <nve-control style="width: 100%;">
      <label>TypeScript Code</label>
      <nve-monaco-diff-input nve-control name="code" language="typescript" line-numbers="on" side-by-side></nve-monaco-diff-input>
      <nve-control-message>TypeScript validation errors will prevent form submission</nve-control-message>
    </nve-control>
    <nve-button type="submit">Submit</nve-button>
  </form>

  <script type="module">
    const form = document.querySelector('form#typescript-validation-example');
    const input = form.querySelector('nve-monaco-diff-input');
    input.original = 'const x: number = 42;';
    input.value = 'const x: number = "string"; // Type error';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      console.log('Form data:', {
        code: formData.get('code')
      });
    });
  </script>
  `
};