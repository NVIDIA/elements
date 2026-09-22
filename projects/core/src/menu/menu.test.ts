// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Menu } from '@nvidia-elements/core/menu';
import '@nvidia-elements/core/menu/define.js';

describe(Menu.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Menu;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-menu>
        <nve-menu-item>item 1</nve-menu-item>
        <nve-menu-item>item 2</nve-menu-item>
        <nve-menu-item>item 3</nve-menu-item>
      </nve-menu>
    `);
    element = fixture.querySelector(Menu.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Menu.metadata.tag)).toBeDefined();
  });

  it('should initialize role menu', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('menu');
  });

  it('should leave density unset by default', () => {
    expect(element.density).toBeUndefined();
    expect(element.hasAttribute('density')).toBe(false);
  });

  it.each(['compact', 'default'] as const)('should reflect density %s to an attribute', async density => {
    element.density = density;
    await elementIsStable(element);

    expect(element.getAttribute('density')).toBe(density);
  });

  it.each(['compact', 'default'] as const)('should update density from attribute %s', async density => {
    element.setAttribute('density', density);
    await elementIsStable(element);

    expect(element.density).toBe(density);
  });

  it('should remove the density attribute when the property is cleared', async () => {
    element.density = 'compact';
    await elementIsStable(element);

    element.density = undefined;
    await elementIsStable(element);

    expect(element.hasAttribute('density')).toBe(false);
  });

  it('should navigate between items with ArrowDown key', async () => {
    await elementIsStable(element);
    const items = element.querySelectorAll('nve-menu-item');
    items[0].focus();
    expect(items[0].matches(':focus')).toBe(true);

    items[0].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(items[1].matches(':focus')).toBe(true);
  });

  it('should navigate between items with ArrowUp key', async () => {
    await elementIsStable(element);
    const items = element.querySelectorAll('nve-menu-item');
    items[1].focus();
    expect(items[1].matches(':focus')).toBe(true);

    items[1].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(items[0].matches(':focus')).toBe(true);
  });

  it('should skip disabled items during keyboard navigation', async () => {
    await elementIsStable(element);
    const items = element.querySelectorAll('nve-menu-item');
    items[1].disabled = true;
    await elementIsStable(element);

    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(items[2].matches(':focus')).toBe(true);
  });
});

describe(`${Menu.metadata.tag}: density and item slots`, () => {
  let fixture: HTMLElement;
  let element: Menu;
  let prefixSlot: HTMLSlotElement;
  let labelSlot: HTMLSlotElement;
  let suffixSlot: HTMLSlotElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-menu>
        <nve-menu-item>
          <span slot="prefix">prefix</span>
          <span>label</span>
          <span slot="suffix">suffix</span>
        </nve-menu-item>
      </nve-menu>
    `);
    element = fixture.querySelector(Menu.metadata.tag);
    await elementIsStable(element);
    const item = element.querySelector('nve-menu-item');
    await elementIsStable(item);
    prefixSlot = item.shadowRoot.querySelector('slot[name="prefix"]');
    labelSlot = item.shadowRoot.querySelector('slot:not([name])');
    suffixSlot = item.shadowRoot.querySelector('slot[name="suffix"]');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should display the prefix, label, and suffix when density is unset', () => {
    expect(getComputedStyle(prefixSlot).display).not.toBe('none');
    expect(getComputedStyle(labelSlot).display).not.toBe('none');
    expect(getComputedStyle(suffixSlot).display).not.toBe('none');
  });

  it('should hide the label and suffix while keeping the prefix visible in compact density', async () => {
    element.density = 'compact';
    await elementIsStable(element);

    expect(getComputedStyle(prefixSlot).display).not.toBe('none');
    expect(getComputedStyle(labelSlot).display).toBe('none');
    expect(getComputedStyle(suffixSlot).display).toBe('none');
  });

  it.each(['default', undefined] as const)(
    'should restore the label and suffix when density becomes %s',
    async density => {
      element.density = 'compact';
      await elementIsStable(element);
      expect(getComputedStyle(labelSlot).display).toBe('none');
      expect(getComputedStyle(suffixSlot).display).toBe('none');

      element.density = density;
      await elementIsStable(element);

      expect(getComputedStyle(prefixSlot).display).not.toBe('none');
      expect(getComputedStyle(labelSlot).display).not.toBe('none');
      expect(getComputedStyle(suffixSlot).display).not.toBe('none');
    }
  );
});

