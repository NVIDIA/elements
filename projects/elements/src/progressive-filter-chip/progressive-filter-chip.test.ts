import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { ProgressiveFilterChip } from '@nvidia-elements/core/progressive-filter-chip';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Button } from '@nvidia-elements/core/button';
import { Select } from '@nvidia-elements/core/select';
import { Input } from '@nvidia-elements/core/input';
import { Date } from '@nvidia-elements/core/date';
import '@nvidia-elements/core/progressive-filter-chip/define.js';
import '@nvidia-elements/core/forms/define.js';

describe(ProgressiveFilterChip.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ProgressiveFilterChip;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-progressive-filter-chip>
        <select>
          <option value="1">option 1</option>
          <option value="2">option 2</option>
        </select>
        <input type="text" value="text value" />
        <input type="date" value="2021-01-01" />
      </nve-progressive-filter-chip>
    `);
    element = fixture.querySelector(ProgressiveFilterChip.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ProgressiveFilterChip.metadata.tag)).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBeTruthy();
  });

  it('should apply proper aria label for close button', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('close');
  });

  it('should trigger close event when close button clicked', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();
    expect(await event).toBeDefined();
  });

  it('should render a nve-select when a select is slotted', () => {
    expect(element.shadowRoot.querySelector(Select.metadata.tag)).toBeTruthy();
  });

  it('should render a nve-input when a text input is slotted', () => {
    expect(element.shadowRoot.querySelector(Input.metadata.tag)).toBeTruthy();
  });

  it('should render a nve-date when a date input is slotted', () => {
    expect(element.shadowRoot.querySelector(Date.metadata.tag)).toBeTruthy();
  });

  it('should use a plain slot when a custom input is slotted', async () => {
    element.querySelector('select').remove();
    element.querySelector('[type=text]').remove();
    element.querySelector('[type=date]').remove();
    element.appendChild(document.createElement(Button.metadata.tag));
    await elementIsStable(element);

    expect(element.shadowRoot.querySelector(Select.metadata.tag)).toBe(null);
    expect(element.shadowRoot.querySelector(Input.metadata.tag)).toBe(null);
    expect(element.shadowRoot.querySelector(Date.metadata.tag)).toBe(null);
    expect(element.shadowRoot.querySelector('slot').name).toBe(element.querySelector(Button.metadata.tag).slot);
  });

  it('should remove item when slot is empty', async () => {
    element.querySelector('select').remove();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(Select.metadata.tag)).toBe(null);
  });

  it('should only update options if valid element is slotted', async () => {
    const el = document.createElement('div');
    element.appendChild(el);
    await elementIsStable(element);
    expect(element['inputs'].length).toBe(3);
  });
});
