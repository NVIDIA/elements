import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { DrawerHeader } from '@nvidia-elements/core/drawer';
import '@nvidia-elements/core/drawer/define.js';

describe(DrawerHeader.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DrawerHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-drawer>
        <mlv-drawer-header>hello</mlv-drawer-header>
      </mlv-drawer>
    `);
    element = fixture.querySelector(DrawerHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(DrawerHeader.metadata.tag)).toBeDefined();
  });

  it('should render with the header default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('header');
  });
});
