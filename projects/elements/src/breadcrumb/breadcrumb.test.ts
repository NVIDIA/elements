import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Breadcrumb } from '@elements/elements/breadcrumb';
import '@elements/elements/breadcrumb/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

describe('mlv-breadcrumb', () => {
  let fixture: HTMLElement;
  let element: Breadcrumb;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-breadcrumb>
        <mlv-icon-button icon-name="home"><a href="#" aria-label="link to first page"></a></mlv-icon-button>
        <mlv-button><a href="#">Item</a></mlv-button>
        <span>Static item</span>
      </mlv-breadcrumb>
    `);
    element = fixture.querySelector('mlv-breadcrumb');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-breadcrumb')).toBeDefined();
  });

  it('should assign elements to defined slot', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('[hidden-slot]');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);

    expect(element.querySelector('mlv-icon-button').slot.includes('_')).toBe(true);
    expect(element.querySelector('mlv-button').slot.includes('_')).toBe(true);
    expect(element.querySelector('span').slot.includes('_')).toBe(true);
  });

  it('should decorate clickable elements with ghost interaction', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('[hidden-slot]');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);

    expect(element.querySelector('mlv-icon-button').interaction.includes('ghost')).toBe(true);
    expect(element.querySelector('mlv-button').interaction.includes('ghost')).toBe(true);
  });

  it('should remove wrapper slot if a child is removed', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('[hidden-slot]');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(3);

    element.querySelector('mlv-icon-button').remove();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(2);
  });

  it('should add wrapper slot if a child is added', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('[hidden-slot]');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(3);

    const button = document.createElement('mlv-button');
    element.append(button);
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(4);
  });
});
