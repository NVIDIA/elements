import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Radio } from '@elements/elements/radio';
import '@elements/elements/radio/define.js';

describe('mlv-radio', () => {
  let fixture: HTMLElement;
  let element: Radio;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-radio>
        <label>label</label>
        <input type="radio" />
      </mlv-radio>
    `);
    element = fixture.querySelector('mlv-radio');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-radio')).toBeDefined();
  });
});
