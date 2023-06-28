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
    const items = element.querySelectorAll<MenuItem>('nve-menu-item');
    expect(items.length).toBe(3);
  });

  it('should set the value state for menu items', async () => {
    const item = element.querySelectorAll<MenuItem>('nve-menu-item')[0];
    expect(item.value).toBe('1');
  });

  it('should show custom dropdown menu when clicked', async () => {
    const dropdown = element.querySelector<Dropdown>('nve-dropdown');
    expect(dropdown.hidden).toBe(true);
    emulateClick(fixture.querySelector('select'));
    element.requestUpdate();
    expect(dropdown.hidden).toBe(false);
  });

  it('should each menu with the aria role of listbox', async () => {
    const menu = fixture.querySelector<Menu>('nve-menu');
    expect(menu.getAttribute('role')).toBe('listbox');
  });

  it('should each menu item with the aria role of option', async () => {
    const items = fixture.querySelectorAll<MenuItem>('nve-menu-item');
    expect(items[0].getAttribute('role')).toBe('option');
    expect(items[1].getAttribute('role')).toBe('option');
    expect(items[2].getAttribute('role')).toBe('option');
  });
});
