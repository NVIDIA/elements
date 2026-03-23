import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { MenuItem } from '@nvidia-elements/core/menu';
import '@nvidia-elements/core/menu/define.js';

describe(MenuItem.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: MenuItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-menu-item>item 1</nve-menu-item>
    `);
    element = fixture.querySelector(MenuItem.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(MenuItem.metadata.tag)).toBeDefined();
  });

  it('should initialize role menuitem', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('menuitem');
  });

  it('should have a type default of button', async () => {
    await elementIsStable(element);
    expect(element.type).toBe('button');
  });

  it('should initialize tabindex 0 for focus behavior', async () => {
    await elementIsStable(element);
    expect(element.tabIndex).toBe(0);
  });

  it('should remove tabindex if disabled', async () => {
    element.disabled = true;
    await elementIsStable(element);
    expect(element.tabIndex).toBe(-1);
  });

  it('should provide suffix slot', async () => {
    expect(element.shadowRoot.querySelector('slot[name="suffix"]')).toBeTruthy();
  });
});
