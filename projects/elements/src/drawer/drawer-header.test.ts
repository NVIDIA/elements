import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { DrawerHeader } from '@nvidia-elements/core/drawer';
import '@nvidia-elements/core/drawer/define.js';

describe('mlv-drawer-header', () => {
  let fixture: HTMLElement;
  let element: DrawerHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-drawer>
        <mlv-drawer-header>hello</mlv-drawer-header>
      </mlv-drawer>
    `);
    element = fixture.querySelector('mlv-drawer-header');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-drawer-header')).toBeDefined();
  });

  it('should render with the header default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('header');
  });
});
