import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@nvidia-elements/testing';
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

  it('should show a check icon when the option is selected', async () => {
    expect(options[0].selected).toBe(true);
    const items = element.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
    expect(items[0].querySelector('nve-icon[name="check"]')).toBeTruthy();
  });

  it('should reflect each option to a menu item', async () => {
    input.value = '';
    emulateClick(input);
    await elementIsStable(element);
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
});

describe(`${Combobox.metadata.tag}: multi select`, () => {
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
