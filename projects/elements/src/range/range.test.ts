import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Range } from '@elements/elements/range';
import '@elements/elements/range/define.js';

describe('nve-range', () => {
  let fixture: HTMLElement;
  let element: Range;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-range>
        <label>label</label>
        <input type="range" value="50" />
      </nve-range>
    `);
    element = fixture.querySelector('nve-range');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-range')).toBeDefined();
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

  it('should update the custom track width with custom min/max', async () => {
    element.input.min = '20';
    element.input.max = '80';
    element.querySelector('input').value = '66';
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--track-width')).toBe('76%');
  });

  it('should update the custom track width when input changes', async () => {
    element.querySelector('input').value = '50';
    await elementIsStable(element);
    element.querySelector('input').dispatchEvent(new Event('input'));
    expect(element.style.getPropertyValue('--track-width')).toBe('50%');
  });
});