describe(`${Menu.metadata.tag}: menu group slot`, () => {
  let fixture: HTMLElement;
  let element: Menu;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-menu-group>
        <nve-menu>item</nve-menu>
      </nve-menu-group>
    `);
    element = fixture.querySelector(Menu.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should clear an automatically assigned menu slot on disconnect', () => {
    expect(element.slot).toBe('menu');
    element.remove();
    expect(element.slot).toBe('');

    fixture.querySelector('nve-menu-group').append(element);
    expect(element.slot).toBe('menu');
    element.remove();
    expect(element.slot).toBe('');
  });

  it('should preserve an authored menu slot on disconnect', () => {
    element.remove();
    const authoredGroup = document.createElement('nve-menu-group');
    element = document.createElement(Menu.metadata.tag);
    element.slot = 'menu';
    authoredGroup.append(element);
    fixture.append(authoredGroup);

    element.remove();
    expect(element.slot).toBe('menu');
  });

  it('should preserve a changed slot on disconnect', () => {
    element.slot = 'other';
    element.remove();
    expect(element.slot).toBe('other');
  });
});

describe(`${Menu.metadata.tag}: scroll event`, () => {
  let fixture: HTMLElement;
  let element: Menu;
  let scrollContainer: HTMLElement;

  beforeEach(async () => {
    const itemsHtml = Array(30)
      .fill(0)
      .map((_, i) => `<nve-menu-item>item ${i + 1}</nve-menu-item>`)
      .join('');
    fixture = await createFixture(html`
      <nve-menu style="--max-height: 100px">
        ${document.createRange().createContextualFragment(itemsHtml)}
      </nve-menu>
    `);
    element = fixture.querySelector(Menu.metadata.tag);
    await elementIsStable(element);
    await new Promise(r => setTimeout(r, 50));
    scrollContainer = element.shadowRoot.querySelector('[internal-host]');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should fire scroll event with correct detail when the internal host scrolls', async () => {
    const spy = vi.fn();
    element.addEventListener('scroll', spy);

    scrollContainer.scrollTop = 50;
    scrollContainer.dispatchEvent(new Event('scroll'));
    await new Promise(r => requestAnimationFrame(r));

    expect(spy).toHaveBeenCalledTimes(1);
    const detail = spy.mock.calls[0][0].detail;
    expect(detail.scrollHeight).toBeGreaterThan(0);
    expect(detail.clientHeight).toBeGreaterThan(0);
    expect(typeof detail.scrollTop).toBe('number');
  });

  it('should have composed: true and bubbles: true', async () => {
    const spy = vi.fn();
    element.addEventListener('scroll', spy);

    scrollContainer.scrollTop = 50;
    scrollContainer.dispatchEvent(new Event('scroll'));
    await new Promise(r => requestAnimationFrame(r));

    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.composed).toBe(true);
    expect(event.bubbles).toBe(true);
  });

  it('should throttle to one dispatch per animation frame', async () => {
    const spy = vi.fn();
    element.addEventListener('scroll', spy);

    scrollContainer.scrollTop = 10;
    scrollContainer.dispatchEvent(new Event('scroll'));
    scrollContainer.scrollTop = 20;
    scrollContainer.dispatchEvent(new Event('scroll'));
    scrollContainer.scrollTop = 30;
    scrollContainer.dispatchEvent(new Event('scroll'));
    await new Promise(r => requestAnimationFrame(r));

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not fire scroll event when the internal host is removed before animation frame', async () => {
    const spy = vi.fn();
    element.addEventListener('scroll', spy);

    scrollContainer.scrollTop = 50;
    scrollContainer.dispatchEvent(new Event('scroll'));
    scrollContainer.remove();
    await new Promise(r => requestAnimationFrame(r));

    expect(spy).not.toHaveBeenCalled();
  });
});
