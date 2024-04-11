import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { Control, ControlMessage } from '@nvidia-elements/core/forms';
import '@nvidia-elements/core/forms/define.js';

describe('mlv-control', () => {
  let fixture: HTMLElement;
  let element: Control;
  let label: HTMLLabelElement;
  let input: HTMLInputElement;
  let datalist: HTMLDataListElement;
  let message: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-control>
        <label>label</label>
        <input type="text" />
        <mlv-control-message></mlv-control-message>
        <datalist>
          <option value="1">one</option>
          <option value="2">two</option>
        </datalist>
      </mlv-control>
    `);
    element = fixture.querySelector('mlv-control');
    label = fixture.querySelector('label');
    input = fixture.querySelector('input');
    datalist = fixture.querySelector('datalist');
    message = fixture.querySelector('mlv-control-message');
    await elementIsStable(element);
    await elementIsStable(message);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-control')).toBeDefined();
  });

  it('should assign nve-control attribute identifier', async () => {
    expect(element.hasAttribute('nve-control')).toBe(true);
  });

  it('should associate label to input', async () => {
    expect(input.id).toBe(label.htmlFor);
  });

  it('should assign label to label slot', async () => {
    expect(label.slot).toBe('label');
  });

  it('should associate message to input', async () => {
    await elementIsStable(element);
    expect(input.getAttribute('aria-describedby')).toBe(message.id);
  });

  it('should associate datalist to input', async () => {
    await elementIsStable(element);
    expect(input.getAttribute('list')).toBe(datalist.id);
  });

  it('should assign no-label style hook if no label element was provided', async () => {
    label.remove();
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.no-label')).toBeTruthy();
  });

  it('should assign no-message style hook if no control message was provided', async () => {
    message.remove();
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.no-messages')).toBeTruthy();
  });

  it('should assign no-message style hook if no visble control message was provided', async () => {
    message.hidden = true;
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.no-messages')).toBeTruthy();
  });

  it('should apply multiple attribute if input type is "multiple"', async () => {
    expect(element.hasAttribute('multiple')).toBe(false);
    element.input.multiple = true;
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    expect(element.hasAttribute('multiple')).toBe(true);
  });

  it('should apply nve-control attribute', async () => {
    expect(element.getAttribute('nve-control')).toBe('');
  });

  it('should not apply custom control style state if slotted input is a native input type', () => {
    expect(getComputedStyle(element).getPropertyValue('--control-type')).toBe('');
  });
});

describe('mlv-control custom', () => {
  let fixture: HTMLElement;
  let element: Control;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-control>
        <label>label</label>
        <div nve-control="custom" tabindex="0" value=""></div>
      </mlv-control>
    `);
    element = fixture.querySelector('mlv-control');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should focus input if custom and does not implement "showPicker"', async () => {
    expect(element.input.showPicker).toBeTruthy();

    element.input.checkValidity = () => true;
    element.input.showPicker();
    await element.updateComplete;
    expect(document.activeElement).toBe(element.input);
  });

  it('should create a control instance without throwing due to not yet slotted input', async () => {
    const control = document.createElement('mlv-control');
    control.id = 'mlv-control-instance';
    document.body.appendChild(control);

    expect(document.querySelector('#mlv-control-instance')).toBeDefined();
    control.remove();
  });

  it('should reset form control value when reset is called', async () => {
    const event = untilEvent(element, 'reset');
    element.input.value = 'test';
    await element.updateComplete;

    element.reset();
    expect(await event).toBeDefined();
    expect(element.input.value).toBe('');
  });

  it('should apply custom control style state if slotted input is a custom input type', () => {
    expect(getComputedStyle(element).getPropertyValue('--control-type')).toBe('custom');
  });
});

describe('mlv-control fit-text input', () => {
  let fixture: HTMLElement;
  let element: Control;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-control fit-text>
        <label>label</label>
        <input type="text" value="1234" />
      </mlv-control>
    `);
    element = fixture.querySelector('mlv-control');
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should set control width to input text character width', async () => {
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--control-width')).toBe(`4ch`);
  });

  it('should update control width to input text character width', async () => {
    await elementIsStable(element);
    input.value = '123456789012345678901234567890';
    input.dispatchEvent(new Event('input'));
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--control-width')).toBe(`30ch`);
  });

  it('should update control width to input text character width with icon offset', async () => {
    await elementIsStable(element);
    input.type = 'date';
    input.value = '';
    input.dispatchEvent(new Event('input'));
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--control-width')).toBe(`4ch`);
    expect(input.style.maxWidth).toBe(`2ch`);
  });
});

describe('mlv-control fit-content input', () => {
  let fixture: HTMLElement;
  let element: Control;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-control fit-content>
        <label>label</label>
        <input type="text" />
      </mlv-control>
    `);
    element = fixture.querySelector('mlv-control');
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should update control width to input browser default content', async () => {
    await elementIsStable(element);
    expect(Math.floor(input.getBoundingClientRect().width) > 100).toBe(true);
    expect(Math.floor(input.getBoundingClientRect().width) < 200).toBe(true);
  });
});

describe('mlv-control fit-text select', () => {
  let fixture: HTMLElement;
  let element: Control;
  let input: HTMLSelectElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-control fit-text>
        <label>label</label>
        <select>
          <option value="1">Option 1</option>
          <option value="2">Option 12345678</option>
        </select>
        <mlv-control-message>message</mlv-control-message>
      </mlv-control>
    `);
    element = fixture.querySelector('mlv-control');
    input = fixture.querySelector('select');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should set control width to input text character width', async () => {
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--control-width')).toBe(`12ch`);
  });

  it('should update control width to input text character width', async () => {
    await elementIsStable(element);
    input.value = '2';
    input.dispatchEvent(new Event('change'));
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--control-width')).toBe(`19ch`);
  });
});
