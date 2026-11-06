// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { CodeBlock } from '@nvidia-elements/code/code-block';
import '@nvidia-elements/code/code-block/define.js';

describe(CodeBlock.metadata.tag, () => {
  it('should pass axe check for status', async () => {
    const fixture = await createFixture(html`
      <nve-code-block language="shell">
        <nve-code-block-header>
          <span slot="prefix" nve-text="body">Shell</span>
          <span nve-text="body">Install</span>
          <button slot="suffix">Copy command</button>
        </nve-code-block-header>
        <template>pnpm install</template>
        <button slot="actions">Copy source</button>
        <nve-code-block-footer>
          <span slot="prefix" nve-text="body">Status</span>
          <span nve-text="body">Ready</span>
          <button slot="suffix">Run command</button>
        </nve-code-block-footer>
      </nve-code-block>
    `);

    await elementIsStable(fixture.querySelector(CodeBlock.metadata.tag)!);
    const results = await runAxe([CodeBlock.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
