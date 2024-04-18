import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Drawer } from '@nvidia-elements/core/drawer';
import '@nvidia-elements/core/drawer/define.js';

describe(Drawer.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Drawer;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-drawer closable>hello</mlv-drawer>
    `);
    element = fixture.querySelector(Drawer.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Drawer.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
