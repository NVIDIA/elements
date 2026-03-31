import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Divider } from '@nvidia-elements/core/divider';
import '@nvidia-elements/core/divider/define.js';

describe(Divider.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Divider;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-divider></nve-divider>
    `);
    element = fixture.querySelectorAll<Divider>(Divider.metadata.tag)[0];
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Divider.metadata.tag)).toBeDefined();
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

  it('should update ariaOrientation when orientation property changes', async () => {
    expect(element._internals.ariaOrientation).toBe('horizontal');

    element.orientation = 'vertical';
    await elementIsStable(element);
    expect(element._internals.ariaOrientation).toBe('vertical');

    element.orientation = 'horizontal';
    await elementIsStable(element);
    expect(element._internals.ariaOrientation).toBe('horizontal');
  });
});
