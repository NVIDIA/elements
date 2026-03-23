import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { Combobox } from '@nvidia-elements/core/combobox';
import { Menu, MenuItem } from '@nvidia-elements/core/menu';
import { Dropdown } from '@nvidia-elements/core/dropdown';
import { Tag } from '@nvidia-elements/core/tag';
import '@nvidia-elements/core/combobox/define.js';

describe(Combobox.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;
  let options: HTMLOptionElement[];
  let items: MenuItem[];

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
          <option value="Option 3"></option>
        </datalist>
        <nve-control-message>message</nve-control-message>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    options = Array.from(fixture.querySelectorAll<HTMLOptionElement>('option'));
    items = Array.from(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag));
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Combobox.metadata.tag)).toBeDefined();
  });

  it('should have a flat container option', async () => {
    expect(element.container).toBe(undefined);
    element.container = 'flat';
    await elementIsStable(element);
    expect(element.container).toBe('flat');
    expect(element.hasAttribute('container')).toBe(true);
  });

  it('should remove native data list association', async () => {
    expect(input.getAttribute('list')).toBe('');
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    element.requestUpdate();
    await elementIsStable(element);
    expect(input.getAttribute('list')).toBe('');
  });

  it('should disable auto complete on input', async () => {
    expect(input.autocomplete).toBe('off');
  });

  it('should render a menu item for each provided option', async () => {
    emulateClick(input);
    await elementIsStable(element);
    expect(items.length).toBe(3);
  });

  it('should reflect each option to a menu item', async () => {
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items.length).toBe(3);
    expect(items[0].textContent.trim()).toBe(options[0].value);
    expect(items[1].textContent.trim()).toBe(options[1].value);
    expect(items[2].textContent.trim()).toBe(options[2].value);
  });

  it('should default the dropdown to align bottom center with position-area "bottom span-right" ensure wide selection options span to the right of the input', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect((getComputedStyle(dropdown) as CSSStyleDeclaration & { positionArea: string }).positionArea).toBe(
      'span-right bottom'
    );
  });

  it('should set width of dropdown when opened', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);
    emulateClick(input);
    await elementIsStable(element);
    expect(dropdown.style.getPropertyValue('--min-width')).toBe(
      `${element.shadowRoot.querySelector('[input]').getBoundingClientRect().width}px`
    );
  });

  it('should each menu with the aria role of listbox', async () => {
    const menu = element.shadowRoot.querySelector<Menu>(Menu.metadata.tag);
    expect(menu.getAttribute('role')).toBe('listbox');
  });

  it('should each menu item with the aria role of option', async () => {
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].getAttribute('role')).toBe('option');
    expect(items[1].getAttribute('role')).toBe('option');
    expect(items[2].getAttribute('role')).toBe('option');
  });

  it('should only show options that partial match the input value', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    input.value = 'Option 2';
    input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);
    expect(options[0].hidden).toBe(true);
    expect(options[1].hidden).toBe(false);
    expect(options[2].hidden).toBe(true);
  });

  it('should show options on keydown', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);
  });

  it('should assign trigger and anchor to inner input container', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    const inputContainer = element.shadowRoot.querySelector<HTMLDivElement>('[input]');
    expect(dropdown.anchor).toBe(inputContainer);
    expect(dropdown.trigger).toBe(inputContainer);
  });

  it('should hide options on escape keypress', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);

    input.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true }));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(false);
  });

  it('should close dropdown when menu item is selected', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);
  });

  it('should focus first option if key arrow down is pressed', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);

    const open = untilEvent(dropdown, 'open');
    emulateClick(input);
    input.focus();
    await open;
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
    expect(items[0].tabIndex).toBe(0);
    expect(element.shadowRoot.activeElement.tagName).toBe(items[0].tagName);
  });

  it('should hide dropdown on keydown and is a tab event', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    expect(dropdown.matches(':popover-open')).toBe(false);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);

    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' }));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(false);
  });

  it('should autocomplete on tab if there is a partial match to first available option', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    expect(dropdown.matches(':popover-open')).toBe(false);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);

    input.value = 'Option';
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' }));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(false);
    expect(input.value).toBe('Option 1');
  });

  it('should set the input value if a option is clicked', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);

    emulateClick(items[0]);
    expect(input.value).toBe('Option 1');
  });

  it('should show "no results" message if no options are provided', async () => {
    const options = element.querySelectorAll('option');
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);

    options.forEach(i => i.remove());
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[0].textContent.trim()).toBe(
      element.i18n.noResults
    );
  });

  it('should apply the --footer-content state styles when footer content is slotted', async () => {
    expect(element.matches(':state(footer-content)')).toBe(false);

    const footer = document.createElement('div');
    footer.setAttribute('slot', 'footer');
    element.appendChild(footer);
    await elementIsStable(element);

    expect(element.matches(':state(footer-content)')).toBe(true);
  });

  it('should provide a prefix-icon slot', async () => {
    expect(element.shadowRoot.querySelector('slot[name="prefix-icon"]')).toBeTruthy();
  });

  it('should invalidate cached datalist reference when slot content changes', async () => {
    const datalist = fixture.querySelector('datalist');
    datalist.remove();

    const newDatalist = document.createElement('datalist');
    newDatalist.innerHTML = '<option value="New A"></option><option value="New B"></option>';
    element.appendChild(newDatalist);

    await elementIsStable(element);
    emulateClick(input);
    await elementIsStable(element);

    const updatedItems = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(updatedItems.length).toBe(2);
    expect(updatedItems[0].textContent.trim()).toBe('New A');
    expect(updatedItems[1].textContent.trim()).toBe('New B');
  });

  it('should filter out menu items when corresponding option is disabled', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].disabled).toBe(false);
    options[0].disabled = true;
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    expect(items[0].disabled).toBe(true);
  });
});

