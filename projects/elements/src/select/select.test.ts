import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, emulateClick } from '@elements/elements/test';
import { Select } from '@elements/elements/select';
import type { Dropdown } from '@elements/elements/dropdown';
import type { Menu, MenuItem } from '@elements/elements/menu';
import '@elements/elements/select/define.js';

describe('mlv-select', () => {
  let fixture: HTMLElement;
  let element: Select;
  let select: HTMLSelectElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-select>
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
      </mlv-select>
    `);
    element = fixture.querySelector('mlv-select');
    select = fixture.querySelector('select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-select')).toBeDefined();
  });

  it('should show icon if not a multiple select type', async () => {
    expect(element.shadowRoot.querySelector('mlv-icon-button')).toBeDefined();
    fixture.querySelector('select').multiple = true;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon-button')).toBe(null);
  });

  it('should show icon if not a size select type', async () => {
    expect(element.shadowRoot.querySelector('mlv-icon-button')).toBeDefined();
    fixture.querySelector('select').size = 3;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon-button')).toBe(null);
  });

  it('should render a menu for each provided option', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>('mlv-menu-item');
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
    const dropdown = element.shadowRoot.querySelector<Dropdown>('mlv-dropdown');
    expect(dropdown.hidden).toBe(true);
    emulateClick(select);
    element.requestUpdate();
    expect(dropdown.hidden).toBe(false);
  });

  it('should hide dropdown when closed', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('mlv-dropdown');
    expect(dropdown.hidden).toBe(true);
    emulateClick(select);
    element.requestUpdate();
    expect(dropdown.hidden).toBe(false);

    dropdown.dispatchEvent(new CustomEvent('close'));
    await element.updateComplete;
    expect(dropdown.hidden).toBe(true);
  });

  it('should use aria-hidden for decorative non-semantic icons', async () => {
    const icons = element.shadowRoot.querySelectorAll('mlv-icon');
    expect(icons.length).toBe(4);
    expect(icons[0].getAttribute('aria-hidden')).toBe('true');
    expect(icons[1].getAttribute('aria-hidden')).toBe('true');
    expect(icons[2].getAttribute('aria-hidden')).toBe('true');
    expect(icons[3].getAttribute('aria-hidden')).toBe('true');
  });

  it('should each menu with the aria role of listbox', async () => {
    const menu = element.shadowRoot.querySelector<Menu>('mlv-menu');
    expect(menu.getAttribute('role')).toBe('listbox');
  });

  it('should each menu item with the aria role of option', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>('mlv-menu-item');
    expect(items[0].getAttribute('role')).toBe('option');
    expect(items[1].getAttribute('role')).toBe('option');
    expect(items[2].getAttribute('role')).toBe('option');
  });

  it('should close dropdown when menu item is selected', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>('mlv-menu-item');
    expect(element.shadowRoot.querySelector('mlv-dropdown').hidden).toBe(true);

    emulateClick(select);
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-dropdown').hidden).toBe(false);

    emulateClick(items[0]);
    expect(element.shadowRoot.querySelector('mlv-dropdown').hidden).toBe(true);
  });

  it('should render tags when using multiple select', async () => {
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('mlv-tag').length).toBe(2);
  });

  it('should update tags when using multiple select and options change', async () => {
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('mlv-tag')[0].innerText).toBe('Option 1');

    select.options[0].innerText = 'Option 1 Updated';
    select.options[0].value = '1-updated';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('mlv-tag')[0].innerText).toBe('Option 1 Updated');
  });

  it('should deselect option when tag is clicked', async () => {
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('mlv-tag').length).toBe(2);

    // remove tag/deselect option
    emulateClick(element.shadowRoot.querySelectorAll('mlv-tag')[0]);
    await element.updateComplete;
    expect(element.shadowRoot.querySelectorAll('mlv-tag').length).toBe(1);
  });

  it('should set host :--multiple state when multiple is used', async () => {
    select.multiple = true;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.matches(':--multiple')).toBe(true);
  });

  it('should hide tags and display label when multiple is used and tags overflow container', async () => {
    expect(element.matches(':--multiple-overflow')).toBe(false);
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;
    element.style.setProperty('--width', '50px');

    element.requestUpdate();
    await elementIsStable(element);
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(element.matches(':--multiple-overflow')).toBe(true);
  });

  it('should hide tags and display label when a new selection causes a overflow', async () => {
    expect(element.matches(':--multiple-overflow')).toBe(false);
    element.style.setProperty('--width', '100px');
    select.multiple = true;
    await elementIsStable(element);
    
    element.shadowRoot.querySelectorAll('mlv-menu-item')[0].click();
    element.shadowRoot.querySelectorAll('mlv-menu-item')[2].click();

    // await elementIsStable(element);
    // await new Promise(r => requestAnimationFrame(r));
    // await new Promise(resolve => setTimeout(resolve, 0));
    // expect(element.matches(':--multiple-overflow')).toBe(true);
  });

  it('should set host :--size state when multiple is used', async () => {
    select.size = 2;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.matches(':--size')).toBe(true);
  });
});
