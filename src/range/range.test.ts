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
        <input type="range" value="50" />
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

  it('should set the custom track width', async () => {
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--track-width')).toBe('50%');
  });

  it('should update the custom track width', async () => {
    element.querySelector('input').value = '99';
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--track-width')).toBe('99%');
  });
});
