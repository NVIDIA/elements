import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Range } from '@elements/elements/range';
import '@elements/elements/range/define.js';

describe('mlv-range', () => {
  let fixture: HTMLElement;
  let element: Range;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-range>
        <label>label</label>
        <input type="range" />
      </mlv-range>
    `);
    element = fixture.querySelector('mlv-range');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-range')).toBeDefined();
  });
});
