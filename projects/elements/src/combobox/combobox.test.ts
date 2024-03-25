import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { Combobox } from '@elements/elements/combobox';
import type { Menu, MenuItem } from '@elements/elements/menu';
import type { Dropdown } from '@elements/elements/dropdown';
import '@elements/elements/combobox/define.js';

describe('nve-combobox', () => {
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
    element = fixture.querySelector('nve-combobox');
    input = fixture.querySelector('input');
    options = Array.from(fixture.querySelectorAll<HTMLOptionElement>('option'));
    items = Array.from(element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item'));
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-combobox')).toBeDefined();
  });

  it('should remove native data list association', async () => {
    expect(input.getAttribute('list')).toBe('');
  });

  it('should render a menu item for each provided option', async () => {
    emulateClick(input);
    await elementIsStable(element);
    expect(items.length).toBe(3);
  });

  it('should reflect each option to a menu item', async () => {
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
    expect(items.length).toBe(3);
    expect(items[0].textContent.trim()).toBe(options[0].value);
    expect(items[1].textContent.trim()).toBe(options[1].value);
    expect(items[2].textContent.trim()).toBe(options[2].value);
  });

  it('should default the dropdown to align start to prevent overflow clipping when options are wider than the input itsself', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');
    expect(dropdown.alignment).toBe('start');
  });

  it('should set width of dropdown when opened', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');
    expect(dropdown.hidden).toBe(true);
    emulateClick(input);
    await elementIsStable(element);
    expect(dropdown.style.getPropertyValue('--min-width')).toBe(
      `${element.shadowRoot.querySelector('[input]').getBoundingClientRect().width}px`
    );
  });

  it('should each menu with the aria role of listbox', async () => {
    const menu = element.shadowRoot.querySelector<Menu>('nve-menu');
    expect(menu.getAttribute('role')).toBe('listbox');
  });

  it('should each menu item with the aria role of option', async () => {
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
    expect(items[0].getAttribute('role')).toBe('option');
    expect(items[1].getAttribute('role')).toBe('option');
    expect(items[2].getAttribute('role')).toBe('option');
  });

  it('should show options on keydown', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');
    expect(dropdown.hidden).toBe(true);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);
  });

  it('should hide options on escape keypress', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');
    expect(dropdown.hidden).toBe(true);

    input.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true }));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);

    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(true);
  });

  it('should close dropdown when menu item is selected', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');
    expect(dropdown.hidden).toBe(true);

    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);
  });

  it('should focus first option if key arrow down is pressed', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');
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
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');

    expect(dropdown.hidden).toBe(true);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' }));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(true);
  });

  it('should autocomplete on tab if there is a partial match to first available option', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');

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
    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');
    expect(dropdown.hidden).toBe(true);

    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);

    emulateClick(items[0]);
    expect(input.value).toBe('Option 1');
  });

  it('should show "no results" message if no options are provided', async () => {
    const options = element.querySelectorAll('option');
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');
    expect(dropdown.hidden).toBe(true);

    options.forEach(i => i.remove());
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);
    expect(element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item')[0].textContent.trim()).toBe(
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
});

describe('nve-combobox single select', () => {
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
    element = fixture.querySelector('nve-combobox');
    input = fixture.querySelector('input');
    select = fixture.querySelector('select');
    options = Array.from(fixture.querySelectorAll('option'));
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-combobox')).toBeDefined();
  });

  it('should initialize input to the selected option', async () => {
    expect(options[0].selected).toBe(true);
    expect(select.value).toBe('option 1');
    expect(input.value).toBe('option 1');
  });

  it('should reflect each option to a menu item', async () => {
    input.value = '';
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
    expect(items.length).toBe(3);
    expect(items[0].textContent.trim()).toBe(options[0].value);
    expect(items[1].textContent.trim()).toBe(options[1].value);
    expect(items[2].textContent.trim()).toBe(options[2].value);
  });

  it('should enforce single select and clear invalid options', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');

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
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');

    input.value = 'opt';
    input.dispatchEvent(new Event('keydown', { bubbles: true }));

    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);

    const items = Array.from(element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item'));
    emulateClick(items[1]);
    expect(input.value).toBe('option 2');
    expect(select.value).toBe('option 2');
  });

  it('should preserve partial search while focusing within selection dropdown', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');

    input.value = 'opt';
    input.dispatchEvent(new Event('keydown', { bubbles: true }));

    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);

    expect(input.value).toBe('opt');
    expect(select.value).toBe('option 1');
  });

  it('should autocomplete on tab if there is a partial match to first available option', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');

    expect(dropdown.hidden).toBe(true);
    element.dispatchEvent(new KeyboardEvent('keydown'));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(false);

    input.value = 'opt';
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' }));
    await elementIsStable(element);
    expect(dropdown.hidden).toBe(true);
    expect(input.value).toBe('option 1');
    expect(select.value).toBe('option 1');
  });
});

