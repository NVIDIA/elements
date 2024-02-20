import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { Radio } from '@elements/elements/radio';
import '@elements/elements/radio/define.js';

describe('nve-radio', () => {
  let fixture: HTMLElement;
  let element: Radio;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-radio>
        <label>label</label>
        <input type="radio" />
      </nve-radio>
    `);
    element = fixture.querySelector('nve-radio');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-radio')).toBeDefined();
  });
});
