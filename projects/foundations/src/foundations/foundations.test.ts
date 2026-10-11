// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Foundations } from '@nvidia-elements/foundations/foundations';
import '@nvidia-elements/foundations/foundations/define.js';

describe(Foundations.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Foundations;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-foundations><p nve-text="body">Container content</p></nve-foundations>
    `);
    element = fixture.querySelector(Foundations.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Foundations.metadata.tag)).toBeDefined();
  });

  it('should display content through the default slot', () => {
    const slot = element.shadowRoot.querySelector('slot');
    expect(slot.assignedElements()).toEqual([element.querySelector('p')]);
  });

  it('should display content added after rendering', async () => {
    const content = document.createElement('p');
    content.textContent = 'Additional content';
    element.append(content);
    await elementIsStable(element);

    const slot = element.shadowRoot.querySelector('slot');
    expect(slot.assignedElements()).toContain(content);
  });
});
