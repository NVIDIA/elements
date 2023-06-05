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
    element.shadowRoot.querySelector('slot').dispatchEvent(new Event('slotchange'));
    await elementIsStable(element);
    await new Promise(r => setTimeout(r, 0));
    const items: any[] = Array.from(element.querySelectorAll('*'));
    expect(items[0].getAttribute('slot').includes('_')).toBe(true);
  });

  it('should decorate clickable elements with ghost interaction', async () => {
    element.shadowRoot.querySelector('slot').dispatchEvent(new Event('slotchange'));
    const items: any[] = Array.from(element.querySelectorAll('*'));
    await elementIsStable(element);
    expect(items[0].getAttribute('interaction')).toBe('ghost');
    expect(items[3].getAttribute('interaction')).toBe(null);
  });
});
