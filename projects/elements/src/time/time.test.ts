import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { Time } from '@elements/elements/time';
import '@elements/elements/time/define.js';

describe('nve-time', () => {
  let fixture: HTMLElement;
  let element: Time;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-time>
        <label>label</label>
        <input type="time" />
      </nve-time>
    `);
    element = fixture.querySelector('nve-time');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-time')).toBeDefined();
  });

  it('should render clock suffix icon', () => {
    expect(element.shadowRoot.querySelector('nve-icon-button').getAttribute('icon-name')).toBe('clock');
  });

  it('should trigger native UI', async () => {
    element.shadowRoot.querySelector('nve-icon-button').click();
    await elementIsStable(element);
    expect(element.input.matches(':focus')).toBe(false);
  });
});
