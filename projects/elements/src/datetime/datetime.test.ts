import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { Datetime } from '@nvidia-elements/core/datetime';
import '@nvidia-elements/core/datetime/define.js';

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
    expect(element.shadowRoot.querySelector('nve-icon-button').getAttribute('icon-name')).toBe('calendar');
  });

  it('should trigger native UI', async () => {
    element.shadowRoot.querySelector('nve-icon-button').click();
    await elementIsStable(element);
    expect(element.input.matches(':focus')).toBe(false);
  });
});
