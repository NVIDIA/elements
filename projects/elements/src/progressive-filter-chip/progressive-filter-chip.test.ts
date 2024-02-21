import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { ProgressiveFilterChip } from '@elements/elements/progressive-filter-chip';
import '@elements/elements/progressive-filter-chip/define.js';
import '@elements/elements/forms/define.js';

describe('nve-progressive-filter-chip', () => {
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
    element = fixture.querySelector('nve-progressive-filter-chip');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-progressive-filter-chip')).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBeTruthy();
  });

  it('should apply proper aria label for close button', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button').ariaLabel).toBe('close');
  });

  it('should trigger close event when close button clicked', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector('nve-icon-button').click();
    expect(await event).toBeDefined();
  });

  it('should render a nve-select when a select is slotted', () => {
    expect(element.shadowRoot.querySelector('nve-select')).toBeTruthy();
  });

  it('should render a nve-input when a text input is slotted', () => {
    expect(element.shadowRoot.querySelector('nve-input')).toBeTruthy();
  });

  it('should render a nve-date when a date input is slotted', () => {
    expect(element.shadowRoot.querySelector('nve-date')).toBeTruthy();
  });

  it('should use a plain slot when a custom input is slotted', async () => {
    element.querySelector('select').remove();
    element.querySelector('[type=text]').remove();
    element.querySelector('[type=date]').remove();
    element.appendChild(document.createElement('nve-button'));
    await elementIsStable(element);

    expect(element.shadowRoot.querySelector('nve-select')).toBe(null);
    expect(element.shadowRoot.querySelector('nve-input')).toBe(null);
    expect(element.shadowRoot.querySelector('nve-date')).toBe(null);
    expect(element.shadowRoot.querySelector('slot').name).toBe(element.querySelector('nve-button').slot);
  });

  it('should remove item when slot is empty', async () => {
    element.querySelector('select').remove();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-select')).toBe(null);
  });

  it('should only update options if valid element is slotted', async () => {
    const el = document.createElement('div');
    element.appendChild(el);
    await elementIsStable(element);
    expect((element as any).inputs.length).toBe(3);
  });
});
