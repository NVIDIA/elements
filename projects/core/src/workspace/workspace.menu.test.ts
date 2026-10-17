// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import type { Dropdown } from '@nvidia-elements/core/dropdown';
import type { DropdownGroup } from '@nvidia-elements/core/dropdown-group';
import { IconButton } from '@nvidia-elements/core/icon-button';
import type { MenuItem } from '@nvidia-elements/core/menu';
import type { Workspace } from './workspace.js';
import type { WorkspaceCommandSource } from './workspace-command.utils.js';
import './define.js';
import '../dropdown-group/define.js';
import '../dropdown/define.js';
import '../icon-button/define.js';
import '../menu/define.js';

describe('workspace application menus', () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  async function setup() {
    fixture = await createFixture(html`
      <nve-workspace id="menu-workspace" rearrangeable closable style="width:800px;height:350px"
        value='{"version":1,"closed":[],"root":{"type":"split","axis":"horizontal","weights":[1,1],"children":[{"type":"group","panels":["a"],"active":"a"},{"type":"group","panels":["b"],"active":"b"}]}}'>
        <nve-workspace-panel id="a"><nve-workspace-panel-header>Alpha<nve-icon-button slot="suffix" icon-name="more-actions" container="flat" aria-label="Alpha actions" value="a" popovertarget="shared-actions"></nve-icon-button></nve-workspace-panel-header><input value="retained"></nve-workspace-panel>
        <nve-workspace-panel id="b"><nve-workspace-panel-header>Beta<nve-icon-button slot="suffix" icon-name="more-actions" container="flat" aria-label="Beta actions" value="b" popovertarget="shared-actions"></nve-icon-button></nve-workspace-panel-header></nve-workspace-panel>
        <nve-dropdown-group>
          <nve-dropdown id="shared-actions"><nve-menu>
            <nve-menu-item command="--close" commandfor="menu-workspace">Close view</nve-menu-item>
            <nve-menu-item popovertarget="shared-placement">Move view</nve-menu-item>
          </nve-menu></nve-dropdown>
          <nve-dropdown id="shared-placement" position="right"><nve-menu>
            <nve-menu-item command="--place" commandfor="menu-workspace" .placement=${{ operation: 'insert', scope: 'workspace', position: 'right' }}>Right edge</nve-menu-item>
          </nve-menu></nve-dropdown>
        </nve-dropdown-group>
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    const dropdown = fixture.querySelector<Dropdown>('#shared-actions')!;
    const group = fixture.querySelector<DropdownGroup>('nve-dropdown-group')!;
    const buttons = [...fixture.querySelectorAll<IconButton>('nve-icon-button')];
    const items = [...group.querySelectorAll<MenuItem & WorkspaceCommandSource>('nve-menu-item[command]')];
    const refresh = () => {
      for (const item of items) {
        item.disabled = !workspace.isCommandAvailable(item.command ?? '', {
          value: item.value,
          placement: item.placement
        });
      }
    };
    dropdown.addEventListener('beforetoggle', event => {
      if (event.newState !== 'open' || !(event.source instanceof IconButton)) return;
      for (const item of items) item.value = event.source.value ?? '';
      refresh();
    });
    workspace.addEventListener('commandavailabilitychange', refresh);
    workspace.addEventListener('workspacechange', () => group.close());
    await elementIsStable(workspace);
    await elementIsStable(group);
    await Promise.all(buttons.map(button => elementIsStable(button)));
    await Promise.all(items.map(item => elementIsStable(item)));
    return { workspace, dropdown, group, buttons, items };
  }

  it('leaves header suffixes empty until application controls are supplied', async () => {
    fixture = await createFixture(
      html`<nve-workspace><nve-workspace-panel id="empty"><nve-workspace-panel-header>Empty</nve-workspace-panel-header></nve-workspace-panel></nve-workspace>`
    );
    const workspace = fixture.querySelector('nve-workspace')!;
    await elementIsStable(workspace);
    const header = workspace.querySelector('nve-workspace-panel-header')!;
    await elementIsStable(header);
    expect(header.shadowRoot!.querySelector('slot[name="suffix"]')!.childNodes).toHaveLength(0);
    expect(header.shadowRoot!.querySelector('nve-dropdown')).toBeNull();
    const suffix = header.shadowRoot!.querySelector<HTMLElement>('.suffix')!;
    expect(suffix.getBoundingClientRect().width).toBe(0);
    const button = document.createElement('button');
    button.slot = 'suffix';
    button.textContent = 'Action';
    header.append(button);
    await vi.waitFor(() => expect(suffix.getBoundingClientRect().width).toBeGreaterThan(0));
    button.remove();
    await vi.waitFor(() => expect(suffix.getBoundingClientRect().width).toBe(0));
  });

  it('shares one authored menu composition without changing panel ownership or arrangement', async () => {
    const { workspace, group, buttons } = await setup();
    const initial = workspace.value;
    await emulateClick(buttons[0]!);
    expect(group.parentElement).toBe(workspace);
    expect(buttons[0]!.getRootNode()).toBe(group.getRootNode());
    expect(workspace.querySelectorAll('nve-dropdown')).toHaveLength(2);
    expect(workspace.value).toBe(initial);
    expect([...workspace.children].filter(child => child.localName === 'nve-workspace-panel')).toHaveLength(2);
  });

  it('prepares the first displayed menu for each invoking panel with explicit command targets', async () => {
    const { workspace, dropdown, group, buttons, items } = await setup();
    await emulateClick(buttons[0]!);
    expect(dropdown.matches(':popover-open')).toBe(true);
    expect(items[0]!.value).toBe('a');
    expect(items[0]!.disabled).toBe(false);
    group.close();
    workspace.closable = false;
    await emulateClick(buttons[1]!);
    expect(items[0]!.value).toBe('b');
    expect(items[0]!.disabled).toBe(true);
    expect(items[0]!.commandForElement).toBe(workspace);
    group.close();
    workspace.closable = true;
    await emulateClick(buttons[1]!);
    await elementIsStable(items[0]);
    await emulateClick(items[0]!);
    await elementIsStable(workspace);
    expect(JSON.parse(workspace.value).closed).toEqual(['b']);
    expect(dropdown.matches(':popover-open')).toBe(false);
  });

  it('refreshes open menu actions when capabilities change programmatically', async () => {
    const { workspace, dropdown, buttons, items } = await setup();
    await emulateClick(buttons[0]!);
    expect(items[0]!.disabled).toBe(false);
    workspace.closable = false;
    await elementIsStable(workspace);
    await elementIsStable(items[0]);
    expect(dropdown.matches(':popover-open')).toBe(true);
    expect(items[0]!.disabled).toBe(true);
    workspace.closable = true;
    await elementIsStable(workspace);
    expect(items[0]!.disabled).toBe(false);
  });

  it('opens submenus through native invokers and returns focus to the invoking header', async () => {
    const { dropdown, group, buttons } = await setup();
    const opened = untilEvent(dropdown, 'open');
    await emulateClick(buttons[0]!);
    await opened;
    const submenu = group.querySelector<Dropdown>('#shared-placement')!;
    const trigger = group.querySelector<MenuItem>('[popovertarget="shared-placement"]')!;
    await elementIsStable(trigger);
    const submenuOpened = untilEvent(submenu, 'open');
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', bubbles: true, composed: true })
    );
    await submenuOpened;
    expect(submenu.matches(':popover-open')).toBe(true);
    expect(dropdown.matches(':popover-open')).toBe(true);
    group.close();
    await vi.waitFor(() => expect(document.activeElement).toBe(buttons[0]));
  });

  it('ignores a prepared command after its invoking panel has been removed', async () => {
    const { workspace, buttons, items } = await setup();
    await emulateClick(buttons[0]!);
    workspace.querySelector('#a')!.remove();
    await elementIsStable(workspace);
    const initial = workspace.value;
    expect(workspace.isCommandAvailable('--close', { value: items[0]!.value })).toBe(false);
    await emulateClick(items[0]!);
    await elementIsStable(workspace);
    expect(workspace.value).toBe(initial);
  });

  describe('closed popover layout', () => {
    it('excludes closed shared menus while preserving unrelated legacy dropdowns', async () => {
      const { group } = await setup();
      for (const dropdown of group.querySelectorAll('nve-dropdown')) {
        await elementIsStable(dropdown);
        expect(dropdown.matches(':popover-open')).toBe(false);
        expect(dropdown.getClientRects()).toHaveLength(0);
      }
      const legacy = document.createElement('nve-dropdown');
      legacy.textContent = 'Legacy content';
      fixture.append(legacy);
      await elementIsStable(legacy);
      await vi.waitFor(() => expect(legacy.matches(':popover-open')).toBe(true));
      expect(legacy.getBoundingClientRect().width).toBeGreaterThan(0);
    });

    it.each(['direct', 'suffix', 'wrapped'])(
      'excludes a closed standalone %s menu while preserving exit and reopen transitions',
      async location => {
        fixture = await createFixture(html`
        <nve-workspace style="width:800px;height:350px">
          <nve-workspace-panel id="standalone-panel"><nve-workspace-panel-header>Standalone
            <nve-icon-button slot="suffix" icon-name="more-actions" aria-label="Standalone actions" popovertarget="standalone-actions"></nve-icon-button>
          </nve-workspace-panel-header></nve-workspace-panel>
        </nve-workspace>
      `);
        const workspace = fixture.querySelector('nve-workspace')!;
        const header = workspace.querySelector('nve-workspace-panel-header')!;
        const button = header.querySelector('nve-icon-button')!;
        const dropdown = document.createElement('nve-dropdown');
        dropdown.id = 'standalone-actions';
        dropdown.textContent = 'Standalone actions';
        dropdown.style.setProperty('--animation-duration', '100ms');
        if (location === 'direct') {
          workspace.append(dropdown);
        } else if (location === 'suffix') {
          dropdown.slot = 'suffix';
          header.append(dropdown);
        } else {
          const wrapper = document.createElement('div');
          wrapper.slot = 'suffix';
          wrapper.append(button, dropdown);
          header.append(wrapper);
        }
        await elementIsStable(workspace);
        await elementIsStable(header);
        await elementIsStable(button);
        await elementIsStable(dropdown);
        expect(dropdown.matches(':popover-open')).toBe(false);
        expect(dropdown.getClientRects()).toHaveLength(0);

        await emulateClick(button);
        await vi.waitFor(() => expect(getComputedStyle(dropdown).opacity).toBe('1'));
        expect(dropdown.matches(':popover-open')).toBe(true);
        expect(dropdown.getBoundingClientRect().width).toBeGreaterThan(0);
        dropdown.hidePopover();
        expect(getComputedStyle(dropdown).display).toBe('block');
        dropdown.showPopover({ source: button });
        await vi.waitFor(() => expect(getComputedStyle(dropdown).opacity).toBe('1'));
        expect(dropdown.matches(':popover-open')).toBe(true);
        dropdown.hidePopover();
        await vi.waitFor(() => expect(dropdown.getClientRects()).toHaveLength(0));
      }
    );

    it('preserves the legacy fallback for a standalone dropdown inside the workspace', async () => {
      const { workspace } = await setup();
      const legacy = document.createElement('nve-dropdown');
      legacy.textContent = 'Legacy content';
      workspace.append(legacy);
      await elementIsStable(legacy);
      await vi.waitFor(() => expect(legacy.matches(':popover-open')).toBe(true));
      expect(legacy.getBoundingClientRect().width).toBeGreaterThan(0);
    });

    it('preserves exit and reopen transitions before removing settled closed layout boxes', async () => {
      const { dropdown, buttons } = await setup();
      dropdown.style.setProperty('--animation-duration', '100ms');
      await emulateClick(buttons[0]!);
      await vi.waitFor(() => expect(getComputedStyle(dropdown).opacity).toBe('1'));
      expect(dropdown.getBoundingClientRect().width).toBeGreaterThan(0);
      dropdown.hidePopover();
      expect(getComputedStyle(dropdown).display).toBe('block');
      dropdown.showPopover({ source: buttons[0]! });
      await vi.waitFor(() => expect(getComputedStyle(dropdown).opacity).toBe('1'));
      expect(dropdown.matches(':popover-open')).toBe(true);
      dropdown.hidePopover();
      await vi.waitFor(() => expect(dropdown.getClientRects()).toHaveLength(0));
    });
  });
});
