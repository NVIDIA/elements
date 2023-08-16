import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture } from '@elements/elements/test';
import { Combobox } from '@elements/elements/combobox';
import type { Menu, MenuItem } from '@elements/elements/menu';
import type { Dropdown } from '@elements/elements/dropdown';
import '@elements/elements/combobox/define.js';

describe('mlv-combobox', () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
          <option value="Option 3"></option>
        </datalist>
        <mlv-control-message>message</mlv-control-message>
      </mlv-combobox>
    `);
    element = fixture.querySelector('mlv-combobox');
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-combobox')).toBeDefined();
  });

  it('should render a menu item for each provided option', async () => {
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>('mlv-menu-item');
    expect(items.length).toBe(3);
  });

  it('should set width of dropdown when opened', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('mlv-dropdown');
    expect(dropdown.hidden).toBe(true);
    emulateClick(input);
    await elementIsStable(element);
    expect(dropdown.style.getPropertyValue('--min-width')).toBe(`${element.shadowRoot.querySelector('[input]').getBoundingClientRect().width}px`);
  });

  it('should each menu with the aria role of listbox', async () => {
    const menu = element.shadowRoot.querySelector<Menu>('mlv-menu');
    expect(menu.getAttribute('role')).toBe('listbox');
  });

  it('should each menu item with the aria role of option', async () => {
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>('mlv-menu-item');
    expect(items[0].getAttribute('role')).toBe('option');
    expect(items[1].getAttribute('role')).toBe('option');
    expect(items[2].getAttribute('role')).toBe('option');
  });

  it('should show options on keydown', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('mlv-dropdown');
    expect(dropdown.hidden).toBe(true);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);
  });

  it('should hide options on escape keypress', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('mlv-dropdown');
    expect(dropdown.hidden).toBe(true);

    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(true);
  });

  it('should close dropdown when menu item is selected', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('mlv-dropdown');
    expect(dropdown.hidden).toBe(true);

    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);
  });

  it('should focus first option if key arrow down is pressed', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>('mlv-menu-item');
    const dropdown = element.shadowRoot.querySelector<Dropdown>('mlv-dropdown');
    expect(dropdown.hidden).toBe(true);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);

    emulateClick(input);
    input.focus();
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
    await elementIsStable(element);
    await elementIsStable(items[0]);
    expect(items[0].tabIndex).toBe(0);
    expect(items[0].tagName).toBe(element.shadowRoot.activeElement.tagName);
  });

  it('should hide dropdown on keydown and is a tab event', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('mlv-dropdown');

    expect(dropdown.hidden).toBe(true);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' }));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(true);
  });

  it('should autocomplete on tab if there is a partial match to first available option', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('mlv-dropdown');

    expect(dropdown.hidden).toBe(true);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);

    input.value = 'Option';
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' }));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(true);
    expect(input.value).toBe('Option 1');
  });

  it('should set the input value if a option is clicked', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>('mlv-menu-item');
    const dropdown = element.shadowRoot.querySelector<Dropdown>('mlv-dropdown');
    expect(dropdown.hidden).toBe(true);

    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);

    emulateClick(items[0]);
    expect(input.value).toBe('Option 1');
  });

  it('should show "no results" message if no options are provided', async () => {
    const options = element.querySelectorAll('option');
    const items = element.shadowRoot.querySelectorAll<MenuItem>('mlv-menu-item');
    const dropdown = element.shadowRoot.querySelector<Dropdown>('mlv-dropdown');
    expect(dropdown.hidden).toBe(true);

    options.forEach(i => i.remove());
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);
    expect(items[0].textContent.trim()).toBe(element.i18n.noResults);
  });
});
