import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Logo } from '@elements/elements/logo';
import '@elements/elements/logo/define.js';

describe('nve-logo', () => {
  let fixture: HTMLElement;
  let element: Logo;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-logo></nve-logo>
    `);
    element = fixture.querySelector('nve-logo');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-logo')).toBeDefined();
  });

  it('should reflect a color palatte value', async () => {
    expect(element.color).toBe(undefined);
    expect(element.hasAttribute('color')).toBe(false);

    element.color = 'green-grass';
    await elementIsStable(element);
    expect(element.getAttribute('color')).toBe('green-grass');
  });
});
