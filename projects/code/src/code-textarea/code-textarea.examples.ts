// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

/** @summary Edit TypeScript with syntax coloring and native textarea behavior. Use for short source snippets in forms. */
export const Default = {
  render: () => html`
    <nve-code-textarea language="typescript">
      <label>Source code</label>
      <textarea name="source" rows="6" spellcheck="false">function greet(name: string): string {
  return "Hello, " + name;
}</textarea>
    </nve-code-textarea>
  `
};

/** @summary Edit Markdown containing an embedded TypeScript snippet. Use for authored content that combines prose and code. */
export const Markdown = {
  render: () => html`
    <nve-code-textarea language="markdown">
      <label>Markdown source</label>
      <textarea name="markdown" rows="8" spellcheck="false"># Example

\`\`\`typescript
const answer: number = 42;
\`\`\`
</textarea>
    </nve-code-textarea>
  `
};

/** @summary Submit and reset JSON through a native form. Use for structured configuration with standard browser validation. */
export const Form = {
  render: () => html`
    <form>
      <nve-code-textarea language="json">
        <label>Configuration</label>
        <textarea name="configuration" rows="5" required spellcheck="false">{
  "enabled": true,
  "count": 42
}</textarea>
      </nve-code-textarea>
      <nve-button type="submit">Submit</nve-button>
      <nve-button type="reset">Reset</nve-button>
    </form>
  `
};

export default { title: 'Code/CodeTextarea', component: 'nve-code-textarea' };
