// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { CodeBlock } from '@nvidia-elements/code/code-block';
import '@nvidia-elements/code/code-block/define.js';

describe(CodeBlock.metadata.tag, () => {
  it('should render its shadow root and preserve source and actions', async () => {
    const result = await ssrRunner.render(html`
      <nve-code-block>
        <nve-code-block-header><span slot="prefix">Shell</span>Install<button slot="suffix">Copy</button></nve-code-block-header>
        <pre><code nve-text="code">echo hello</code></pre>
        <nve-code-block-footer><span slot="prefix">Status</span>Ready<button slot="suffix">Run</button></nve-code-block-footer>
        <button slot="actions">Copy code</button>
      </nve-code-block>
    `);

    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('nve-code-block');
    expect(result).toContain('slot="header"');
    expect(result).toContain('slot="footer"');
    expect(result).toContain('<span slot="prefix">Shell</span>');
    expect(result).toContain('<button slot="suffix">Run</button>');
    expect(result).toContain('class="hljs"');
    expect(result).toContain('<pre><code nve-text="code">echo hello</code></pre>');
    expect(result).toContain('<button slot="actions">Copy code</button>');
  });
});
