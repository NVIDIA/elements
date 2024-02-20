import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { DrawerContent } from '@elements/elements/drawer';
import '@elements/elements/drawer/define.js';

describe('mlv-drawer-content', () => {
  let fixture: HTMLElement;
  let element: DrawerContent;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-drawer>
        <mlv-drawer-content>hello</mlv-drawer-content>
      </mlv-drawer>
    `);
    element = fixture.querySelector('mlv-drawer-content');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-drawer-content')).toBeDefined();
  });
});
