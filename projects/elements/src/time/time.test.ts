import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Time } from '@elements/elements/time';
import '@elements/elements/time/define.js';

describe('mlv-time', () => {
  let fixture: HTMLElement;
  let element: Time;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-time>
        <label>label</label>
        <input type="time" />
      </mlv-time>
    `);
    element = fixture.querySelector('mlv-time');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-time')).toBeDefined();
  });

  it('should render clock suffix icon', () => {
    expect(element.shadowRoot.querySelector('mlv-icon-button').getAttribute('icon-name')).toBe('schedule');
  });

  it('should trigger native UI', async () => {
    element.shadowRoot.querySelector('mlv-icon-button').click();
    await elementIsStable(element);
    expect(element.input.matches(':focus')).toBe(false);
  });
});
