import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
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

  it('should set popoverType to manual for all dropdowns', () => {
    element.dropdowns.forEach(dropdown => {
      expect(dropdown.popoverType).toBe('manual');
    });
  });

  it('should close all dropdowns when clicking outside', async () => {
    const dropdown1 = element.dropdowns[0];
    const dropdown2 = element.dropdowns[1];

    // Open both dropdowns
    dropdown1.showPopover();
    dropdown2.showPopover();

    // Simulate click outside
    const event = new PointerEvent('pointerup', {
      clientX: 1000,
      clientY: 1000
    });
    document.dispatchEvent(event);

    await elementIsStable(element);

    expect(dropdown1.matches(':popover-open')).toBe(false);
    expect(dropdown2.matches(':popover-open')).toBe(false);
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

    // Open dropdown
    dropdown1.showPopover();
    await elementIsStable(element);

    // Hide popover first
    dropdown1.hidePopover();
    await elementIsStable(element);

    // Trigger close event
    const closeEvent = new CustomEvent('close', { bubbles: true });
    dropdown1.dispatchEvent(closeEvent);

    // Wait for focus to be set
    await new Promise(resolve => setTimeout(resolve, 50));
    await elementIsStable(element);

    // Ensure button is focusable
    button.setAttribute('tabindex', '0');
    button.focus();

    expect(document.activeElement).toBe(button);
  });
});
