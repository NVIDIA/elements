import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@elements/elements/test';
import { Control, ControlMessage } from '@elements/elements/forms';
import '@elements/elements/forms/define.js';

describe('nve-control', () => {
  let fixture: HTMLElement;
  let element: Control;
  let label: HTMLLabelElement;
  let input: HTMLInputElement;
  let datalist: HTMLDataListElement;
  let message: ControlMessage;


  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control>
        <label>label</label>
        <input type="text" />
        <nve-control-message></nve-control-message>
        <datalist>
          <option value="1">one</option>
          <option value="2">two</option>
        </datalist>
      </nve-control>
    `);
    element = fixture.querySelector('nve-control');
    label = fixture.querySelector('label');
    input = fixture.querySelector('input');
    datalist = fixture.querySelector('datalist');
    message = fixture.querySelector('nve-control-message');
    await elementIsStable(element);
    await elementIsStable(message);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-control')).toBeDefined();
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

  it('should apply custom control attribute if slotted input is a custom input type', async () => {
    expect(element.hasAttribute('multiple')).toBe(false);
    element.input.multiple = true;
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    expect(element.hasAttribute('multiple')).toBe(true);
  });

  it('should apply nve-control attribute with no custom value if native input provided', async () => {
    expect(element.getAttribute('nve-control')).toBe('');
  });
});

describe('nve-control custom', () => {
  let fixture: HTMLElement;
  let element: Control;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control>
        <label>label</label>
        <div nve-control tabindex="0" value=""></div>
      </nve-control>
    `);
    element = fixture.querySelector('nve-control');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should apply custom control attribute if slotted input is a custom input type', async () => {
    expect(element.getAttribute('nve-control')).toBe('custom');
  });

  it('should focus input if custom and does not implement "showPicker"', async () => {
    expect(element.input.showPicker).toBeTruthy();

    element.input.checkValidity = () => true;
    element.input.showPicker();
    await element.updateComplete;
    expect(document.activeElement).toBe(element.input);
  });

  it('should create a control instance without throwing due to not yet slotted input', async () => {
    const control = document.createElement('nve-control');
    control.id = 'nve-control-instance';
    document.body.appendChild(control);

    expect(document.querySelector('#nve-control-instance')).toBeDefined();
    control.remove();
  });

  it('should reset form control value when reset is called', async () => {
    const event = untilEvent(element, 'reset');
    element.input.value = 'test';
    await element.updateComplete;
    
    element.reset();
    expect((await event)).toBeDefined();
    expect(element.input.value).toBe('');
  });
});
