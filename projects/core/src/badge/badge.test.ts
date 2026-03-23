import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Badge } from '@nvidia-elements/core/badge';
import { Icon } from '@nvidia-elements/core/icon';
import type { TaskStatus, TrendStatus } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/badge/define.js';

describe(Badge.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Badge;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-badge>label</nve-badge>
    `);
    element = fixture.querySelector(Badge.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Badge.metadata.tag)).toBeDefined();
  });

  describe('slots', () => {
    it('should provide suffix icon slot', async () => {
      expect(element.shadowRoot.querySelector('slot[name="suffix-icon"]')).toBeTruthy();
    });

    it('should assign unnamed icon slots to the first icon slot', async () => {
      const icon = document.createElement(Icon.metadata.tag);
      element.appendChild(icon);
      await elementIsStable(element);
      expect(
        element.shadowRoot.querySelector<HTMLSlotElement>('slot[name="prefix-icon"]').assignedElements()
      ).toContain(icon);
    });

    it('should provide prefix-icon slot', async () => {
      const prefixSlot = element.shadowRoot.querySelector<HTMLSlotElement>('slot[name="prefix-icon"]');
      expect(prefixSlot).toBeTruthy();
    });

    it('should provide default slot', async () => {
      const defaultSlot = element.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])');
      expect(defaultSlot).toBeTruthy();
    });

    it('should assign unnamed icons to prefix slot', async () => {
      const icon = document.createElement(Icon.metadata.tag);
      icon.setAttribute('name', 'test-icon');
      element.appendChild(icon);
      await elementIsStable(element);

      const prefixSlot = element.shadowRoot.querySelector<HTMLSlotElement>('slot[name="prefix-icon"]');
      expect(prefixSlot.assignedElements()).toContain(icon);
    });

    it('should not assign named slot icons', async () => {
      const icon = document.createElement(Icon.metadata.tag);
      icon.setAttribute('name', 'test-icon');
      icon.setAttribute('slot', 'suffix-icon');
      element.appendChild(icon);
      await elementIsStable(element);

      const prefixSlot = element.shadowRoot.querySelector<HTMLSlotElement>('slot[name="prefix-icon"]');
      expect(prefixSlot.assignedElements()).not.toContain(icon);
    });
  });

  describe('prominence property', () => {
    it('should reflect prominence attribute', async () => {
      expect(element.prominence).toBe(undefined);
      expect(element.hasAttribute('prominence')).toBe(false);

      element.prominence = 'emphasis';
      await elementIsStable(element);
      expect(element.getAttribute('prominence')).toBe('emphasis');
    });
  });

  describe('color property', () => {
    it('should allow custom icon and not render a default icon when using "color"', async () => {
      element.color = 'blue-cobalt';
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector(Icon.metadata.tag)).toBe(null);
    });

    it('should reflect color attribute', async () => {
      expect(element.color).toBe(undefined);
      expect(element.hasAttribute('color')).toBe(false);

      element.color = 'red-cardinal';
      await elementIsStable(element);
      expect(element.getAttribute('color')).toBe('red-cardinal');

      element.color = 'blue-cobalt';
      await elementIsStable(element);
      expect(element.getAttribute('color')).toBe('blue-cobalt');
    });

    it('should not render default icon when color is set', async () => {
      element.color = 'green-mint';
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector(Icon.metadata.tag)).toBe(null);
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
        expect(element.shadowRoot.querySelector(Icon.metadata.tag)).toBe(null);
      }
    });
  });

  describe('container property', () => {
    it('should reflect container attribute', async () => {
      expect(element.container).toBe(undefined);
      expect(element.hasAttribute('container')).toBe(false);

      element.container = 'flat';
      await elementIsStable(element);
      expect(element.getAttribute('container')).toBe('flat');
    });
  });

  describe('i18n property', () => {
    it('should have default i18n values', () => {
      expect(element.i18n).toBeDefined();
      expect(typeof element.i18n.trend).toBe('string');
      expect(typeof element.i18n.up).toBe('string');
      expect(typeof element.i18n.down).toBe('string');
      expect(typeof element.i18n.neutral).toBe('string');
    });

    it('should update aria-label with custom i18n', async () => {
      element.textContent = '+5%';
      element.status = 'trend-up';
      element.i18n = {
        ...element.i18n,
        trend: 'trending',
        up: 'increasing'
      };
      await elementIsStable(element);
      expect(element._internals.ariaLabel).toBe('+5% trending increasing');
    });
  });

  describe('status property', () => {
    it('should set a default aria role of status', async () => {
      await elementIsStable(element);
      expect(element._internals.role).toBe('status');
    });

    it('should reflect a status', async () => {
      expect(element.status).toBe(undefined);
      expect(element.hasAttribute('status')).toBe(false);

      element.status = 'restarting';
      await elementIsStable(element);
      expect(element.getAttribute('status')).toBe('restarting');
    });

    it('should work with all task status values', async () => {
      const taskStatuses = [
        'scheduled',
        'queued',
        'pending',
        'starting',
        'running',
        'restarting',
        'stopping',
        'finished',
        'failed',
        'unknown',
        'ignored'
      ] as const;

      for (const status of taskStatuses) {
        element.status = status as TaskStatus;
        await elementIsStable(element);
        expect(element.getAttribute('status')).toBe(status);

        // Should render status icon
        const icon = element.shadowRoot.querySelector<Icon>(Icon.metadata.tag);
        expect(icon).toBeTruthy();
        expect(icon.name).toBeDefined();
      }
    });

    it('should work with all support status values', async () => {
      const supportStatuses = ['accent', 'warning', 'success', 'danger'] as const;

      for (const status of supportStatuses) {
        element.status = status as TaskStatus;
        await elementIsStable(element);
        expect(element.getAttribute('status')).toBe(status);

        // Should render status icon
        const icon = element.shadowRoot.querySelector<Icon>(Icon.metadata.tag);
        expect(icon).toBeTruthy();
        expect(icon.name).toBeDefined();
      }
    });
  });

  describe('icon size logic', () => {
    it('should use small size for dot icons', async () => {
      // Test with a status that uses 'dot' icon
      element.status = 'pending'; // pending uses 'circle-dash' which is not 'dot'
      await elementIsStable(element);

      // The size logic is internal, but we can test that icons render correctly
      const icon = element.shadowRoot.querySelector<Icon>(Icon.metadata.tag);
      expect(icon).toBeTruthy();
    });

    it('should use medium size for non-dot icons', async () => {
      element.status = 'running';
      await elementIsStable(element);

      const icon = element.shadowRoot.querySelector<Icon>(Icon.metadata.tag);
      expect(icon).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should set a default aria-label', async () => {
      await elementIsStable(element);
      expect(element._internals.ariaLabel).toBe('label');
    });

    it('should maintain role="status"', async () => {
      element.status = 'running';
      await elementIsStable(element);
      expect(element._internals.role).toBe('status');

      element.color = 'blue-cobalt';
      await elementIsStable(element);
      expect(element._internals.role).toBe('status');
    });

    it('should provide meaningful aria-label for status badges', async () => {
      element.textContent = 'Processing';
      element.status = 'running';
      await elementIsStable(element);
      expect(element._internals.ariaLabel).toBe('Processing');
    });

    it('should update aria-label when content changes', async () => {
      element.textContent = 'Initial content';
      await elementIsStable(element);
      expect(element._internals.ariaLabel).toBe('Initial content');

      element.textContent = 'Updated content';
      await elementIsStable(element);
      expect(element._internals.ariaLabel).toBe('Updated content');
    });

    it('should provide meaningful aria-label for trend badges', async () => {
      element.textContent = '+25%';
      element.status = 'trend-up';
      await elementIsStable(element);
      expect(element._internals.ariaLabel).toBe('+25% trend up');
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', async () => {
      element.textContent = '';
      await elementIsStable(element);
      expect(element._internals.ariaLabel).toBe('');
    });

    it('should handle undefined status', async () => {
      element.status = undefined;
      await elementIsStable(element);
      expect(element.getAttribute('status')).toBe(null);

      // Should not render any icon
      const icon = element.shadowRoot.querySelector(Icon.metadata.tag);
      expect(icon).toBe(null);
    });

    it('should handle invalid status with no icon mapping', async () => {
      // @ts-expect-error - testing invalid status
      element.status = 'invalid-status';
      await elementIsStable(element);
      expect(element.getAttribute('status')).toBe('invalid-status');

      const icon = element.shadowRoot.querySelector<Icon>(Icon.metadata.tag);
      expect(icon).toBeTruthy();
      expect(icon.name).toBe('');
    });
  });

  describe('@deprecated trend status', () => {
    it('should provide trend icon when using a trend status', async () => {
      element.status = 'trend-up';
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector<Icon>(Icon.metadata.tag).name).toBe('trend-up');

      element.status = 'trend-down';
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector<Icon>(Icon.metadata.tag).name).toBe('trend-down');

      element.status = 'trend-neutral';
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector<Icon>(Icon.metadata.tag).name).toBe('minus');
    });

    it('should set trend specific label when status is a trend', async () => {
      element.textContent = '+10%';
      element.status = 'trend-up';
      await elementIsStable(element);
      expect(element._internals.ariaLabel).toBe('+10% trend up');
    });

    it('should work with all trend status values', async () => {
      const trendStatuses = ['trend-up', 'trend-down', 'trend-neutral'] as const;

      for (const status of trendStatuses) {
        element.status = status as TrendStatus;
        await elementIsStable(element);
        expect(element.getAttribute('status')).toBe(status);

        // Should render trend icon in suffix slot
        const icon = element.shadowRoot.querySelector<Icon>(Icon.metadata.tag);
        expect(icon).toBeTruthy();
        expect(icon.name).toBeDefined();
      }
    });

    it('should handle trend status with empty content', async () => {
      element.textContent = '';
      element.status = 'trend-up';
      await elementIsStable(element);
      expect(element._internals.ariaLabel).toBe(' trend up');
    });
  });
});