describe(`${Combobox.metadata.tag}: single select`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;
  let select: HTMLSelectElement;
  let options: HTMLOptionElement[];

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select>
          <option selected value="option 1"></option>
          <option value="option 2"></option>
          <option value="option 3"></option>
        </select>
        <nve-control-message>message</nve-control-message>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    select = fixture.querySelector('select');
    options = Array.from(fixture.querySelectorAll('option'));
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Combobox.metadata.tag)).toBeDefined();
  });

  it('should initialize input to the selected option', async () => {
    expect(options[0].selected).toBe(true);
    expect(select.value).toBe('option 1');
    expect(input.value).toBe('option 1');
  });

  it('should not overwrite input value if already set when initializing with selected option', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" value="default value" />
        <select>
          <option selected value="option 1"></option>
          <option value="option 2"></option>
        </select>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    select = fixture.querySelector('select');
    options = Array.from(fixture.querySelectorAll('option'));
    await elementIsStable(element);

    expect(options[0].selected).toBe(true);
    expect(select.value).toBe('option 1');
    expect(input.value).toBe('default value');
  });

  it('should show a check icon when the option is selected', async () => {
    expect(options[0].selected).toBe(true);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(getComputedStyle(items[0].querySelector('nve-icon[name="check"]') as HTMLElement).opacity).toBe('1');
  });

  it('should show a check icon for only the selected option', async () => {
    expect(options[0].selected).toBe(true);
    expect(options[1].selected).toBe(false);
    input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(getComputedStyle(items[0].querySelector<HTMLElement>('nve-icon[name="check"]') as HTMLElement).opacity).toBe(
      '1'
    );
    expect(getComputedStyle(items[1].querySelector<HTMLElement>('nve-icon[name="check"]') as HTMLElement).opacity).toBe(
      '0'
    );

    emulateClick(items[1]);
    await elementIsStable(element);
    await elementIsStable(items[0]);
    await elementIsStable(items[1]);
    expect(options[0].selected).toBe(false);
    expect(options[1].selected).toBe(true);
  });

  it('should show all options initially when input is active', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    input.value = 'option 2';
    input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);
    expect(options[0].hidden).toBe(false);
    expect(options[1].hidden).toBe(false);
    expect(options[2].hidden).toBe(false);
  });

  it('should reflect each option to a menu item', async () => {
    input.value = '';
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);
    emulateClick(input);
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items.length).toBe(3);
    expect(items[0].textContent.trim()).toBe(options[0].value);
    expect(items[1].textContent.trim()).toBe(options[1].value);
    expect(items[2].textContent.trim()).toBe(options[2].value);
  });

  it('should default to dropdown using popover manual and disable modal behavior to allow textbox interactions', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    expect(dropdown.popoverType).toBe('manual');
    expect(dropdown.modal).toBe(false);
  });

  it('should enforce single select and clear invalid options', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    expect(options[0].selected).toBe(true);
    expect(options[1].selected).toBe(false);
    expect(options[2].selected).toBe(false);
    expect(select.value).toBe('option 1');
    expect(input.value).toBe('option 1');

    input.value = 'invalid option';
    dropdown.dispatchEvent(new CustomEvent('close', { bubbles: true }));

    await elementIsStable(element);
    expect(input.value).toBe('');
    expect(select.value).toBe('');
    expect(options[0].selected).toBe(false);
    expect(options[1].selected).toBe(false);
    expect(options[2].selected).toBe(false);
  });

  it('should set input and select value when item is clicked on partial match', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    input.value = 'opt';
    input.dispatchEvent(new Event('keydown', { bubbles: true }));

    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);

    const items = Array.from(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag));
    emulateClick(items[1]);
    expect(input.value).toBe('option 2');
    expect(select.value).toBe('option 2');
  });

  it('should preserve partial search while focusing within selection dropdown', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    input.value = 'opt';
    input.dispatchEvent(new Event('keydown', { bubbles: true }));

    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);

    expect(input.value).toBe('opt');
    expect(select.value).toBe('option 1');
  });

  it('should autocomplete on tab if there is a partial match to first available option', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    expect(dropdown.matches(':popover-open')).toBe(false);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);

    input.value = 'opt';
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' }));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(false);
    expect(input.value).toBe('option 1');
    expect(select.value).toBe('option 1');
  });

  it('should filter menu items against provided option values if no labels provided', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    input.value = 'option 1';
    input.dispatchEvent(new Event('keydown', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementIsStable(element);

    expect(dropdown.matches(':popover-open')).toBe(true);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(`${MenuItem.metadata.tag}[role='option']`).length).toBe(1);
  });

  it('should show "no results" message if no match was found', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    input.value = 'option 4';
    input.dispatchEvent(new Event('keydown', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementIsStable(element);

    expect(dropdown.matches(':popover-open')).toBe(true);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(`${MenuItem.metadata.tag}[role='option']`).length).toBe(0);
    expect(element.shadowRoot.querySelector<MenuItem>(`${MenuItem.metadata.tag}[disabled]`).textContent).toBe(
      'no results'
    );
  });

  it('should reflect dynamically added options after slotchange invalidates cache', async () => {
    const option = document.createElement('option');
    option.value = 'option 4';
    select.appendChild(option);

    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(`${MenuItem.metadata.tag}[role='option']`);
    expect(items.length).toBe(4);
    expect(items[3].textContent.trim()).toBe('option 4');
  });

  it('should clear input and reset select when reset() is called', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(select.value).toBe('option 1');
    expect(input.value).toBe('option 1');

    emulateClick(input);
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);

    element.reset();
    await elementIsStable(element);
    expect(input.value).toBe('');
    expect(select.selectedIndex).toBe(-1);
    expect(dropdown.matches(':popover-open')).toBe(false);
  });
});

