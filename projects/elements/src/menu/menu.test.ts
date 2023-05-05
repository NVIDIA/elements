import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Menu } from '@elements/elements/menu';
import '@elements/elements/menu/define.js';

describe('mlv-menu', () => {
  let fixture: HTMLElement;
  let element: Menu;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-menu>
        <mlv-menu-item>item 1</mlv-menu-item>
        <mlv-menu-item>item 2</mlv-menu-item>
        <mlv-menu-item>item 3</mlv-menu-item>
      </mlv-menu>
    `);
    element = fixture.querySelector('mlv-menu');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-menu')).toBeDefined();
  });

  it('should initialize role menu', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('menu');
  });
});
