import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { Datetime } from '@elements/elements/datetime';
import '@elements/elements/datetime/define.js';

describe('mlv-datetime', () => {
  let fixture: HTMLElement;
  let element: Datetime;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-datetime>
        <label>label</label>
        <input type="datetime" />
      </mlv-datetime>
    `);
    element = fixture.querySelector('mlv-datetime');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-datetime')).toBeDefined();
  });

  it('should render calendar suffix icon', () => {
    expect(element.shadowRoot.querySelector('mlv-icon-button').getAttribute('icon-name')).toBe('calendar');
  });

  it('should trigger native UI', async () => {
    element.shadowRoot.querySelector('mlv-icon-button').click();
    await elementIsStable(element);
    expect(element.input.matches(':focus')).toBe(false);
  });
});
