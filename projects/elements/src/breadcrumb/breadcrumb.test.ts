import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Breadcrumb } from '@nvidia-elements/core/breadcrumb';
import '@nvidia-elements/core/breadcrumb/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe('nve-breadcrumb', () => {
  let fixture: HTMLElement;
  let element: Breadcrumb;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-breadcrumb>
        <nve-icon-button icon-name="home"><a href="#" aria-label="link to first page"></a></nve-icon-button>
        <nve-button><a href="#">Item</a></nve-button>
        <span>Static item</span>
      </nve-breadcrumb>
    `);
    element = fixture.querySelector('nve-breadcrumb');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-breadcrumb')).toBeDefined();
  });

  it('should assign elements to defined slot', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('[hidden-slot]');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);

    expect(element.querySelector('nve-icon-button').slot.includes('_')).toBe(true);
    expect(element.querySelector('nve-button').slot.includes('_')).toBe(true);
    expect(element.querySelector('span').slot.includes('_')).toBe(true);
  });

  it('should decorate clickable elements with inline', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('[hidden-slot]');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);

    expect(element.querySelector('nve-icon-button').container.includes('inline')).toBe(true);
    expect(element.querySelector('nve-button').container.includes('inline')).toBe(true);
  });

  it('should remove wrapper slot if a child is removed', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('[hidden-slot]');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(3);

    element.querySelector('nve-icon-button').remove();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(2);
  });

  it('should add wrapper slot if a child is added', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('[hidden-slot]');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(3);

    const button = document.createElement('nve-button');
    element.append(button);
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(4);
  });
});
