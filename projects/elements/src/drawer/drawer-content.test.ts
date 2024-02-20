import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { DrawerContent } from '@elements/elements/drawer';
import '@elements/elements/drawer/define.js';

describe('nve-drawer-content', () => {
  let fixture: HTMLElement;
  let element: DrawerContent;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-drawer>
        <nve-drawer-content>hello</nve-drawer-content>
      </nve-drawer>
    `);
    element = fixture.querySelector('nve-drawer-content');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-drawer-content')).toBeDefined();
  });
});
