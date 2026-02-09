import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Time } from '@nvidia-elements/core/time';
import '@nvidia-elements/core/time/define.js';

describe(Time.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Time;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-time>
        <label>label</label>
        <input type="time" />
      </nve-time>
    `);
    element = fixture.querySelector(Time.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Time.metadata.tag)).toBeDefined();
  });

  it('should render clock suffix icon', () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('icon-name')).toBe('clock');
  });

  it('should trigger native UI', async () => {
    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();
    await elementIsStable(element);
    expect(element.input.matches(':focus')).toBe(false);
  });
});
