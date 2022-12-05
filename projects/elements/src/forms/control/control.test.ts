import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Control, ControlMessage } from '@elements/elements/forms';
import '@elements/elements/forms/define.js';

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

  it('should assign mlv-control attribute identifier', async() => {
    expect(element.hasAttribute('mlv-control')).toBe(true);
  });

  it('should associate label to input', async() => {
    expect(input.id).toBe(label.htmlFor);
  });

  it('should assign label to label slot', async() => {
    expect(label.slot).toBe('label');
  });

  it('should associate message to input', async() => {
    await elementIsStable(element);
    expect(input.getAttribute('aria-describedby')).toBe(message.id);
  });

  it('should associate datalist to input', async() => {
    await elementIsStable(element);
    expect(input.getAttribute('list')).toBe(datalist.id);
  });

  it('should assign no-label style hook if no label element was provided', async() => {
    label.remove();
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.no-label')).toBeTruthy();
  });

  it('should assign no-message style hook if no control message was provided', async() => {
    message.remove();
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.no-messages')).toBeTruthy();
  });

  it('should assign no-message style hook if no visble control message was provided', async() => {
    message.hidden = true;
    element.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.no-messages')).toBeTruthy();
  });
});
