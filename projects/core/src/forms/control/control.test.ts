// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { Control, ControlMessage } from '@nvidia-elements/core/forms';
import '@nvidia-elements/core/forms/define.js';

describe(Control.metadata.tag, () => {
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
    element = fixture.querySelector(Control.metadata.tag);
    label = fixture.querySelector('label');
    input = fixture.querySelector('input');
    datalist = fixture.querySelector('datalist');
    message = fixture.querySelector(ControlMessage.metadata.tag);
    await elementIsStable(element);
    await elementIsStable(message);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Control.metadata.tag)).toBeDefined();
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

  it('should NOT associate datalist to input if child class disables _associateDatalist', async () => {
    element['_associateDatalist'] = false;
    input.setAttribute('list', '');
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    element.requestUpdate();
    await elementIsStable(element);
    expect(input.getAttribute('list')).toBe('');
  });

  it('should assign no-label style hook if no label element was provided', async () => {
    label.remove();
    expect(getComputedStyle(element.shadowRoot.querySelector('[part="_label"]')).display).toBe('none');
  });

  it('should assign no-message style hook if no control message was provided', async () => {
    message.remove();
    expect(getComputedStyle(element.shadowRoot.querySelector('[part="_messages"]')).display).toBe('none');
  });

  it('should assign no-message style hook if no visble control message was provided', async () => {
    message.hidden = true;
    expect(getComputedStyle(element.shadowRoot.querySelector('[part="_messages"]')).display).toBe('none');
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

  it('should reflect prominence attribute', async () => {
    expect(element.getAttribute('prominence')).toBe(null);
    element.prominence = 'muted';
    await elementIsStable(element);
    expect(element.getAttribute('prominence')).toBe('muted');
  });
});

describe(Control.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Control;
  let input: HTMLInputElement;
  let message: ControlMessage;
  let validationMessage: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control>
        <label>label</label>
        <input type="text" required />
        <nve-control-message>message</nve-control-message>
        <nve-control-message error="valueMissing">required</nve-control-message>
      </nve-control>
    `);
    element = fixture.querySelector(Control.metadata.tag);
    input = fixture.querySelector('input');
    message = fixture.querySelector(ControlMessage.metadata.tag);
    validationMessage = fixture.querySelector(`${ControlMessage.metadata.tag}[error="valueMissing"]`);
    await elementIsStable(element);
    await elementIsStable(message);
    await elementIsStable(validationMessage);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should hide non-validation messages if input is invalid', async () => {
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await elementIsStable(element);
    expect(getComputedStyle(message).display).toBe('none');
    expect(validationMessage.hidden).toBe(false);
  });

  it('should show non-validation messages if input is valid', async () => {
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await elementIsStable(element);
    expect(getComputedStyle(message).display).toBe('none');
    expect(validationMessage.hidden).toBe(false);

    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await elementIsStable(element);
    expect(getComputedStyle(message).display).toBe('block');
    expect(validationMessage.hidden).toBe(true);
  });
});

describe(`${Control.metadata.tag}: custom`, () => {
  let fixture: HTMLElement;
  let element: Control;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control>
        <label>label</label>
        <div nve-control="custom" tabindex="0" value=""></div>
      </nve-control>
    `);
    element = fixture.querySelector(Control.metadata.tag);
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
    const control = document.createElement(Control.metadata.tag);
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
    expect(await event).toBeDefined();
    expect(element.input.value).toBe('');
  });

  it('should apply custom control style state if slotted input is a custom input type', () => {
    expect(getComputedStyle(element).getPropertyValue('--control-type')).toBe('custom');
  });
});

describe(`${Control.metadata.tag}: fit-text input`, () => {
  let fixture: HTMLElement;
  let element: Control;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control fit-text>
        <label>label</label>
        <input type="text" value="1234" />
      </nve-control>
    `);
    element = fixture.querySelector(Control.metadata.tag);
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

describe(`${Control.metadata.tag}: fit-content input`, () => {
  let fixture: HTMLElement;
  let element: Control;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control fit-content>
        <label>label</label>
        <input type="text" />
      </nve-control>
    `);
    element = fixture.querySelector(Control.metadata.tag);
    input = fixture.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should update control width to input browser default content', async () => {
    await elementIsStable(element);
    await new Promise(r => requestAnimationFrame(r));
    expect(Math.floor(input.getBoundingClientRect().width) > 100).toBe(true);
    expect(Math.floor(input.getBoundingClientRect().width) < 250).toBe(true);
  });
});

describe(`${Control.metadata.tag}: fit-text select`, () => {
  let fixture: HTMLElement;
  let element: Control;
  let input: HTMLSelectElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control fit-text>
        <label>label</label>
        <select>
          <option value="1">Option 1</option>
          <option value="2">Option 12345678</option>
        </select>
        <nve-control-message>message</nve-control-message>
      </nve-control>
    `);
    element = fixture.querySelector(Control.metadata.tag);
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
