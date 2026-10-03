// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { cdp, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { CodeBlock } from '@nvidia-elements/code/codeblock';
import '@nvidia-elements/code/codeblock/define.js';
import '@nvidia-elements/code/codeblock/languages/javascript.js';
import '@nvidia-elements/themes/index.css';
import '@nvidia-elements/themes/dark.css';

describe(CodeBlock.metadata.tag, () => {
  it.each(['light', 'dark'])('keeps %s decorations out of the accessibility tree and tab order', async theme => {
    const fixture = await createFixture(html`
      <nve-codeblock
        nve-theme=${theme}
        language="javascript"
        .code=${'const value = "text";\n\n// comment\nconst enabled = true;'}
        .lineNumbers=${true}
        highlight="1-3"
      ><button slot="actions" type="button">Copy source</button></nve-codeblock>
    `);
    try {
      const element = fixture.querySelector('nve-codeblock');
      if (!element) throw new Error('Missing codeblock');
      await elementIsStable(element);
      const layer = element.shadowRoot?.querySelector<HTMLElement>('[data-lines]');
      expect(layer?.getAttribute('aria-hidden')).toBe('true');
      expect(layer?.inert).toBe(true);
      const results = await runAxe([CodeBlock.metadata.tag]);
      expect(results.violations).toEqual([]);
      const { frameTree } = await cdp().send('Page.getFrameTree');
      const frame = frameTree.childFrames?.find(child => child.frame.url === location.href)?.frame;
      if (!frame) throw new Error('Missing test browser frame');
      const { nodes } = await cdp().send('Accessibility.getFullAXTree', { frameId: frame.id });
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
