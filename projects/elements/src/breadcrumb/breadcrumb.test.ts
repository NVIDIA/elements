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
        <h4>noop</h4>
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
