import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Datetime } from '@elements/elements/datetime';
import '@elements/elements/datetime/define.js';

describe('nve-datetime', () => {
  let fixture: HTMLElement;
  let element: Datetime;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-datetime>
        <label>label</label>
        <input type="datetime" />
      </nve-datetime>
    `);
    element = fixture.querySelector('nve-datetime');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-datetime')).toBeDefined();
  });


  it('should render calendar suffix icon', () => {
    expect(element.shadowRoot.querySelector('nve-icon-button').getAttribute('icon-name')).toBe('date');
  });
});