describe(`${Combobox.metadata.tag}: single select empty default option`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;
  let select: HTMLSelectElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select>
          <option disabled selected></option>
          <option value="option 1"></option>
          <option value="option 2"></option>
          <option value="option 3"></option>
        </select>
        <nve-control-message>message</nve-control-message>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    select = fixture.querySelector('select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Combobox.metadata.tag)).toBeDefined();
  });

  it('should not render empty options used for select empty state', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items.length).toBe(3);
    expect(select.value).toBe('');
    expect(input.value).toBe('');
  });
});

describe(`${Combobox.metadata.tag}: multi select`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;
  let select: HTMLSelectElement;
  let options: HTMLOptionElement[];

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select multiple>
          <option selected value="1">Option 1</option>
          <option selected value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
        <nve-control-message>message</nve-control-message>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    select = fixture.querySelector('select');
    options = Array.from(fixture.querySelectorAll('option'));
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Combobox.metadata.tag)).toBeDefined();
  });

  it('should initialize :state(multiple) state', () => {
    expect(element.matches(':state(multiple)')).toBe(true);
  });

  it('should all options initially when input is active', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    input.value = 'option 2';
    input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);
    expect(options[0].hidden).toBe(false);
    expect(options[1].hidden).toBe(false);
    expect(options[2].hidden).toBe(false);
  });

  it('should show a nve-checkbox when the option is selected', async () => {
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.options[2].selected = true;
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].querySelector('nve-checkbox')).toBeTruthy();
    expect(items[1].querySelector('nve-checkbox')).toBeTruthy();
    expect(items[2].querySelector('nve-checkbox')).toBeTruthy();
  });

  it('should show a selected and disabled nve-menu-item and nve-checkbox when the option is selected and disabled', async () => {
    select.options[0].selected = true;
    select.options[0].disabled = true;
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].querySelector('nve-checkbox')).toBeTruthy();
    expect(items[0].selected).toBe(true);
    expect(items[0].disabled).toBe(true);
    expect(items[0].querySelector<HTMLInputElement>('input[type=checkbox]').checked).toBe(true);
    expect(items[0].querySelector<HTMLInputElement>('input[type=checkbox]').disabled).toBe(true);
  });

  it('should show a selected and disabled nve-menu-item and checkbox when the option is selected and disabled when there are more than 50 options', async () => {
    Array(51)
      .fill(0)
      .forEach((_, i) => {
        const option = document.createElement('option');
        option.value = `option ${i + 1}`;
        select.appendChild(option);
      });
    select.options[0].selected = true;
    select.options[0].disabled = true;
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].querySelector('nve-checkbox')).toBeFalsy();
    expect(items[0].selected).toBe(true);
    expect(items[0].disabled).toBe(true);
    expect(items[0].querySelector<HTMLInputElement>('input[type=checkbox]').checked).toBe(true);
    expect(items[0].querySelector<HTMLInputElement>('input[type=checkbox]').disabled).toBe(true);
  });

  it('should show a checkbox when there are more than 50 options', async () => {
    Array(51)
      .fill(0)
      .forEach((_, i) => {
        const option = document.createElement('option');
        option.value = `option ${i + 1}`;
        select.appendChild(option);
      });
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].querySelector('nve-checkbox')).toBeFalsy();
    expect(items[0].querySelector('input[type="checkbox"]')).toBeTruthy();
  });

  it('should cooresponding menu items and options as selected', async () => {
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].selected).toBe(true);
    expect(items[1].selected).toBe(true);
    expect(items[2].selected).toBe(undefined);
    expect(items.length).toBe(3);
    expect(select.selectedOptions.length).toBe(2);
  });

  it('should update select when menu item is clicked', async () => {
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].selected).toBe(true);
    expect(items[1].selected).toBe(true);
    expect(items[2].selected).toBe(undefined);
    expect(items.length).toBe(3);
    expect(select.selectedOptions.length).toBe(2);

    emulateClick(items[2]);
    await elementIsStable(element);
    expect(items[0].selected).toBe(true);
    expect(items[1].selected).toBe(true);
    expect(items[2].selected).toBe(true);
    expect(items.length).toBe(3);
    expect(select.selectedOptions.length).toBe(3);
  });

  it('should remove a selection when a tag is clicked', async () => {
    const tags = () => element.shadowRoot.querySelectorAll(Tag.metadata.tag);
    expect(tags().length).toBe(2);
    expect(select.selectedOptions.length).toBe(2);

    emulateClick(tags()[0]);
    await elementIsStable(element);
    expect(tags().length).toBe(1);
    expect(select.selectedOptions.length).toBe(1);
  });

  it('should hide tags and display label when multiple is used and tags overflow container', async () => {
    expect(element.matches(':state(multiple-overflow)')).toBe(false);
    element.style.setProperty('--width', '100px');
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.options[2].selected = true;

    element.requestUpdate();
    await elementIsStable(element);
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(element.matches(':state(multiple-overflow)')).toBe(true);
  });

  it('should not render inline tags when notags is used', async () => {
    element.notags = true;
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.options[2].selected = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll(Tag.metadata.tag).length).toBe(0);
  });

  it('should clear and reset text input and select when reset() is called', async () => {
    const tags = () => element.shadowRoot.querySelectorAll(Tag.metadata.tag);
    expect(tags().length).toBe(2);
    expect(select.selectedOptions.length).toBe(2);
    expect(input.value).toBe('');

    input.value = 'test';
    element.reset();
    await elementIsStable(element);
    expect(select.selectedOptions.length).toBe(0);
    expect(input.value).toBe('');
  });

  it('should hide dropdown when reset() is called', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);

    input.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true }));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);

    element.reset();
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(false);
  });

  it('should hide tags and display label when a new selection causes a overflow', async () => {
    expect(element.matches(':state(multiple-overflow)')).toBe(false);
    element.style.setProperty('--width', '100px');
    select.multiple = true;
    await elementIsStable(element);

    element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[0].click();
    element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag)[2].click();

    await elementIsStable(element);
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(element.matches(':state(multiple-overflow)')).toBe(true);
  });

  it('should remove overflow if additional space is available', async () => {
    expect(element.matches(':state(multiple-overflow)')).toBe(false);
    element.style.setProperty('--width', '110px');
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.options[2].selected = true;
    select.multiple = true;
    element.requestUpdate();
    await elementIsStable(element);

    element.requestUpdate();
    await elementIsStable(element);
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(element.matches(':state(multiple-overflow)')).toBe(true);

    select.options[0].selected = false;
    select.options[1].selected = false;
    select.options[2].selected = false;
    element.style.setProperty('--width', 'initial');

    element.requestUpdate();
    await elementIsStable(element);
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(element.matches(':state(multiple-overflow)')).toBe(false);
  });

  it('should select all options when selectAll() is called', async () => {
    const tags = () => element.shadowRoot.querySelectorAll(Tag.metadata.tag);
    expect(tags().length).toBe(2);
    expect(select.selectedOptions.length).toBe(2);
    expect(input.value).toBe('');

    const event = untilEvent(select, 'change');
    element.selectAll();
    await event;
    expect(select.selectedOptions.length).toBe(3);
    expect(input.value).toBe('');
  });

  it('should render collapsed label', async () => {
    element.style.setProperty('--width', '100px');
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.tags-label').textContent).toBe('2 selected');

    select.options[2].selected = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.tags-label').textContent).toBe('3 selected');
  });

  it('should render collapsed label when dynamically added option selected state updates', async () => {
    element.style.setProperty('--width', '100px');
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.tags-label').textContent).toBe('2 selected');

    const option = document.createElement('option');
    option.value = '4';
    option.textContent = 'Option 4';
    select.appendChild(option);

    await elementIsStable(element);
    option.selected = true;
    await elementIsStable(element);

    expect(element.shadowRoot.querySelector('.tags-label').textContent).toBe('3 selected');
  });

  it('should render collapsed label when select value updates', async () => {
    element.style.setProperty('--width', '100px');
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.tags-label').textContent).toBe('2 selected');

    select.value = '3';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.tags-label').textContent).toBe('1 selected');
  });

  it('should render tags when using multiple select', async () => {
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag).length).toBe(2);

    select.options[2].selected = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag).length).toBe(3);
  });

  it('should render tags when select value updates', async () => {
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag).length).toBe(2);

    select.value = '3';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag).length).toBe(1);
  });

  it('should update tags when using multiple select and dynamically added option selected state changes', async () => {
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;

    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag).length).toBe(2);

    const option = document.createElement('option');
    option.value = '4';
    option.textContent = 'Option 4';
    select.appendChild(option);

    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag).length).toBe(2);

    option.selected = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag).length).toBe(3);
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

  it('should dispatch input and change events on select when a tag is clicked', async () => {
    const inputHandler = vi.fn();
    const changeHandler = vi.fn();
    select.addEventListener('input', inputHandler);
    select.addEventListener('change', changeHandler);

    const tags = element.shadowRoot.querySelectorAll(Tag.metadata.tag);
    expect(tags.length).toBe(2);

    emulateClick(tags[0]);
    await elementIsStable(element);

    expect(inputHandler).toHaveBeenCalled();
    expect(changeHandler).toHaveBeenCalled();
  });
});

