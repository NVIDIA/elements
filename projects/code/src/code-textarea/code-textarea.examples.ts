// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/code/languages/json.js';
import '@nvidia-elements/code/languages/markdown.js';
import '@nvidia-elements/code/languages/typescript.js';
import '@nvidia-elements/code/code-textarea/define.js';
import '@nvidia-elements/core/button/define.js';

/** @summary Edit source in a native textarea with live syntax highlighting. */
export const Default = {
  render: () => html`
    <nve-code-textarea language="typescript">
      <label>Source code</label>
      <textarea name="source" rows="8" spellcheck="false">
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;

export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);</textarea>
    </nve-code-textarea>
  `
};

/** @summary Make nested expressions easier to follow by giving matching brackets the same color. */
export const BracketColoring = {
  render: () => html`
    <nve-code-textarea language="typescript" bracket-pair-coloring>
      <label>Nested TypeScript</label>
      <textarea name="source" rows="8" spellcheck="false">
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;

export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);</textarea>
    </nve-code-textarea>
  `
};

/** @summary Highlight source across languages, from Markdown and fenced JavaScript to tagged HTML and CSS templates. */
export const EmbeddedLanguages = {
  render: () => html`
    <nve-code-textarea language="markdown">
      <label>Markdown source</label>
      <textarea name="markdown" rows="10" spellcheck="false">
# Release notes

Show the current build status.

~~~javascript
const status = "Ready";
const badge = html\`&lt;span class="status"&gt;&#36;{status}&lt;/span&gt;\`;
const styles = css\`.status { color: seagreen; }\`;
~~~</textarea>
    </nve-code-textarea>
  `
};

/** @summary Fit highlighted source into the surrounding surface. */
export const Flat = {
  render: () => html`
    <nve-code-textarea language="typescript" container="flat">
      <label>Source code</label>
      <textarea name="source" rows="8" spellcheck="false">
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;

export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);</textarea>
    </nve-code-textarea>
  `
};

/** @summary Submit and reset a highlighted JSON field with native required-field validation. */
export const Form = {
  render: () => html`
    <form id="code-textarea-form" nve-layout="column gap:md align:horizontal-stretch">
      <nve-code-textarea language="json">
        <label>Configuration</label>
        <textarea name="configuration" rows="5" required spellcheck="false">
{
  "gpu": "B200",
  "batchSize": 16,
  "precision": "fp16"
}</textarea>
      </nve-code-textarea>
      <div nve-layout="row gap:xs">
        <nve-button type="submit">Submit</nve-button>
        <nve-button type="reset">Reset</nve-button>
      </div>
    </form>
    <script type="module">
      const form = document.querySelector('#code-textarea-form');
      form.addEventListener('submit', event => {
        event.preventDefault();
        console.log('submit', Object.fromEntries(new FormData(form)));
      });
    </script>
  `
};

export default { title: 'Code/CodeTextarea', component: 'nve-code-textarea' };
