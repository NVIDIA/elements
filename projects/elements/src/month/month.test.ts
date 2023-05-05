import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Month } from '@elements/elements/month';
import '@elements/elements/month/define.js';

describe('nve-month', () => {
  let fixture: HTMLElement;
  let element: Month;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-month>
        <label>label</label>
        <input type="month" />
      </nve-month>
    `);
    element = fixture.querySelector('nve-month');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-month')).toBeDefined();
  });

  it('should render calendar suffix icon', () => {
    expect(element.shadowRoot.querySelector('nve-icon-button').getAttribute('icon-name')).toBe('date');
  });

  it('should trigger native UI', async () => {
    element.shadowRoot.querySelector('nve-icon-button').click();
    await elementIsStable(element);
    expect(element.input.matches(':focus')).toBe(false);
  });
});
