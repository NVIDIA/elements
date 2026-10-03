// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { CodeTextarea } from '@nvidia-elements/code/code-textarea';
import '@nvidia-elements/code/code-textarea/define.js';

describe(CodeTextarea.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-code-textarea>
        <label>label</label>
        <textarea name="source">  const initial = 42;
</textarea>
      </nve-code-textarea>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-code-textarea')).toBe(true);
    expect(result.includes('  const initial = 42;\n')).toBe(true);
    expect(result.includes('nve-code-keyword')).toBe(false);
  });
});
