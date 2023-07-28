import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, emulateClick } from '@elements/elements/test';
import { Select } from '@elements/elements/select';
import type { Dropdown } from '@elements/elements/dropdown';
import type { Menu, MenuItem } from '@elements/elements/menu';
import '@elements/elements/select/define.js';

describe('nve-select', () => {
  let fixture: HTMLElement;
  let element: Select;
  let select: HTMLSelectElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-select>
        <label>label</label>
        <select>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">
            Option 3
            <template>
              Option 3
              <span>Custom Content</span> 
            </template>
          </option>
        </select>
      </nve-select>
    `);
    element = fixture.querySelector('nve-select');
    select = fixture.querySelector('select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-select')).toBeDefined();
  });

  it('should show icon if not a multiple select type', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBeDefined();
    fixture.querySelector('select').multiple = true;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);
  });

  it('should show icon if not a size select type', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBeDefined();
    fixture.querySelector('select').size = 3;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);
  });

  it('should render a menu for each provided option', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
    expect(items.length).toBe(3);
  });

  it('should render a custom option slot for each given item', async () => {
    const items = element.shadowRoot.querySelectorAll<HTMLSlotElement>('[name*="option-"]');
    expect(items.length).toBe(3);
    expect(items[0].name).toBe('option-1');
    expect(items[1].name).toBe('option-2');
    expect(items[2].name).toBe('option-3');
  });

  it('should re-render a custom options when options are dynamically added or removed', async () => {
    const items = element.shadowRoot.querySelectorAll<HTMLSlotElement>('[name*="option-"]');
    expect(items.length).toBe(3);
    expect(items[0].name).toBe('option-1');
    expect(items[1].name).toBe('option-2');
    expect(items[2].name).toBe('option-3');

    const option = document.createElement('option');
    option.value = '4';
    option.textContent = 'Option 4';
    select.appendChild(option);

    emulateClick(select);
    await element.updateComplete;
    expect(element.shadowRoot.querySelectorAll<HTMLSlotElement>('[name*="option-"]').length).toBe(4);

    option.remove();
    emulateClick(select);
    await element.updateComplete;
    expect(element.shadowRoot.querySelectorAll<HTMLSlotElement>('[name*="option-"]').length).toBe(3);
  });

  it('should show custom dropdown menu when clicked', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');
    expect(dropdown.hidden).toBe(true);
    emulateClick(select);
    element.requestUpdate();
    expect(dropdown.hidden).toBe(false);
  });

  it('should hide dropdown when closed', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');
    expect(dropdown.hidden).toBe(true);
    emulateClick(select);
    element.requestUpdate();
    expect(dropdown.hidden).toBe(false);

    dropdown.dispatchEvent(new CustomEvent('close'));
    await element.updateComplete;
    expect(dropdown.hidden).toBe(true);
  });

  it('should each menu with the aria role of listbox', async () => {
    const menu = element.shadowRoot.querySelector<Menu>('nve-menu');
    expect(menu.getAttribute('role')).toBe('listbox');
  });

  it('should each menu item with the aria role of option', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
    expect(items[0].getAttribute('role')).toBe('option');
    expect(items[1].getAttribute('role')).toBe('option');
    expect(items[2].getAttribute('role')).toBe('option');
  });

  it('should close dropdown when menu item is selected', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
    expect(element.shadowRoot.querySelector('nve-dropdown').hidden).toBe(true);

    emulateClick(select);
    await element.updateComplete;
    expect(element.shadowRoot.querySelector('nve-dropdown').hidden).toBe(false);

    emulateClick(items[0]);
    expect(element.shadowRoot.querySelector('nve-dropdown').hidden).toBe(true);
  });

  it('should render tags when using multiple select', async () => {
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    element.requestUpdate();
    await element.updateComplete;
    expect(element.shadowRoot.querySelectorAll('nve-tag').length).toBe(2);
  });

  it('should deselect option when tag is clicked', async () => {
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    element.requestUpdate();
    await element.updateComplete;
    expect(element.shadowRoot.querySelectorAll('nve-tag').length).toBe(2);

    // remove tag/deselect option
    emulateClick(element.shadowRoot.querySelectorAll('nve-tag')[0]);
    await element.updateComplete;
    expect(element.shadowRoot.querySelectorAll('nve-tag').length).toBe(1);
  });

  it('should set host :--multiple state when multiple is used', async () => {
    select.multiple = true;
    await element.requestUpdate();
    expect(element.matches(':--multiple')).toBe(true);
  });

  it('should set host :--size state when multiple is used', async () => {
    select.size = 2;
    await element.requestUpdate();
    expect(element.matches(':--size')).toBe(true);
  });
});
