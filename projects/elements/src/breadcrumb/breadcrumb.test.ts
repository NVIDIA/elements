// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Breadcrumb } from '@nvidia-elements/core/breadcrumb';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/breadcrumb/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe(Breadcrumb.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Breadcrumb;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-breadcrumb>
        <nve-icon-button icon-name="home"><a href="#" aria-label="link to first page"></a></nve-icon-button>
        <nve-button><a href="#">Item</a></nve-button>
        <span>Static item</span>
      </nve-breadcrumb>
    `);
    element = fixture.querySelector(Breadcrumb.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Breadcrumb.metadata.tag)).toBeDefined();
  });

  it('should assign elements to defined slot', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as CustomEventInit<HTMLSlotElement>));
    await elementIsStable(element);

    expect(element.querySelector(IconButton.metadata.tag).slot.includes('_')).toBe(true);
    expect(element.querySelector(Button.metadata.tag).slot.includes('_')).toBe(true);
    expect(element.querySelector('span').slot.includes('_')).toBe(true);
  });

  it('should decorate clickable elements with inline', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as CustomEventInit<HTMLSlotElement>));
    await elementIsStable(element);

    expect(element.querySelector<IconButton>(IconButton.metadata.tag).container.includes('inline')).toBe(true);
    expect(element.querySelector<Button>(Button.metadata.tag).container.includes('inline')).toBe(true);
  });

  it('should remove wrapper slot if a child is removed', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as CustomEventInit<HTMLSlotElement>));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(3);

    element.querySelector(IconButton.metadata.tag).remove();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(2);
  });

  it('should add wrapper slot if a child is added', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as CustomEventInit<HTMLSlotElement>));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(3);

    const button = document.createElement(Button.metadata.tag);
    element.append(button);
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as CustomEventInit<HTMLSlotElement>));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(4);
  });
});
