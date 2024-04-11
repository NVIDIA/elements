import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Logo } from '@nvidia-elements/core/logo';
import '@nvidia-elements/core/logo/define.js';

describe('mlv-logo', () => {
  let fixture: HTMLElement;
  let element: Logo;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-logo></mlv-logo>
    `);
    element = fixture.querySelector('mlv-logo');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-logo')).toBeDefined();
  });

  it('should reflect a color palatte value', async () => {
    expect(element.color).toBe(undefined);
    expect(element.hasAttribute('color')).toBe(false);

    element.color = 'green-grass';
    await elementIsStable(element);
    expect(element.getAttribute('color')).toBe('green-grass');
  });

  it('should reflect a size value', async () => {
    expect(element.color).toBe(undefined);
    expect(element.hasAttribute('size')).toBe(false);

    element.size = 'sm';
    await elementIsStable(element);
    expect(element.getAttribute('size')).toBe('sm');
  });
});
