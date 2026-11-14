// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { CodeBlockFooter } from '@nvidia-elements/code/code-block';
import '@nvidia-elements/code/code-block/define.js';

describe(CodeBlockFooter.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: CodeBlockFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-code-block>
        <nve-code-block-footer>
          <span slot="prefix">Prefix</span>
          <span>Content</span>
          <span slot="suffix">Suffix</span>
        </nve-code-block-footer>
      </nve-code-block>
    `);
    element = fixture.querySelector('nve-code-block-footer')!;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should register the component', () => {
    expect(customElements.get(CodeBlockFooter.metadata.tag)).toBe(CodeBlockFooter);
  });

  it('should reflect its footer slot assignment', () => {
    expect(element.slot).toBe('footer');
    expect(element.getAttribute('slot')).toBe('footer');
  });

  it.each(['', 'prefix', 'suffix'])('should project content through the documented "%s" slot', name => {
    const slot = element.shadowRoot!.querySelector<HTMLSlotElement>(name ? `slot[name="${name}"]` : 'slot:not([name])');
    expect(slot).not.toBeNull();
    const content = element.querySelector(name ? `[slot="${name}"]` : 'span:not([slot])');
    expect(slot!.assignedElements()).toEqual([content]);
  });
});
