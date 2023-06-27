import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Breadcrumb } from '@elements/elements/breadcrumb';
import '@elements/elements/breadcrumb/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

describe('nve-breadcrumb', () => {
  let fixture: HTMLElement;
  let element: Breadcrumb;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-breadcrumb>
        <nve-icon-button icon-name="home"><a href="#" aria-label="link to first page"></a></nve-icon-button>
        <nve-button><a href="#">Item</a></nve-button>
        <span>Static item</span>
        <h4>noop</h4>
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
    expect(element.querySelector('h4').slot).toBe('');
  });

  it('should decorate clickable elements with ghost interaction', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('[hidden-slot]');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);

    expect(element.querySelector('nve-icon-button').interaction.includes('ghost')).toBe(true);
    expect(element.querySelector('nve-button').interaction.includes('ghost')).toBe(true);
  });

  it('should remove wrapper slot if a child is removed', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('[hidden-slot]');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(4);

    element.querySelector('nve-icon-button').remove();
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(3);
  });

  it('should add wrapper slot if a child is added', async () => {
    const slot = element.shadowRoot.querySelector<HTMLSlotElement>('[hidden-slot]');
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(4);

    const button = document.createElement('nve-button');
    element.append(button);
    slot.dispatchEvent(new CustomEvent('slotchange', { target: slot } as any));
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('li').length).toBe(5);
  });
});
