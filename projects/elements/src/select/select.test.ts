import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, emulateClick } from '@nvidia-elements/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Select } from '@nvidia-elements/core/select';
import { Dropdown } from '@nvidia-elements/core/dropdown';
import { Menu, MenuItem } from '@nvidia-elements/core/menu';
import { Icon } from '@nvidia-elements/core/icon';
import { Tag } from '@nvidia-elements/core/tag';
import '@nvidia-elements/core/select/define.js';

describe(Select.metadata.tag, () => {
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
    element = fixture.querySelector(Select.metadata.tag);
    select = fixture.querySelector('select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Select.metadata.tag)).toBeDefined();
  });

  it('should show icon if not a multiple select type', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBeDefined();
    fixture.querySelector('select').multiple = true;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
  });

  it('should show icon if not a size select type', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBeDefined();
    fixture.querySelector('select').size = 3;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
  });

  it('should render a menu for each provided option', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
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
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);
    emulateClick(select);
    element.requestUpdate();
    expect(dropdown.matches(':popover-open')).toBe(true);
  });

  it('should hide dropdown when closed', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);
    emulateClick(select);
    element.requestUpdate();
    expect(dropdown.matches(':popover-open')).toBe(true);

    dropdown.hidePopover();
    await element.updateComplete;
    expect(dropdown.matches(':popover-open')).toBe(false);
  });

  it('should use aria-hidden for decorative non-semantic icons', async () => {
    const icons = element.shadowRoot.querySelectorAll(Icon.metadata.tag);
    expect(icons.length).toBe(4);
    expect(icons[0].getAttribute('aria-hidden')).toBe('true');
    expect(icons[1].getAttribute('aria-hidden')).toBe('true');
    expect(icons[2].getAttribute('aria-hidden')).toBe('true');
    expect(icons[3].getAttribute('aria-hidden')).toBe('true');
  });

  it('should each menu with the aria role of listbox', async () => {
    const menu = element.shadowRoot.querySelector<Menu>(Menu.metadata.tag);
    expect(menu.getAttribute('role')).toBe('listbox');
  });

  it('should each menu item with the aria role of option', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].getAttribute('role')).toBe('option');
    expect(items[1].getAttribute('role')).toBe('option');
    expect(items[2].getAttribute('role')).toBe('option');
  });

  it('should close dropdown when menu item is selected', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag).matches(':popover-open')).toBe(false);

    emulateClick(select);
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag).matches(':popover-open')).toBe(true);

    emulateClick(items[0]);
    expect(element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag).matches(':popover-open')).toBe(false);
  });

  it('should render tags when using multiple select', async () => {
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag).length).toBe(2);
  });

  it('should update tags when using multiple select and options change', async () => {
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag)[0].innerText).toBe('Option 1');

    select.options[0].innerText = 'Option 1 Updated';
    select.options[0].value = '1-updated';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag)[0].innerText).toBe('Option 1 Updated');
  });

  it('should only allow value to change and preserve default selected option when single select', async () => {
    select.multiple = false;
    select.options[0].removeAttribute('selected');
    select.options[1].setAttribute('selected', '');

    await elementIsStable(element);
    expect(select.value).toBe('2');

    emulateClick(select);
    await elementIsStable(element);

    emulateClick(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[0]);
    await element.updateComplete;
    expect(select.value).toBe('1');
    expect(select.options[0].selected).toBe(true);
    expect(select.options[1].selected).toBe(false);
    expect(select.options[0].hasAttribute('selected')).toBe(false);
    expect(select.options[1].hasAttribute('selected')).toBe(true);
  });

  it('should not allow deselection of selected value if single select', async () => {
    select.multiple = false;
    select.options[0].removeAttribute('selected');
    select.options[1].setAttribute('selected', '');

    await elementIsStable(element);
    expect(select.value).toBe('2');

    emulateClick(select);
    await elementIsStable(element);

    // select first item
    emulateClick(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[0]);
    await element.updateComplete;
    expect(select.value).toBe('1');
    expect(select.options[0].selected).toBe(true);
    expect(select.options[1].selected).toBe(false);
    expect(select.options[0].hasAttribute('selected')).toBe(false);
    expect(select.options[1].hasAttribute('selected')).toBe(true);

    // select first item again retaining selected state
    emulateClick(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[0]);
    await element.updateComplete;
    expect(select.value).toBe('1');
    expect(select.options[0].selected).toBe(true);
    expect(select.options[1].selected).toBe(false);
    expect(select.options[0].hasAttribute('selected')).toBe(false);
    expect(select.options[1].hasAttribute('selected')).toBe(true);
  });

  it('should allow deselection of selected value if multi select', async () => {
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = false;

    await elementIsStable(element);

    emulateClick(select);
    await elementIsStable(element);

    // deselect first item
    emulateClick(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[0]);
    await element.updateComplete;
    expect(select.value).toBe('');
    expect(select.options[0].selected).toBe(false);
    expect(select.options[1].selected).toBe(false);
  });

  it('should deselect option when tag is clicked', async () => {
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag).length).toBe(2);

    // remove tag/deselect option
    emulateClick(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag)[0]);
    await element.updateComplete;
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag).length).toBe(1);
  });

  it('should set host :state(multiple) state when multiple is used', async () => {
    select.multiple = true;
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.matches(':state(multiple)')).toBe(true);
  });

  it('should hide tags and display label when multiple is used and tags overflow container', async () => {
    expect(element.matches(':state(multiple-overflow)')).toBe(false);
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;
    element.style.setProperty('--width', '50px');

    await elementIsStable(element);
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(element.matches(':state(multiple-overflow)')).toBe(true);
  });

  it('should hide tags and display label when a new selection causes a overflow', async () => {
    expect(element.matches(':state(multiple-overflow)')).toBe(false);
    element.style.setProperty('--width', '100px');
    select.multiple = true;
    await elementIsStable(element);

    element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[0].click();
    element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[2].click();

    // await elementIsStable(element);
    // await new Promise(r => requestAnimationFrame(r));
    // await new Promise(resolve => setTimeout(resolve, 0));
    // expect(element.matches(':state(multiple-overflow)')).toBe(true);
  });

  it('should set host :state(size) state when multiple is used', async () => {
    select.size = 2;
    await elementIsStable(element);
    expect(element.matches(':state(size)')).toBe(true);
  });

  it('should apply disabled styles to tags when disabled with multiple selection', async () => {
    select.multiple = true;
    select.options[0].selected = true;

    await elementIsStable(element);

    expect(getComputedStyle(element.shadowRoot.querySelector<Tag>(Tag.metadata.tag)).pointerEvents).toBe('auto');
    expect(getComputedStyle(element.shadowRoot.querySelector<Tag>(Tag.metadata.tag)).getPropertyValue('--cursor')).toBe(
      'pointer'
    );

    select.disabled = true;
    element.requestUpdate();
    await elementIsStable(element);
    expect(getComputedStyle(element.shadowRoot.querySelector<Tag>(Tag.metadata.tag)).pointerEvents).toBe('none');
    expect(getComputedStyle(element.shadowRoot.querySelector<Tag>(Tag.metadata.tag)).getPropertyValue('--cursor')).toBe(
      'not-allowed'
    );
  });

  it('should show placeholder label for multiple select if a hidden option is provided', async () => {
    expect(element.matches(':state(multiple)')).toBe(false);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag).length).toBe(0);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag).length).toBe(3);
    expect(element.shadowRoot.querySelector('.tags-label.placeholder')).toBeFalsy();

    select.multiple = true;
    select.options[0].selected = true;
    select.options[0].hidden = true;
    select.options[0].disabled = true;

    await elementIsStable(element);
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(element.matches(':state(multiple)')).toBe(true);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag).length).toBe(0);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag).length).toBe(2);
    expect(element.shadowRoot.querySelector('.tags-label.placeholder')).toBeTruthy();
  });

  it('should mark menu items as disabled when coresponding select option is disabled', async () => {
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[0].disabled).toBe(false);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[1].disabled).toBe(false);

    select.options[0].disabled = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[0].disabled).toBe(true);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[1].disabled).toBe(false);
  });

  it('should mark menu items as hidden when coresponding select option is hidden', async () => {
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[0].hidden).toBe(false);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[1].hidden).toBe(false);

    select.options[0].hidden = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[0].hidden).toBe(true);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[1].hidden).toBe(false);
  });

  it('should default the dropdown to align bottom center with position-area "bottom span-right" ensure wide selection options span to the right of the input', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect((getComputedStyle(dropdown) as any).positionArea).toBe('span-right bottom');
  });
});

describe(`${Select.metadata.tag}: size`, () => {
  let fixture: HTMLElement;
  let element: Select;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-select>
        <label>label</label>
        <select size="3">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
          <option value="4">Option 4</option>
          <option value="5">Option 5</option>
        </select>
      </nve-select>
    `);
    element = fixture.querySelector(Select.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Select.metadata.tag)).toBeDefined();
  });

  it('should render select as inline outside of a dropdown', () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown).toBe(null);
  });

  it('should be in a :state(size) state', () => {
    expect(element.matches(':state(size)')).toBe(true);
  });

  it('should set --size property', () => {
    expect(getComputedStyle(element).getPropertyValue('--size')).toBe('3.75'); // size (3) + 0.75 buffer
  });
});
