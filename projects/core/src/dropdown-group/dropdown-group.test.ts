// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { DropdownGroup } from '@nvidia-elements/core/dropdown-group';
import '@nvidia-elements/core/dropdown-group/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/icon/define.js';

// Type for testing protected properties
type TestDropdownGroup = DropdownGroup & {
  dropdowns: DropdownGroup['dropdowns'];
};

describe(DropdownGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: TestDropdownGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button popovertarget="menu-1">menu</nve-button>
      <nve-dropdown-group>
        <nve-dropdown id="menu-1">
          <nve-menu>
            <nve-menu-item popovertarget="menu-2">
              item 1-1 <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon>
            </nve-menu-item>
            <nve-menu-item>item 1-2</nve-menu-item>
            <nve-menu-item>item 1-3</nve-menu-item>
          </nve-menu>
        </nve-dropdown>
        <nve-dropdown id="menu-2" position="right">
          <nve-menu>
            <nve-menu-item>item 2-1</nve-menu-item>
            <nve-menu-item>item 2-2</nve-menu-item>
            <nve-menu-item>item 2-3</nve-menu-item>
          </nve-menu>
        </nve-dropdown>
      </nve-dropdown-group>
    `);
    element = fixture.querySelector(DropdownGroup.metadata.tag) as TestDropdownGroup;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize with correct number of dropdowns', () => {
    expect(element.dropdowns).toHaveLength(2);
  });

  it('should remove closed cascading menus from layout without closing the parent', async () => {
    const [parent, child] = element.dropdowns;
    await elementIsStable(parent);
    await elementIsStable(child);
    expect(parent.getClientRects()).toHaveLength(0);
    expect(child.getClientRects()).toHaveLength(0);
    parent.showPopover();
    await elementIsStable(parent);
    parent.querySelector('nve-menu-item').dispatchEvent(
      new KeyboardEvent('keydown', {
        code: 'ArrowRight',
        bubbles: true
      })
    );
    await elementIsStable(child);
    expect(parent.getClientRects()).toHaveLength(1);
    expect(child.getClientRects()).toHaveLength(1);
    child.querySelector('nve-menu-item').dispatchEvent(
      new KeyboardEvent('keydown', {
        code: 'ArrowLeft',
        bubbles: true
      })
    );
    await elementIsStable(child);
    await expect.poll(() => child.getClientRects().length).toBe(0);
    expect(parent.matches(':popover-open')).toBe(true);
    expect(parent.getClientRects()).toHaveLength(1);
    element.close();
    await elementIsStable(parent);
    await expect.poll(() => parent.getClientRects().length).toBe(0);
  });

  it('should set popoverType to manual for all dropdowns', () => {
    element.dropdowns.forEach(dropdown => {
      expect(dropdown.popoverType).toBe('manual');
    });
  });

  it('should close all dropdowns when clicking outside', async () => {
    const dropdown1 = element.dropdowns[0];
    const dropdown2 = element.dropdowns[1];

    dropdown1.showPopover();
    dropdown2.showPopover();

    const event = new PointerEvent('pointerup', {
      clientX: 1000,
      clientY: 1000
    });
    document.dispatchEvent(event);

    await elementIsStable(element);

    expect(dropdown1.matches(':popover-open')).toBe(false);
    expect(dropdown2.matches(':popover-open')).toBe(false);
  });

  it('should keep dropdowns open when clicking inside the group', async () => {
    const dropdown1 = element.dropdowns[0];
    const dropdown2 = element.dropdowns[1];
    dropdown1.showPopover();
    dropdown2.showPopover();

    dropdown1.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        clientX: dropdown1.getBoundingClientRect().left,
        clientY: dropdown1.getBoundingClientRect().top
      })
    );

    await elementIsStable(element);

    expect(dropdown1.matches(':popover-open')).toBe(true);
    expect(dropdown2.matches(':popover-open')).toBe(true);
  });

  it('should handle keyboard navigation', async () => {
    const dropdown1 = element.dropdowns[0];
    const dropdown2 = element.dropdowns[1];
    const menuItem = dropdown1.querySelector('nve-menu-item');

    // Open first dropdown
    dropdown1.showPopover();
    await elementIsStable(element);

    // Press right arrow
    const rightEvent = new KeyboardEvent('keydown', {
      code: 'ArrowRight',
      bubbles: true
    });
    menuItem.dispatchEvent(rightEvent);

    await elementIsStable(element);
    expect(dropdown2.matches(':popover-open')).toBe(true);

    // Press left arrow on the second dropdown's menu item
    const leftEvent = new KeyboardEvent('keydown', {
      code: 'ArrowLeft',
      bubbles: true
    });
    dropdown2.querySelector('nve-menu-item').dispatchEvent(leftEvent);

    await elementIsStable(element);
    expect(dropdown2.matches(':popover-open')).toBe(false);
  });

  it('should close all dropdowns on escape key', async () => {
    const dropdown1 = element.dropdowns[0];
    const dropdown2 = element.dropdowns[1];

    // Open both dropdowns
    dropdown1.showPopover();
    dropdown2.showPopover();

    // Press escape
    const escapeEvent = new KeyboardEvent('keydown', {
      code: 'Escape',
      bubbles: true
    });
    element.dispatchEvent(escapeEvent);

    await elementIsStable(element);

    expect(dropdown1.matches(':popover-open')).toBe(false);
    expect(dropdown2.matches(':popover-open')).toBe(false);
  });

  it('should focus first focusable item when opening dropdown', async () => {
    const dropdown1 = element.dropdowns[0];
    const menuItem = dropdown1.querySelector('nve-menu-item');

    // Open dropdown
    dropdown1.showPopover();
    await elementIsStable(element);

    // Trigger open event
    const openEvent = new CustomEvent('open', { bubbles: true });
    dropdown1.dispatchEvent(openEvent);

    // Wait for focus to be set
    await new Promise(resolve => setTimeout(resolve, 0));
    await elementIsStable(element);

    expect(document.activeElement).toBe(menuItem);
  });

  it('should focus trigger when closing dropdown', async () => {
    const dropdown1 = element.dropdowns[0];
    const button = fixture.querySelector('nve-button');

    dropdown1.showPopover();
    await elementIsStable(element);

    dropdown1.hidePopover();
    await elementIsStable(element);

    const closeEvent = new CustomEvent('close', { bubbles: true });
    dropdown1.dispatchEvent(closeEvent);

    await new Promise(resolve => setTimeout(resolve, 50));
    await elementIsStable(element);

    button.setAttribute('tabindex', '0');
    button.focus();

    expect(document.activeElement).toBe(button);
  });

  it('should ignore open and close events from non-local dropdowns', async () => {
    const activeElement = document.activeElement;
    element.dispatchEvent(new CustomEvent('open', { bubbles: true }));
    element.dispatchEvent(new CustomEvent('close', { bubbles: true }));

    await elementIsStable(element);

    expect(document.activeElement).toBe(activeElement);
  });
});

describe(`${DropdownGroup.metadata.tag}: secondary menus`, () => {
  let fixture: HTMLElement;
  let element: DropdownGroup;
  let dropdown: HTMLElement;
  let trigger: HTMLElement;
  let childItem: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button popovertarget="outer-menu">Actions</nve-button>
      <nve-dropdown-group>
        <nve-dropdown id="outer-menu">
          <nve-menu>
            <nve-menu-item popovertarget="secondary-menu"><span>Move</span></nve-menu-item>
          </nve-menu>
        </nve-dropdown>
        <nve-dropdown id="secondary-menu" position="right">
          <nve-menu>
            <nve-menu-item disabled>Unavailable</nve-menu-item>
            <nve-menu-item>Left</nve-menu-item>
            <nve-menu-item>Right</nve-menu-item>
          </nve-menu>
        </nve-dropdown>
      </nve-dropdown-group>
    `);
    element = fixture.querySelector('nve-dropdown-group');
    dropdown = fixture.querySelector('#secondary-menu');
    trigger = element.querySelector('nve-menu-item');
    childItem = dropdown.querySelector('nve-menu-item:not([disabled])');
    await elementIsStable(element);
    const outer = fixture.querySelector('nve-dropdown');
    const opened = untilEvent(outer, 'open');
    outer.showPopover({ source: fixture.querySelector('nve-button') });
    await opened;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should open the associated dropdown and focus its first enabled item', async () => {
    const opened = untilEvent(dropdown, 'open');
    trigger
      .querySelector('span')
      .dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true }));
    await opened;

    expect(dropdown.matches(':popover-open')).toBe(true);
    expect(document.activeElement).toBe(childItem);
  });

  it('should return focus to the native invoker when closing the secondary dropdown', async () => {
    const opened = untilEvent(dropdown, 'open');
    dropdown.showPopover({ source: trigger });
    await opened;

    const closed = untilEvent(dropdown, 'close');
    childItem.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true, composed: true }));
    await closed;

    expect(dropdown.matches(':popover-open')).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(fixture.querySelector('#outer-menu').matches(':popover-open')).toBe(true);
  });

  it('should reverse the submenu arrow keys in right-to-left layouts', async () => {
    element.dir = 'rtl';
    const opened = untilEvent(dropdown, 'open');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true, composed: true }));
    await opened;

    const closed = untilEvent(dropdown, 'close');
    childItem.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true }));
    await closed;

    expect(dropdown.matches(':popover-open')).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
});
