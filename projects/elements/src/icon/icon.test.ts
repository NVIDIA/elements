import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@elements/elements/test';
import { Icon } from '@elements/elements/icon';
import '@elements/elements/icon/define.js';

describe('mlv-icon', () => {
  let fixture: HTMLElement;
  let element: Icon;

  beforeEach(async () => {
    fixture = await createFixture(html`<mlv-icon></mlv-icon>`);
    element = fixture.querySelector('mlv-icon');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-icon')).toBeDefined();
  });

  it('should provide a aria role of img', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('img');
  });

  it('should use aria-hidden to semantically hide the SVG in favor of the host element role', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('[internal-host]').getAttribute('aria-hidden')).toBe('true');
  });

  it('should update svg reference when "name" is updated', async () => {
    expect(element.name).eq(undefined);
    element.name = 'book';
    await elementIsStable(element);
    expect(element.shadowRoot.innerHTML).includes('<div internal-host=""');
  });

  it('should reflect name attribute for CSS selectors', async () => {
    expect(element.name).eq(undefined);
    element.name = 'book';
    await elementIsStable(element);
    expect(element.getAttribute('name')).toBe('book');
  });

  it('should allow icon aliasing', () => {
    expect((customElements.get('mlv-icon') as any)._icons['chevron-up']).toStrictEqual((customElements.get('mlv-icon') as any)._icons['chevron']);
  });

  it('should allow icons to be registered', async () => {
    await (customElements.get('mlv-icon') as any).add({
      'test-svg': { svg: () => '<svg id="test-svg"><path d=""/></svg>' }
    });

    expect((customElements.get('mlv-icon') as any)._icons['test-svg']).toBeDefined();
  });

  it('should allow dynamic paths', async () => {
    element.name = './assets/icons.svg' as any;
    await elementIsStable(element);
    await new Promise(r => setTimeout(r, 100));
    expect((customElements.get('mlv-icon') as any)._icons['./assets/icons.svg']).toBeTruthy();
  });

  it('should update when new icon is registered', async () => {
    element.name = 'test-svg' as any;
    await elementIsStable(element);

    const event = untilEvent(document, 'mlv-icon-test-svg');
    (customElements.get('mlv-icon') as any).add({
      'test-svg': { svg: () => '<svg id="test-svg"><path d=""/></svg>' }
    });
    expect((await event)).toBeDefined();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('#test-svg')).toBeTruthy();
  });
});
