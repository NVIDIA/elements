import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Logo } from '@nvidia-elements/core/logo';
import '@nvidia-elements/core/logo/define.js';

describe(Logo.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Logo;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-logo></nve-logo>
    `);
    element = fixture.querySelector(Logo.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Logo.metadata.tag)).toBeDefined();
  });

  describe('color property', () => {
    it('should reflect a color palette value', async () => {
      expect(element.color).toBe(undefined);
      expect(element.hasAttribute('color')).toBe(false);

      element.color = 'green-grass';
      await elementIsStable(element);
      expect(element.getAttribute('color')).toBe('green-grass');
    });

    it('should work with all color values', async () => {
      const colors = [
        'red-cardinal',
        'gray-slate',
        'gray-denim',
        'blue-indigo',
        'blue-cobalt',
        'blue-sky',
        'teal-cyan',
        'green-mint',
        'teal-seafoam',
        'green-grass',
        'yellow-amber',
        'orange-pumpkin',
        'red-tomato',
        'pink-magenta',
        'purple-plum',
        'purple-violet',
        'purple-lavender',
        'pink-rose',
        'green-jade',
        'lime-pear',
        'yellow-nova',
        'brand-green'
      ] as const;

      for (const color of colors) {
        element.color = color;
        await elementIsStable(element);
        expect(element.getAttribute('color')).toBe(color);
      }
    });

    it('should handle color property removal', async () => {
      element.color = 'green-grass';
      await elementIsStable(element);
      expect(element.getAttribute('color')).toBe('green-grass');

      element.color = undefined;
      await elementIsStable(element);
      expect(element.hasAttribute('color')).toBe(false);
    });
  });

  describe('size property', () => {
    it('should reflect a size value', async () => {
      expect(element.size).toBe(undefined);
      expect(element.hasAttribute('size')).toBe(false);

      element.size = 'sm';
      await elementIsStable(element);
      expect(element.getAttribute('size')).toBe('sm');
    });

    it('should work with all size values', async () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      for (const size of sizes) {
        element.size = size;
        await elementIsStable(element);
        expect(element.getAttribute('size')).toBe(size);
      }
    });

    it('should handle size property removal', async () => {
      element.size = 'md';
      await elementIsStable(element);
      expect(element.getAttribute('size')).toBe('md');

      element.size = undefined;
      await elementIsStable(element);
      expect(element.hasAttribute('size')).toBe(false);
    });
  });

  describe('slots', () => {
    it('should provide default slot', async () => {
      const defaultSlot = element.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])');
      expect(defaultSlot).toBeTruthy();
    });

    it('should render default SVG when no content is provided', async () => {
      const svg = element.shadowRoot.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg.getAttribute('viewBox')).toBe('0 0 26 17');
    });

    it('should render custom content when provided', async () => {
      const customFixture = await createFixture(html`
        <nve-logo>
          <span>Custom Logo</span>
        </nve-logo>
      `);
      const customElement = customFixture.querySelector(Logo.metadata.tag) as Logo;
      await elementIsStable(customElement);

      const slot = customElement.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])');
      const assignedElements = slot.assignedElements();

      expect(assignedElements).toHaveLength(1);
      expect(assignedElements[0].textContent).toBe('Custom Logo');

      removeFixture(customFixture);
    });
  });

  describe('accessibility', () => {
    it('should set role="img" on connectedCallback', async () => {
      expect(element._internals.role).toBe('img');
    });
  });

  describe('properties interaction', () => {
    it('should handle both color and size properties together', async () => {
      element.color = 'blue-cobalt';
      element.size = 'lg';
      await elementIsStable(element);

      expect(element.getAttribute('color')).toBe('blue-cobalt');
      expect(element.getAttribute('size')).toBe('lg');
    });

    it('should maintain properties when one is removed', async () => {
      element.color = 'red-cardinal';
      element.size = 'md';
      await elementIsStable(element);

      element.color = undefined;
      await elementIsStable(element);

      expect(element.hasAttribute('color')).toBe(false);
      expect(element.getAttribute('size')).toBe('md');
    });
  });
});
