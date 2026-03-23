import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { DrawerContent } from '@nvidia-elements/core/drawer';
import '@nvidia-elements/core/drawer/define.js';

describe(DrawerContent.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DrawerContent;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-drawer>
        <nve-drawer-content>hello</nve-drawer-content>
      </nve-drawer>
    `);
    element = fixture.querySelector(DrawerContent.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(DrawerContent.metadata.tag)).toBeDefined();
  });
});
