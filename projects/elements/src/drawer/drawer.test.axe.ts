import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Drawer } from '@nvidia-elements/core/drawer';
import '@nvidia-elements/core/drawer/define.js';

describe('nve-drawer axe', () => {
  let fixture: HTMLElement;
  let element: Drawer;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-drawer closable>hello</nve-drawer>
    `);
    element = fixture.querySelector('nve-drawer');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-drawer']);
    expect(results.violations.length).toBe(0);
  });
});
