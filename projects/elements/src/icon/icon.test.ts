import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@elements/elements/test';
import { Icon, mergeIcons } from '@elements/elements/icon';
import '@elements/elements/icon/define.js';

describe('nve-icon', () => {
  let fixture: HTMLElement;
  let element: Icon;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-icon></nve-icon>`);
    element = fixture.querySelector('nve-icon');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-icon')).toBeDefined();
  });

  it('should update svg reference when "name" is updated', async () => {
    expect(element.name).eq(undefined);
    element.name = 'book';
    await elementIsStable(element);
    expect(element.shadowRoot.innerHTML).includes('<div internal-host="">');
  });

  it('should reflect name attribute for CSS selectors', async () => {
    expect(element.name).eq(undefined);
    element.name = 'book';
    await elementIsStable(element);
    expect(element.getAttribute('name')).toBe('book');
  });

  it('should allow icon aliasing', () => {
    expect((customElements.get('nve-icon') as any)._icons['chevron-up']).toStrictEqual((customElements.get('nve-icon') as any)._icons['chevron']);
  });

  it('should allow icons to be registered', async () => {
    await (customElements.get('nve-icon') as any).add({
      'test-svg': { svg: () => '<svg id="test-svg"><path d=""/></svg>' }
    });

    expect((customElements.get('nve-icon') as any)._icons['test-svg']).toBeDefined();
  });

  it('should allow dynamic paths', async () => {
    element.name = './assets/icons.svg' as any;
    await elementIsStable(element);
    await new Promise(r => setTimeout(r, 100));
    expect((customElements.get('nve-icon') as any)._icons['./assets/icons.svg']).toBeTruthy();
  });

  it('should update when new icon is registered', async () => {
    element.name = 'test-svg' as any;
    await elementIsStable(element);

    const event = untilEvent(document, 'nve-icon-test-svg');
    (customElements.get('nve-icon') as any).add({
      'test-svg': { svg: () => '<svg id="test-svg"><path d=""/></svg>' }
    });
    expect((await event)).toBeDefined();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('#test-svg')).toBeTruthy();
  });

  it('should merge conflicting icon versions to latest', async () => {
    element.name = 'add';
    class Registered {
      static metadata = {
        version: '0.0.0'
      }

      static _icons = {
        'merge-svg': { svg: () => '<svg id="merge-svg"><path d=""/></svg>' }
      }
    }

    mergeIcons(Registered as unknown as typeof Icon);
    expect(Registered._icons['merge-svg']).toBeDefined();
  });
});
