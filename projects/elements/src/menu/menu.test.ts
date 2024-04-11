import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Menu } from '@nvidia-elements/core/menu';
import '@nvidia-elements/core/menu/define.js';

describe('nve-menu', () => {
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
    element = fixture.querySelector('nve-menu');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-menu')).toBeDefined();
  });

  it('should initialize role menu', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('menu');
  });
});
