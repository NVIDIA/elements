import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Date } from '@elements/elements/date';
import '@elements/elements/date/define.js';

describe('nve-date', () => {
  let fixture: HTMLElement;
  let element: Date;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-date>
        <label>label</label>
        <input type="date" />
      </nve-date>
    `);
    element = fixture.querySelector('nve-date');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-date')).toBeDefined();
  });


  it('should render calendar suffix icon', () => {
    expect(element.shadowRoot.querySelector('nve-icon-button').getAttribute('icon-name')).toBe('date');
  });
});
