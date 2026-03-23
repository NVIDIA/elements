import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import '@nvidia-elements/core/dropdown-group/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/icon/define.js';

describe('nve-dropdown-group', () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
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

    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-dropdown-group')).toBe(true);
  });
});
