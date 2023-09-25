import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Drawer } from '@elements/elements/drawer';
import '@elements/elements/drawer/define.js';

describe('mlv-drawer axe', () => {
  let fixture: HTMLElement;
  let element: Drawer;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-drawer closable>hello</mlv-drawer>
    `);
    element = fixture.querySelector('mlv-drawer');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-drawer']);
    expect(results.violations.length).toBe(0);
  });
});
