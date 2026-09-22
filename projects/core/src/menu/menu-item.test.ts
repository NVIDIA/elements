// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { MenuItem } from '@nvidia-elements/core/menu';
import '@nvidia-elements/core/menu/define.js';

describe(MenuItem.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: MenuItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-menu-item>item 1</nve-menu-item>
    `);
    element = fixture.querySelector(MenuItem.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(MenuItem.metadata.tag)).toBeDefined();
  });

  it('should initialize role menuitem', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('menuitem');
  });

  it('should have a type default of button', async () => {
    await elementIsStable(element);
    expect(element.type).toBe('button');
  });

  it('should initialize tabindex 0 for focus behavior', async () => {
    await elementIsStable(element);
    expect(element.tabIndex).toBe(0);
  });

  it('should remove tabindex if disabled', async () => {
    element.disabled = true;
    await elementIsStable(element);
    expect(element.tabIndex).toBe(-1);
  });

  it.each(['prefix', 'suffix'])('should assign content to the %s slot', async name => {
    const content = document.createElement('span');
    content.slot = name;
    content.textContent = name;
    element.append(content);
    await elementIsStable(element);

    const slot = element.shadowRoot.querySelector<HTMLSlotElement>(`slot[name="${name}"]`);
    const labelSlot = element.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])');
    expect(slot.assignedElements()).toEqual([content]);
    expect(
      labelSlot
        .assignedNodes()
        .map(node => node.textContent)
        .join('')
    ).toBe('item 1');

    content.remove();
    await elementIsStable(element);

    expect(slot.assignedElements()).toEqual([]);
  });
});
