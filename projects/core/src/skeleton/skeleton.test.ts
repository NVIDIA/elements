// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Skeleton } from '@nvidia-elements/core/skeleton';
import '@nvidia-elements/core/skeleton/define.js';

describe(Skeleton.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Skeleton;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-skeleton></nve-skeleton>
    `);
    element = fixture.querySelector(Skeleton.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Skeleton.metadata.tag)).toBeDefined();
  });

  describe('effect property', () => {
    it('should reflect effect attribute', async () => {
      expect(element.effect).toBe(undefined);
      expect(element.hasAttribute('effect')).toBe(false);

      element.effect = 'shimmer';
      await elementIsStable(element);
      expect(element.getAttribute('effect')).toBe('shimmer');

      element.effect = 'pulse';
      await elementIsStable(element);
      expect(element.getAttribute('effect')).toBe('pulse');
    });

    it('should work with shimmer effect', async () => {
      element.effect = 'shimmer';
      await elementIsStable(element);
      expect(element.getAttribute('effect')).toBe('shimmer');
    });

    it('should work with pulse effect', async () => {
      element.effect = 'pulse';
      await elementIsStable(element);
      expect(element.getAttribute('effect')).toBe('pulse');
    });
  });

  describe('shape property', () => {
    it('should reflect shape attribute', async () => {
      expect(element.shape).toBe(undefined);
      expect(element.hasAttribute('shape')).toBe(false);

      element.shape = 'round';
      await elementIsStable(element);
      expect(element.getAttribute('shape')).toBe('round');

      element.shape = 'pill';
      await elementIsStable(element);
      expect(element.getAttribute('shape')).toBe('pill');
    });

    it('should work with round shape', async () => {
      element.shape = 'round';
      await elementIsStable(element);
      expect(element.getAttribute('shape')).toBe('round');
    });

    it('should work with pill shape', async () => {
      element.shape = 'pill';
      await elementIsStable(element);
      expect(element.getAttribute('shape')).toBe('pill');
    });
  });

  describe('slots', () => {
    it('should provide default slot', async () => {
      const defaultSlot = element.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])');
      expect(defaultSlot).toBeTruthy();
    });

    it('should handle slotted content', async () => {
      const textContent = document.createTextNode('Loading content...');
      element.appendChild(textContent);
      await elementIsStable(element);

      const defaultSlot = element.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])');
      expect(defaultSlot.assignedNodes()).toContain(textContent);
    });
  });

  describe('internal state', () => {
    it('should not have slotted state when empty', async () => {
      expect(element._internals.states.has('slotted')).toBe(false);
    });

    it('should have slotted state when content is provided', async () => {
      const fixtureWithContent = await createFixture(html`
        <nve-skeleton>Content</nve-skeleton>
      `);
      const elementWithContent = fixtureWithContent.querySelector<Skeleton>(Skeleton.metadata.tag);
      await elementIsStable(elementWithContent);

      expect(elementWithContent._internals.states.has('slotted')).toBe(true);
      removeFixture(fixtureWithContent);
    });

    it('should not have slotted state for empty text content', async () => {
      const fixtureWithEmpty = await createFixture(html`
        <nve-skeleton>   </nve-skeleton>
      `);
      const elementWithEmpty = fixtureWithEmpty.querySelector<Skeleton>(Skeleton.metadata.tag);
      await elementIsStable(elementWithEmpty);

      expect(elementWithEmpty._internals.states.has('slotted')).toBe(false);
      removeFixture(fixtureWithEmpty);
    });

    it('should have slotted state when element is slotted', async () => {
      const fixtureWithElement = await createFixture(html`
        <nve-skeleton><div>Some content</div></nve-skeleton>
      `);
      const elementWithSlotted = fixtureWithElement.querySelector<Skeleton>(Skeleton.metadata.tag);
      await elementIsStable(elementWithSlotted);

      expect(elementWithSlotted._internals.states.has('slotted')).toBe(true);
      removeFixture(fixtureWithElement);
    });
  });

  describe('rendering', () => {
    it('should render animate div', () => {
      const animateDiv = element.shadowRoot.querySelector('.animate');
      expect(animateDiv).toBeTruthy();
    });

    it('should render with internal-host attribute', () => {
      const hostDiv = element.shadowRoot.querySelector('[internal-host]');
      expect(hostDiv).toBeTruthy();
    });
  });

  describe('combined properties', () => {
    it('should work with both effect and shape properties set', async () => {
      element.effect = 'shimmer';
      element.shape = 'round';
      await elementIsStable(element);

      expect(element.getAttribute('effect')).toBe('shimmer');
      expect(element.getAttribute('shape')).toBe('round');
    });

    it('should update both properties independently', async () => {
      element.effect = 'pulse';
      element.shape = 'pill';
      await elementIsStable(element);

      expect(element.getAttribute('effect')).toBe('pulse');
      expect(element.getAttribute('shape')).toBe('pill');

      element.effect = 'shimmer';
      await elementIsStable(element);
      expect(element.getAttribute('effect')).toBe('shimmer');
      expect(element.getAttribute('shape')).toBe('pill');
    });
  });
});
