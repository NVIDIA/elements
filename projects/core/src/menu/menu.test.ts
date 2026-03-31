import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
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

  it('should navigate between items with ArrowDown key', async () => {
    await elementIsStable(element);
    const items = element.items;
    items[0].focus();
    expect(items[0].matches(':focus')).toBe(true);

    items[0].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(items[1].matches(':focus')).toBe(true);
  });

  it('should navigate between items with ArrowUp key', async () => {
    await elementIsStable(element);
    const items = element.items;
    items[1].focus();
    expect(items[1].matches(':focus')).toBe(true);

    items[1].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(items[0].matches(':focus')).toBe(true);
  });

  it('should skip disabled items during keyboard navigation', async () => {
    await elementIsStable(element);
    const items = element.items;
    items[1].disabled = true;
    await elementIsStable(element);

    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(items[2].matches(':focus')).toBe(true);
  });
});
