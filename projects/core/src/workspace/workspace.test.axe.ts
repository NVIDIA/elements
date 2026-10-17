// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import '@nvidia-elements/core/workspace/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/dropdown-group/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import type { MenuItem } from '@nvidia-elements/core/menu';

describe('workspace accessibility', () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  it('exposes its active panel and label', async () => {
    fixture = await createFixture(html`
      <nve-workspace style="height:250px">
        <nve-workspace-panel id="a"> <nve-workspace-panel-header>First</nve-workspace-panel-header>First content</nve-workspace-panel>
        <nve-workspace-panel id="b"> <nve-workspace-panel-header>Second</nve-workspace-panel-header>Second content</nve-workspace-panel>
      </nve-workspace>
    `);
    await elementIsStable(fixture.querySelector('nve-workspace'));
    const report = await runAxe(['nve-workspace']);
    expect(report.violations).toEqual([]);
  });

  it('exposes application actions and coordinated secondary menus', async () => {
    fixture =
      await createFixture(html`<nve-workspace id="menu-workspace" rearrangeable closable style="height:300px;width:800px">
      <nve-workspace-panel id="menu-editor"><nve-workspace-panel-header>Editor<nve-icon-button slot="suffix" icon-name="more-actions" aria-label="Editor actions" popovertarget="view-actions"></nve-icon-button></nve-workspace-panel-header>Editor content</nve-workspace-panel>
      <nve-workspace-panel id="menu-preview"><nve-workspace-panel-header>Preview</nve-workspace-panel-header>Preview content</nve-workspace-panel>
      <nve-dropdown-group>
        <nve-dropdown id="view-actions"><nve-menu><nve-menu-item command="--close" commandfor="menu-workspace" value="menu-editor">Close editor</nve-menu-item><nve-menu-item popovertarget="view-placement">Move editor</nve-menu-item></nve-menu></nve-dropdown>
        <nve-dropdown id="view-placement" position="right"><nve-menu><nve-menu-item>Left edge</nve-menu-item></nve-menu></nve-dropdown>
      </nve-dropdown-group>
    </nve-workspace>`);
    await elementIsStable(fixture.querySelector('nve-workspace'));
    const dropdown = fixture.querySelector('nve-dropdown')!;
    await elementIsStable(dropdown);
    dropdown.showPopover({ source: fixture.querySelector('nve-icon-button')! });
    const trigger = fixture.querySelector<MenuItem>('nve-menu-item[popovertarget]')!;
    await elementIsStable(trigger);
    trigger.popoverTargetElement!.showPopover({ source: trigger });
    await elementIsStable(trigger.popoverTargetElement);
    const report = await runAxe(['nve-workspace']);
    expect(report.violations).toEqual([]);
  });
});