describe('nve-combobox multi select', () => {
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
          <option selected value="option 1"></option>
          <option selected value="option 2"></option>
          <option value="option 3"></option>
        </select>
        <nve-control-message>message</nve-control-message>
      </nve-combobox>
    `);
    element = fixture.querySelector('nve-combobox');
    input = fixture.querySelector('input');
    select = fixture.querySelector('select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-combobox')).toBeDefined();
  });

  it('should initialize :state(multiple) state', () => {
    expect(element.matches(':state(multiple)')).toBe(true);
  });

  it('should cooresponding menu items and options as selected', async () => {
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
    expect(items[0].selected).toBe(true);
    expect(items[1].selected).toBe(true);
    expect(items[2].selected).toBe(undefined);
    expect(items.length).toBe(3);
    expect(select.selectedOptions.length).toBe(2);
  });

  it('should update select when menu item is clicked', async () => {
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
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
    const tags = () => element.shadowRoot.querySelectorAll('nve-tag');
    expect(tags().length).toBe(2);
    expect(select.selectedOptions.length).toBe(2);

    emulateClick(tags()[0]);
    await elementIsStable(element);
    expect(tags().length).toBe(1);
    expect(select.selectedOptions.length).toBe(1);
  });

  it('should hide tags and display label when multiple is used and tags overflow container', async () => {
    expect(element.matches(':state(multiple-overflow)')).toBe(false);
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;
    element.style.setProperty('--width', '50px');

    element.requestUpdate();
    await elementIsStable(element);
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(element.matches(':state(multiple-overflow)')).toBe(true);
  });

  it('should clear and reset text input and select when reset() is called', async () => {
    const tags = () => element.shadowRoot.querySelectorAll('nve-tag');
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

    element.shadowRoot.querySelectorAll('nve-menu-item')[0].click();
    element.shadowRoot.querySelectorAll('nve-menu-item')[2].click();

    await elementIsStable(element);
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(element.matches(':state(multiple-overflow)')).toBe(true);
  });

  it('should remove overflow if additional space is available', async () => {
    expect(element.matches(':state(multiple-overflow)')).toBe(false);
    select.multiple = true;
    select.options[0].selected = true;
    select.options[1].selected = true;
    element.style.setProperty('--width', '50px');

    element.requestUpdate();
    await elementIsStable(element);
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(element.matches(':state(multiple-overflow)')).toBe(true);

    select.options[0].selected = false;
    select.options[1].selected = false;
    element.style.setProperty('--width', 'initial');

    element.requestUpdate();
    await elementIsStable(element);
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(element.matches(':state(multiple-overflow)')).toBe(false);
  });

  it('should select all options when selectAll() is called', async () => {
    const tags = () => element.shadowRoot.querySelectorAll('nve-tag');
    expect(tags().length).toBe(2);
    expect(select.selectedOptions.length).toBe(2);
    expect(input.value).toBe('');

    const event = untilEvent(select, 'change');
    element.selectAll();
    await event;
    expect(select.selectedOptions.length).toBe(3);
    expect(input.value).toBe('');
  });
});

@customElement('combobox-test-element')
class ComboboxTestElement extends LitElement {
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

describe('nve-combobox shadow root', () => {
  let fixture: HTMLElement;
  let element: Combobox;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html` <combobox-test-element></combobox-test-element> `);
    element = fixture.querySelector('combobox-test-element').shadowRoot.querySelector('nve-combobox');
    input = fixture.querySelector('combobox-test-element').shadowRoot.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should focus first option if key arrow down is pressed', async () => {
    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');
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
});

describe('nve-combobox option labels for single select', () => {
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
          <option selected value="1">option 1</option>
          <option value="2">option 2</option>
          <option value="3">option 3</option>
        </select>
        <nve-control-message>message</nve-control-message>
      </nve-combobox>
    `);
    element = fixture.querySelector('nve-combobox');
    input = fixture.querySelector('input');
    select = fixture.querySelector('select');
    options = Array.from(fixture.querySelectorAll('option'));
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-combobox')).toBeDefined();
  });

  it('should initialize input to the selected option label', async () => {
    expect(options[0].selected).toBe(true);
    expect(input.value).toBe('option 1');
  });

  it('should initialize select to the selected option value', async () => {
    expect(options[0].selected).toBe(true);
    expect(select.value).toBe('1');
  });

  it('should reflect each option label to a menu item', async () => {
    input.value = '';
    emulateClick(input);
    await elementIsStable(element);
    const items = element.shadowRoot.querySelectorAll<MenuItem>('nve-menu-item');
    expect(items.length).toBe(3);
    expect(items[0].textContent.trim()).toBe(options[0].label);
    expect(items[1].textContent.trim()).toBe(options[1].label);
    expect(items[2].textContent.trim()).toBe(options[2].label);
  });

  it('should enforce single select and clear invalid options', async () => {
    const dropdown = element.shadowRoot.querySelector<Dropdown>('nve-dropdown');

    expect(options[0].selected).toBe(true);
    expect(options[1].selected).toBe(false);
    expect(options[2].selected).toBe(false);
    expect(select.value).toBe('1');
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
});
