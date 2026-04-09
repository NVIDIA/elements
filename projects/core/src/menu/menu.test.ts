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
});