@customElement('combobox-test-element')
class ComboboxTestElement extends LitElement {
  /* eslint no-unused-vars: 0 */
  render() {
    return html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
          <option value="Option 3"></option>
        </datalist>
        <nve-control-message>message</nve-control-message>
      </nve-combobox>
    `;
  }
}

describe(`${Combobox.metadata.tag}: shadow root`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html` <combobox-test-element></combobox-test-element> `);
    element = fixture.querySelector('combobox-test-element').shadowRoot.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('combobox-test-element').shadowRoot.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should focus first option if key arrow down is pressed', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);
    expect(dropdown.tabIndex).toBe(-1);

    const open = untilEvent(dropdown, 'open');
    emulateClick(input);
    input.focus();
    await open;
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
    expect(items[0].tabIndex).toBe(0);
    expect(items[0].tagName).toBe(element.shadowRoot.activeElement.tagName);
    expect(dropdown.tabIndex).toBe(0);
  });
});

describe(`${Combobox.metadata.tag}: option labels for single select`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;
  let select: HTMLSelectElement;
  let options: HTMLOptionElement[];

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select>
          <option selected value="1">option one</option>
          <option value="2">option two</option>
          <option value="3">option three</option>
        </select>
        <nve-control-message>message</nve-control-message>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    select = fixture.querySelector('select');
    options = Array.from(fixture.querySelectorAll('option'));
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Combobox.metadata.tag)).toBeDefined();
  });

  it('should initialize input to the selected option label', async () => {
    expect(options[0].selected).toBe(true);
    expect(input.value).toBe('option one');
  });

  it('should initialize select to the selected option value', async () => {
    expect(options[0].selected).toBe(true);
    expect(select.value).toBe('1');
  });

  it('should reflect each option label to a menu item', async () => {
    input.value = '';
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items.length).toBe(3);
    expect(items[0].textContent.trim()).toBe(options[0].label);
    expect(items[1].textContent.trim()).toBe(options[1].label);
    expect(items[2].textContent.trim()).toBe(options[2].label);
  });

  it('should enforce single select and clear invalid options', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    expect(options[0].selected).toBe(true);
    expect(options[1].selected).toBe(false);
    expect(options[2].selected).toBe(false);
    expect(select.value).toBe('1');
    expect(input.value).toBe('option one');

    input.value = 'invalid option';
    dropdown.dispatchEvent(new CustomEvent('close', { bubbles: true }));

    await elementIsStable(element);
    expect(input.value).toBe('');
    expect(select.value).toBe('');
    expect(options[0].selected).toBe(false);
    expect(options[1].selected).toBe(false);
    expect(options[2].selected).toBe(false);
  });

  it('should store display value on menu item option property instead of value to sidestep unnecessary lit lifecycle updates for each menu item', async () => {
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect((items[0] as MenuItem & { option: string }).option).toBe('option one');
    expect((items[1] as MenuItem & { option: string }).option).toBe('option two');
    expect((items[2] as MenuItem & { option: string }).option).toBe('option three');
  });

  it('should autocomplete on tab using option label instead of value', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    expect(dropdown.matches(':popover-open')).toBe(false);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);

    input.value = 'option';
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' }));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(false);
    expect(input.value).toBe('option one');
    expect(select.value).toBe('1');
  });

  it('should filter menu items against provided option labels', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    input.value = 'option one';
    input.dispatchEvent(new Event('keydown', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(`${MenuItem.metadata.tag}[role='option']`);
    expect(dropdown.matches(':popover-open')).toBe(true);
    expect(items.length).toBe(1);
  });
});

describe(`${Combobox.metadata.tag}: character matching`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should not apply matches attribute when combobox is pristine', async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
          <option value="Option 3"></option>
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);

    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    const matchesSpans = items[0].querySelectorAll('span[matches]');
    expect(matchesSpans.length).toBe(0);
  });

  it('should apply matches attribute when combobox is dirty (user has typed)', async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
          <option value="Option 3"></option>
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);

    input.value = 'Opt';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementIsStable(element);

    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    const matchesSpans = items[0].querySelectorAll('span[matches]');
    expect(matchesSpans.length).toBe(3);
  });

  it('should delete dirty state when dropdown is closed to hide matches on next open', async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
          <option value="Option 3"></option>
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);

    input.value = 'Opt';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementIsStable(element);

    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    const matchesSpans = items[0].querySelectorAll('span[matches]');
    expect(matchesSpans.length).toBe(3);

    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    dropdown.dispatchEvent(new CustomEvent('close', { bubbles: true }));
    await elementIsStable(element);

    expect(element._internals.states.has('dirty')).toBe(false);

    emulateClick(input);
    await elementIsStable(element);
    expect(element._internals.states.has('dirty')).toBe(false);
  });

  it('should not apply matches attribute when options list is large (>50 options)', async () => {
    const optionsHtml = Array(51)
      .fill(0)
      .map((_, i) => `<option value="Option ${i + 1}"></option>`)
      .join('');

    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          ${document.createRange().createContextualFragment(optionsHtml)}
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);

    input.value = 'Opt';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementIsStable(element);

    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    const matchesSpans = items[0].querySelectorAll('span[matches]');
    expect(matchesSpans.length).toBe(0);
  });

  it('should apply matches attribute when options list is not large (<=50 options) and combobox is dirty', async () => {
    const optionsHtml = Array(50)
      .fill(0)
      .map((_, i) => `<option value="Option ${i + 1}"></option>`)
      .join('');

    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          ${document.createRange().createContextualFragment(optionsHtml)}
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);

    input.value = 'Opt';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementIsStable(element);

    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    const matchesSpans = items[0].querySelectorAll('span[matches]');
    expect(matchesSpans.length).toBe(3);
  });
});

describe(`${Combobox.metadata.tag}: container property`, () => {
  let fixture: HTMLElement;
  let element: Combobox;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should have undefined container by default', async () => {
    expect(element.container).toBe(undefined);
    expect(element.hasAttribute('container')).toBe(false);
  });

  it('should reflect container attribute when set via attribute', async () => {
    element.setAttribute('container', 'flat');
    await elementIsStable(element);

    expect(element.container).toBe('flat');
    expect(element.getAttribute('container')).toBe('flat');
  });

  it('should update container property and reflect to attribute', async () => {
    element.container = 'flat';
    await elementIsStable(element);

    expect(element.container).toBe('flat');
    expect(element.getAttribute('container')).toBe('flat');
  });
});

describe(`${Combobox.metadata.tag}: notags property reflection`, () => {
  let fixture: HTMLElement;
  let element: Combobox;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select multiple>
          <option value="1">Option 1</option>
        </select>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should have notags as false by default', async () => {
    expect(element.notags).toBeFalsy();
    expect(element.hasAttribute('notags')).toBe(false);
  });

  it('should reflect notags attribute when set via attribute', async () => {
    element.setAttribute('notags', '');
    await elementIsStable(element);

    expect(element.notags).toBe(true);
    expect(element.hasAttribute('notags')).toBe(true);
  });

  it('should reflect notags attribute when set via property', async () => {
    element.notags = true;
    await elementIsStable(element);

    expect(element.notags).toBe(true);
    expect(element.hasAttribute('notags')).toBe(true);
  });
});

describe(`${Combobox.metadata.tag}: disabled input`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" disabled />
        <datalist>
          <option value="Option 1"></option>
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should not open dropdown when input is disabled', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);

    emulateClick(input);
    await elementIsStable(element);

    expect(dropdown.matches(':popover-open')).toBe(false);
  });

  it('should not open dropdown on pointerdown when input is disabled', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await elementIsStable(element);

    expect(dropdown.matches(':popover-open')).toBe(false);
  });
});

describe(`${Combobox.metadata.tag}: ARIA attributes`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;
  let select: HTMLSelectElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select>
          <option selected value="1">Option 1</option>
          <option value="2">Option 2</option>
        </select>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    select = fixture.querySelector('select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should set aria-selected to true on selected menu items', async () => {
    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].getAttribute('aria-selected')).toBe('true');
    expect(items[1].getAttribute('aria-selected')).toBe('false');
  });

  it('should set aria-label on menu items', async () => {
    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].getAttribute('aria-label')).toBe('Option 1');
    expect(items[1].getAttribute('aria-label')).toBe('Option 2');
  });

  it('should set aria-label on menu from i18n', async () => {
    const menu = element.shadowRoot.querySelector<Menu>(Menu.metadata.tag);
    expect(menu.getAttribute('aria-label')).toBe(element.i18n.select);
  });

  it('should update aria-selected when selection changes', async () => {
    select.multiple = true;
    select.options[0].selected = false;
    await elementIsStable(element);

    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].getAttribute('aria-selected')).toBe('false');

    emulateClick(items[0]);
    await elementIsStable(element);

    expect(items[0].getAttribute('aria-selected')).toBe('true');
  });
});

describe(`${Combobox.metadata.tag}: dropdown state`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should have dropdown hidden initially', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.hidden).toBe(true);
  });

  it('should set dropdown hidden to false on open event', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    const open = untilEvent(dropdown, 'open');
    emulateClick(input);
    await open;

    expect(dropdown.hidden).toBe(false);
  });

  it('should set dropdown tabIndex to -1 when opened', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    const open = untilEvent(dropdown, 'open');
    emulateClick(input);
    await open;
    await elementIsStable(element);

    expect(dropdown.tabIndex).toBe(-1);
  });
});

describe(`${Combobox.metadata.tag}: event dispatching`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </select>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should dispatch input event on select when option is selected', async () => {
    const select = fixture.querySelector('select');
    const inputEvent = untilEvent(select, 'input');
    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    emulateClick(items[0]);
    await inputEvent;

    expect(select.value).toBe('1');
  });

  it('should dispatch change event on select when option is selected', async () => {
    const select = fixture.querySelector('select');
    const changeEvent = untilEvent(select, 'change');
    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    emulateClick(items[0]);
    await changeEvent;

    expect(select.value).toBe('1');
  });

  it('should dispatch input event on text input when option is clicked', async () => {
    emulateClick(input);
    await elementIsStable(element);

    const inputEvent = untilEvent(input, 'input');
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    emulateClick(items[0]);
    await inputEvent;

    expect(input.value).toBe('Option 1');
  });

  it('should dispatch change event on text input when option is clicked', async () => {
    emulateClick(input);
    await elementIsStable(element);

    const changeEvent = untilEvent(input, 'change');
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    emulateClick(items[0]);
    await changeEvent;

    expect(input.value).toBe('Option 1');
  });
});

describe(`${Combobox.metadata.tag}: multi select without pre-selected options`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;
  let select: HTMLSelectElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select multiple>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    select = fixture.querySelector('select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should render no tags when no options are pre-selected', async () => {
    expect(element.shadowRoot.querySelectorAll(Tag.metadata.tag).length).toBe(0);
    expect(select.selectedOptions.length).toBe(0);
  });

  it('should add tag when option is selected from empty state', async () => {
    expect(element.shadowRoot.querySelectorAll(Tag.metadata.tag).length).toBe(0);

    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    emulateClick(items[0]);
    await elementIsStable(element);

    expect(element.shadowRoot.querySelectorAll(Tag.metadata.tag).length).toBe(1);
    expect(select.selectedOptions.length).toBe(1);
  });
});

describe(`${Combobox.metadata.tag}: tags display value`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let select: HTMLSelectElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select multiple>
          <option selected value="val1">Label One</option>
          <option value="val2">Label Two</option>
        </select>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    select = fixture.querySelector('select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should display option label in tag when label is provided', async () => {
    const tags = element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag);
    expect(tags.length).toBe(1);
    expect(tags[0].textContent.trim()).toBe('Label One');
  });

  it('should display option value in tag when no label is provided', async () => {
    select.options[0].textContent = '';
    select.options[0].value = 'value-only';
    await elementIsStable(element);

    const tags = element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag);
    expect(tags.length).toBe(1);
    expect(tags[0].textContent.trim()).toBe('value-only');
  });

  it('should set tag value attribute to option value', async () => {
    const tags = element.shadowRoot.querySelectorAll<Tag>(Tag.metadata.tag);
    expect(tags[0].value).toBe('val1');
  });
});

describe(`${Combobox.metadata.tag}: all options disabled or hidden`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should show no results message when all options are disabled', async () => {
    const options = fixture.querySelectorAll<HTMLOptionElement>('option');
    options.forEach(o => (o.disabled = true));
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);

    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    const noResultsItem = Array.from(items).find(item => item.textContent.trim() === element.i18n.noResults);
    expect(noResultsItem).toBeTruthy();
  });

  it('should show no results when all options are hidden via filtering', async () => {
    input.value = 'xyz no match';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementIsStable(element);

    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items.length).toBe(1);
    expect(items[0].textContent.trim()).toBe(element.i18n.noResults);
  });
});

describe(`${Combobox.metadata.tag}: keyboard navigation`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should not open dropdown on Tab keydown', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' }));
    await elementIsStable(element);

    expect(dropdown.matches(':popover-open')).toBe(false);
  });

  it('should not open dropdown on Escape keydown', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    expect(dropdown.matches(':popover-open')).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));
    await elementIsStable(element);

    expect(dropdown.matches(':popover-open')).toBe(false);
  });

  it('should not autocomplete on Tab when input is empty', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);

    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.matches(':popover-open')).toBe(true);

    input.value = '';
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' }));
    await elementIsStable(element);

    expect(input.value).toBe('');
  });
});

describe(`${Combobox.metadata.tag}: single select icon`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select>
          <option selected value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should show check icon only for selected option in single select', async () => {
    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(getComputedStyle(items[0].querySelector('nve-icon[name="check"]') as HTMLElement).opacity).toBe('1');
    expect(getComputedStyle(items[1].querySelector('nve-icon[name="check"]') as HTMLElement).opacity).toBe('0');
    expect(getComputedStyle(items[2].querySelector('nve-icon[name="check"]') as HTMLElement).opacity).toBe('0');
  });

  it('should update check icon when selection changes', async () => {
    emulateClick(input);
    await elementIsStable(element);

    let items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(getComputedStyle(items[0].querySelector('nve-icon[name="check"]') as HTMLElement).opacity).toBe('1');
    expect(getComputedStyle(items[1].querySelector('nve-icon[name="check"]') as HTMLElement).opacity).toBe('0');

    emulateClick(items[1]);
    await elementIsStable(element);

    emulateClick(input);
    await elementIsStable(element);

    items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(getComputedStyle(items[0].querySelector('nve-icon[name="check"]') as HTMLElement).opacity).toBe('0');
    expect(getComputedStyle(items[1].querySelector('nve-icon[name="check"]') as HTMLElement).opacity).toBe('1');
  });
});

describe(`${Combobox.metadata.tag}: datalist vs select behavior`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Apple"></option>
          <option value="Banana"></option>
          <option value="Cherry"></option>
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should filter options on focus when using datalist', async () => {
    input.value = 'Ban';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await elementIsStable(element);

    const options = fixture.querySelectorAll<HTMLOptionElement>('option');
    expect(options[0].hidden).toBe(true);
    expect(options[1].hidden).toBe(false);
    expect(options[2].hidden).toBe(true);
  });

  it('should not render check icon or checkbox for datalist options', async () => {
    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].querySelector('nve-icon')).toBeFalsy();
    expect(items[0].querySelector('nve-checkbox')).toBeFalsy();
    expect(items[0].querySelector('input[type="checkbox"]')).toBeFalsy();
  });
});

describe(`${Combobox.metadata.tag}: select shows all options on focus`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select>
          <option value="Apple"></option>
          <option value="Banana"></option>
          <option value="Cherry"></option>
        </select>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should show all options on focus when using select', async () => {
    input.value = 'Ban';
    input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await elementIsStable(element);

    const options = fixture.querySelectorAll<HTMLOptionElement>('option');
    expect(options[0].hidden).toBe(false);
    expect(options[1].hidden).toBe(false);
    expect(options[2].hidden).toBe(false);
  });
});

describe(`${Combobox.metadata.tag}: dynamic options`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should render dynamically added options in open dropdown', async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);

    emulateClick(input);
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag).length).toBe(1);

    const datalist = fixture.querySelector('datalist');
    const option = document.createElement('option');
    option.value = 'Option 2';
    datalist.appendChild(option);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items.length).toBe(2);
    expect(items[1].textContent.trim()).toBe('Option 2');
  });

  it('should render dynamically added options before dropdown opens', async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);

    const datalist = fixture.querySelector('datalist');
    const option = document.createElement('option');
    option.value = 'Option 2';
    datalist.appendChild(option);
    await elementIsStable(element);

    emulateClick(input);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items.length).toBe(2);
  });

  it('should render dynamically added options in open dropdown (select)', async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select>
          <option value="Option 1"></option>
        </select>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);

    emulateClick(input);
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag).length).toBe(1);

    const select = fixture.querySelector('select');
    const option = document.createElement('option');
    option.value = 'Option 2';
    select.appendChild(option);
    await elementIsStable(element);

    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items.length).toBe(2);
    expect(items[1].textContent.trim()).toBe('Option 2');
  });
});

describe(`${Combobox.metadata.tag}: dropdown source`, () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
        </datalist>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass input container as source when opening dropdown', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
    const inputContainer = element.shadowRoot.querySelector<HTMLDivElement>('[input]');

    const openEvent = untilEvent<CustomEvent>(dropdown, 'open');
    emulateClick(input);
    const event = await openEvent;

    expect(event.detail.trigger).toBe(inputContainer);
  });
});
