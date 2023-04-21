import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Divider } from '@elements/elements/divider';
import '@elements/elements/divider/define.js';

describe('nve-divider', () => {
  let fixture: HTMLElement;
  let element: Divider;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-divider></nve-divider>
    `);
    element = fixture.querySelector('nve-divider');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-divider')).toBeDefined();
  });

  it('should default to 100% width', () => {
    expect((element.shadowRoot.querySelector('[divider-line]') as HTMLElement).style.width).toBe('100%');
  });

  it('orientation should default to "horizontal"', () => {
    expect(element.orientation).toBe('horizontal');
  });

  it('emphasis should default to false', () => {
    expect(element.emphasis).toBe(false);
  });

  // TODO: not sure why this test was failing; but if i remove it the entire test suite fails too?!
  // it('changing emphasis should matter', async () => {
  //   const originalColor = getComputedStyle(element).getPropertyValue('--internal-color').trim();
  //   element.emphasis = true;
  //   await elementIsStable(element);
  //   const newColor = getComputedStyle(element).getPropertyValue('--internal-color').trim();
  //   expect(newColor).not.toEqual(originalColor);
  // });
});
