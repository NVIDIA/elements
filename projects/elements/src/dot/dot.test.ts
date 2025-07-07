import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Dot } from '@nvidia-elements/core/dot';
import type { SupportStatus, TaskStatus, Size } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/dot/define.js';

describe(Dot.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Dot;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dot></nve-dot>
    `);
    element = fixture.querySelector(Dot.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Dot.metadata.tag)).toBeDefined();
  });

  it('should have correct ARIA role', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('img');
  });

  describe('status property', () => {
    it('should reflect a status', async () => {
      expect(element.status).toBe(undefined);
      expect(element.hasAttribute('status')).toBe(false);

      element.status = 'restarting';
      await elementIsStable(element);
      expect(element.getAttribute('status')).toBe('restarting');
    });

    it('should work with all support status values', async () => {
      const supportStatuses: SupportStatus[] = ['accent', 'warning', 'success', 'danger'];

      for (const status of supportStatuses) {
        element.status = status;
        await elementIsStable(element);
        expect(element.getAttribute('status')).toBe(status);
      }
    });

    it('should work with all task status values', async () => {
      const taskStatuses: TaskStatus[] = [
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
      ];

      for (const status of taskStatuses) {
        element.status = status;
        await elementIsStable(element);
        expect(element.getAttribute('status')).toBe(status);
      }
    });

    it('should handle empty status value', async () => {
      element.status = 'restarting';
      await elementIsStable(element);
      expect(element.getAttribute('status')).toBe('restarting');

      element.status = undefined;
      await elementIsStable(element);
      expect(element.hasAttribute('status')).toBe(false);
    });
  });

  describe('size property', () => {
    it('should reflect a size', async () => {
      expect(element.size).toBe(undefined);
      expect(element.hasAttribute('size')).toBe(false);

      element.size = 'sm';
      await elementIsStable(element);
      expect(element.getAttribute('size')).toBe('sm');
    });

    it('should work with all size values', async () => {
      const sizes: Size[] = ['sm', 'md', 'lg'];

      for (const size of sizes) {
        element.size = size;
        await elementIsStable(element);
        expect(element.getAttribute('size')).toBe(size);
      }
    });

    it('should handle empty size value', async () => {
      element.size = 'md';
      await elementIsStable(element);
      expect(element.getAttribute('size')).toBe('md');

      element.size = undefined;
      await elementIsStable(element);
      expect(element.hasAttribute('size')).toBe(false);
    });
  });

  describe('slot behavior', () => {
    it('should apply slotted text specific styles', async () => {
      await elementIsStable(element);
      expect(element.matches(':state(has-text)')).toBe(false);

      element.innerHTML = '<span>test</span>';
      await elementIsStable(element);
      expect(element.matches(':state(has-text)')).toBe(true);

      element.innerHTML = '';
      await elementIsStable(element);
      expect(element.matches(':state(has-text)')).toBe(false);
    });

    it('should handle text content changes', async () => {
      element.textContent = 'test';
      await elementIsStable(element);
      expect(element.matches(':state(has-text)')).toBe(true);

      element.textContent = '';
      await elementIsStable(element);
      expect(element.matches(':state(has-text)')).toBe(false);

      element.textContent = 'another test';
      await elementIsStable(element);
      expect(element.matches(':state(has-text)')).toBe(true);
    });

    it('should handle whitespace-only content', async () => {
      element.textContent = '   ';
      await elementIsStable(element);
      expect(element.matches(':state(has-text)')).toBe(true); // textContent.length > 0

      element.textContent = '  test  ';
      await elementIsStable(element);
      expect(element.matches(':state(has-text)')).toBe(true);
    });
  });

  describe('combined properties', () => {
    it('should work with both status and size set', async () => {
      element.status = 'success';
      element.size = 'lg';
      await elementIsStable(element);

      expect(element.getAttribute('status')).toBe('success');
      expect(element.getAttribute('size')).toBe('lg');
    });

    it('should maintain state when properties are updated', async () => {
      element.status = 'warning';
      element.size = 'md';
      element.textContent = 'test';
      await elementIsStable(element);

      expect(element.getAttribute('status')).toBe('warning');
      expect(element.getAttribute('size')).toBe('md');
      expect(element.matches(':state(has-text)')).toBe(true);

      element.status = 'danger';
      element.size = 'sm';
      element.textContent = '';
      await elementIsStable(element);

      expect(element.getAttribute('status')).toBe('danger');
      expect(element.getAttribute('size')).toBe('sm');
      expect(element.matches(':state(has-text)')).toBe(false);
    });
  });
});
