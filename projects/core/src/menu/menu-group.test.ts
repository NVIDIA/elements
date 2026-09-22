// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { Menu, MenuGroup } from '@nvidia-elements/core/menu';
import '@nvidia-elements/core/menu/define.js';

describe(MenuGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: MenuGroup;
  let menu: Menu;
  let trigger: HTMLButtonElement;
  let content: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-menu-group>
        Labs Projects
        <span slot="suffix">4</span>
        <nve-menu>
          <nve-menu-item>Markdown</nve-menu-item>
          <nve-menu-item>Code</nve-menu-item>
        </nve-menu>
      </nve-menu-group>
    `);
    element = fixture.querySelector(MenuGroup.metadata.tag);
    menu = element.querySelector(Menu.metadata.tag);
    trigger = element.shadowRoot.querySelector<HTMLButtonElement>('#trigger');
    content = element.shadowRoot.querySelector('#content');
    await Promise.all([elementIsStable(element), elementIsStable(menu)]);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define the element and initialize disclosure defaults', () => {
    expect(customElements.get(MenuGroup.metadata.tag)).toBeDefined();
    expect(element.expanded).toBe(false);
    expect(element.disabled).toBe(false);
    expect(element.behaviorExpand).toBe(false);
    expect(element._internals.role).toBe('group');
    expect(content.hidden).toBe(true);
  });

  it('should automatically project its direct menu into the content slot', () => {
    expect(menu.slot).toBe('menu');
    expect(element.shadowRoot.querySelector<HTMLSlotElement>('slot[name="menu"]').assignedElements()).toEqual([menu]);
  });

  it('should remove an automatically assigned slot when the menu leaves the group', () => {
    fixture.append(menu);
    expect(menu.slot).toBe('');

    element.append(menu);
    expect(menu.slot).toBe('menu');
  });

  it('should preserve an explicitly assigned slot', () => {
    fixture.append(menu);
    menu.slot = 'custom';
    element.append(menu);
    expect(menu.slot).toBe('custom');

    fixture.append(menu);
    expect(menu.slot).toBe('custom');
  });

  it('should expose the disclosure state and relationship on the trigger', async () => {
    expect(trigger.type).toBe('button');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe('content');

    element.expanded = true;
    await elementIsStable(element);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(content.hidden).toBe(false);
  });

  it('should emit intent without changing state by default', async () => {
    const event = untilEvent(element, 'open');
    await emulateClick(trigger);
    const openEvent = await event;

    expect(element.expanded).toBe(false);
    expect(openEvent.bubbles).toBe(true);
    expect(openEvent.composed).toBe(true);
  });

  it('should automatically toggle state when behavior-expand is enabled', async () => {
    element.behaviorExpand = true;
    await elementIsStable(element);

    const open = untilEvent(element, 'open');
    await emulateClick(trigger);
    await open;
    await elementIsStable(element);
    expect(element.expanded).toBe(true);

    const close = untilEvent(element, 'close');
    await emulateClick(trigger);
    await close;
    await elementIsStable(element);
    expect(element.expanded).toBe(false);
  });

  it('should use a native button for keyboard activation and focus behavior', () => {
    expect(trigger).toBeInstanceOf(HTMLButtonElement);
    expect(trigger.tabIndex).toBe(0);
  });

  it('should not respond to header activation when disabled', async () => {
    const open = vi.fn();
    element.disabled = true;
    element.behaviorExpand = true;
    element.addEventListener('open', open);
    await elementIsStable(element);

    await emulateClick(trigger);
    expect(open).not.toHaveBeenCalled();
    expect(element.expanded).toBe(false);
    expect(trigger.disabled).toBe(true);
  });

  it('should support open, close, and toggle commands', async () => {
    element.dispatchEvent(new CommandEvent('command', { command: '--open' }));
    await elementIsStable(element);
    expect(element.expanded).toBe(true);

    element.dispatchEvent(new CommandEvent('command', { command: '--close' }));
    await elementIsStable(element);
    expect(element.expanded).toBe(false);

    element.dispatchEvent(new CommandEvent('command', { command: '--toggle' }));
    await elementIsStable(element);
    expect(element.expanded).toBe(true);
  });

  it('should point the indicator toward the disclosed content', async () => {
    const indicator = element.shadowRoot.querySelector('nve-icon');
    expect(indicator.direction).toBe('right');

    element.expanded = true;
    await elementIsStable(element);
    expect(indicator.direction).toBe('down');
  });
});
