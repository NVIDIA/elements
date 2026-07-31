// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { CodeBlock } from '@nvidia-elements/code/codeblock';
import '@nvidia-elements/code/codeblock/define.js';

describe(CodeBlock.metadata.tag, () => {
  it('should render its shadow root and preserve source and actions', async () => {
    const result = await ssrRunner.render(html`
      <nve-codeblock>
        <pre><code nve-text="code">echo hello</code></pre>
        <button slot="actions">Copy code</button>
      </nve-codeblock>
    `);

    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('nve-codeblock');
    expect(result).toContain('class="hljs"');
    expect(result).toContain('<pre><code nve-text="code">echo hello</code></pre>');
    expect(result).toContain('<button slot="actions">Copy code</button>');
  });
});
