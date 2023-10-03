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
    element = fixture.querySelectorAll('nve-divider')[0];
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-divider')).toBeDefined();
  });

  it('orientation should default to "horizontal"', () => {
    expect(element.orientation).toBe('horizontal');
    expect(element._internals.ariaOrientation).toBe('horizontal');
  });

  it('should initialize role separator', () => {
    expect(element._internals.role).toBe('separator');
  });

  it('should reflect a orientation attribute', async () => {
    expect(element.orientation).toBe('horizontal');
    expect(element.getAttribute('orientation')).toBe('horizontal');

    element.orientation = 'vertical';
    await elementIsStable(element);
    expect(element.getAttribute('orientation')).toBe('vertical');
  });
});
