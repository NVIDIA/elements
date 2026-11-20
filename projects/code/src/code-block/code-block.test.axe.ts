// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CDPSession } from '@vitest/browser-playwright';
import { html } from 'lit';
import { cdp, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { CodeBlock } from '@nvidia-elements/code/code-block';
import '@nvidia-elements/code/code-block/define.js';
import '@nvidia-elements/code/languages/javascript.js';
import '@nvidia-elements/themes/index.css';
import '@nvidia-elements/themes/dark.css';

describe(CodeBlock.metadata.tag, () => {
  it.each(['light', 'dark'])('keeps %s decorations out of the accessibility tree and tab order', async theme => {
    const fixture = await createFixture(html`
      <nve-code-block
        nve-theme=${theme}
        language="javascript"
        .code=${'const value = "text";\n\n// comment\nconst enabled = true;'}
        .lineNumbers=${true}
        highlight="1-3"
      ><button slot="actions" type="button">Copy source</button></nve-code-block>
    `);
    try {
      const element = fixture.querySelector('nve-code-block');
      if (!element) throw new Error('Missing codeblock');
      await elementIsStable(element);
      const layer = element.shadowRoot?.querySelector<HTMLElement>('[data-lines]');
      expect(layer?.getAttribute('aria-hidden')).toBe('true');
      expect(layer?.inert).toBe(true);
      const results = await runAxe([CodeBlock.metadata.tag]);
      expect(results.violations).toEqual([]);
      const session: CDPSession = cdp();
      const { frameTree } = await session.send('Page.getFrameTree');
      const frame = frameTree.childFrames?.find(child => child.frame.url === location.href)?.frame;
      if (!frame) throw new Error('Missing test browser frame');
      const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frame.id });
      const names = nodes.filter(node => !node.ignored).map(node => node.name?.value);
      expect(names).toContain('Copy source');
      expect(names.some(name => ['1', '2', '3', '4', '1\n2\n3\n4'].includes(name))).toBe(false);
      await userEvent.tab();
      expect(document.activeElement).toBe(element.querySelector('button'));
    } finally {
      removeFixture(fixture);
    }
  });
});

describe(CodeBlock.metadata.tag, () => {
  it('should pass axe check for status', async () => {
    const fixture = await createFixture(html`
      <nve-code-block language="text">
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
