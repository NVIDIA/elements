import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { DrawerFooter } from '@elements/elements/drawer';
import '@elements/elements/drawer/define.js';

describe('mlv-drawer-footer', () => {
  let fixture: HTMLElement;
  let element: DrawerFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-drawer>
        <mlv-drawer-footer>hello</mlv-drawer-footer>
      </mlv-drawer>
    `);
    element = fixture.querySelector('mlv-drawer-footer');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-drawer-footer')).toBeDefined();
  });

  it('should render with the footer default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('footer');
  });
});
