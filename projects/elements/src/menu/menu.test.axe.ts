import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Menu } from '@elements/elements/menu';
import '@elements/elements/menu/define.js';

describe('mlv-menu axe', () => {
  let fixture: HTMLElement;
  let element: Menu;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-menu>
        <mlv-menu-item>item 1</mlv-menu-item>
        <mlv-menu-item>item 2</mlv-menu-item>
        <mlv-menu-item>item 3</mlv-menu-item>
      </mlv-menu>
    `);
    element = fixture.querySelector('mlv-menu');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-menu']);
    expect(results.violations.length).toBe(0);
  });
});
