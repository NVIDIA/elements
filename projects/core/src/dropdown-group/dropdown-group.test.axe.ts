import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { DropdownGroup } from '@nvidia-elements/core/dropdown-group';
import '@nvidia-elements/core/dropdown-group/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/icon/define.js';

describe(DropdownGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DropdownGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button popovertarget="menu-1">menu</nve-button>
      <nve-dropdown-group>
        <nve-dropdown id="menu-1">
          <nve-menu>
            <nve-menu-item popovertarget="menu-2">
              item 1-1 <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon>
            </nve-menu-item>
            <nve-menu-item>item 1-2</nve-menu-item>
            <nve-menu-item>item 1-3</nve-menu-item>
          </nve-menu>
        </nve-dropdown>
        <nve-dropdown id="menu-2" position="right">
          <nve-menu>
            <nve-menu-item>item 2-1</nve-menu-item>
            <nve-menu-item>item 2-2</nve-menu-item>
            <nve-menu-item>item 2-3</nve-menu-item>
          </nve-menu>
        </nve-dropdown>
      </nve-dropdown-group>
    `);
    element = fixture.querySelector(DropdownGroup.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([DropdownGroup.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
