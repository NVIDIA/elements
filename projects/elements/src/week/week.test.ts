import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Week } from '@elements/elements/week';
import '@elements/elements/week/define.js';

describe('mlv-week', () => {
  let fixture: HTMLElement;
  let element: Week;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-week>
        <label>label</label>
        <input type="week" />
      </mlv-week>
    `);
    element = fixture.querySelector('mlv-week');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-week')).toBeDefined();
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
