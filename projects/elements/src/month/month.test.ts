import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { Month } from '@elements/elements/month';
import '@elements/elements/month/define.js';

describe('mlv-month', () => {
  let fixture: HTMLElement;
  let element: Month;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-month>
        <label>label</label>
        <input type="month" />
      </mlv-month>
    `);
    element = fixture.querySelector('mlv-month');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-month')).toBeDefined();
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
