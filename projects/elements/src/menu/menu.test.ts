import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Menu } from '@nvidia-elements/core/menu';
import '@nvidia-elements/core/menu/define.js';

describe(Menu.metadata.tag, () => {
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
});
