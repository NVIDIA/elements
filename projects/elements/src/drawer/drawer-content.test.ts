import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { DrawerContent } from '@nvidia-elements/core/drawer';
import '@nvidia-elements/core/drawer/define.js';

describe(DrawerContent.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DrawerContent;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-drawer>
        <mlv-drawer-content>hello</mlv-drawer-content>
      </mlv-drawer>
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
