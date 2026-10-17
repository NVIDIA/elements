// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';

import { Workspace } from '@nvidia-elements/core/workspace';

import type { MenuItem } from '@nvidia-elements/core/menu';

import '@nvidia-elements/core/workspace/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/dropdown-group/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/textarea/define.js';

describe(Workspace.metadata.tag, () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-workspace
        id="workspace"
        closable
        fullscreenable
        groupable
        rearrangeable
        resizable
        style="width:1000px;height:600px"
        value='{"version":1,"closed":[],"root":{"type":"split","axis":"horizontal","weights":[1,4],"children":[{"type":"group","panels":["outline"],"active":"outline"},{"type":"split","axis":"vertical","weights":[3,2],"children":[{"type":"split","axis":"horizontal","weights":[3,2],"children":[{"type":"group","panels":["editor"],"active":"editor"},{"type":"group","panels":["preview"],"active":"preview"}]},{"type":"group","panels":["notes","activity","tasks"],"active":"notes"}]}]}}'>
        <nve-workspace-panel id="outline">
          <nve-workspace-panel-header>Outline</nve-workspace-panel-header>
          <nve-workspace-panel-content>Outline content</nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="editor">
          <nve-workspace-panel-header>
            Editor
            <nve-icon-button
              slot="suffix"
              icon-name="more-actions"
              aria-label="Editor actions"
              popovertarget="view-actions"></nve-icon-button>
          </nve-workspace-panel-header>
          <nve-workspace-panel-content>
            <nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea>
          </nve-workspace-panel-content>
          <nve-workspace-panel-footer>Ready</nve-workspace-panel-footer>
        </nve-workspace-panel>
        <nve-workspace-panel id="preview">
          <nve-workspace-panel-header>Preview</nve-workspace-panel-header>
          <nve-workspace-panel-content>Preview content</nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="notes">
          <nve-workspace-panel-header>Notes</nve-workspace-panel-header>
          <nve-workspace-panel-content>Notes content</nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="activity">
          <nve-workspace-panel-header>Activity</nve-workspace-panel-header>
          <nve-workspace-panel-content>Activity content</nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="tasks">
          <nve-workspace-panel-header>Tasks</nve-workspace-panel-header>
          <nve-workspace-panel-content>Tasks content</nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-dropdown-group>
          <nve-dropdown id="view-actions">
            <nve-menu>
              <nve-menu-item command="--close" commandfor="editor">Close</nve-menu-item>
              <nve-menu-item popovertarget="view-placement">Split</nve-menu-item>
            </nve-menu>
          </nve-dropdown>
          <nve-dropdown id="view-placement" position="right">
            <nve-menu><nve-menu-item>Left</nve-menu-item></nve-menu>
          </nve-dropdown>
        </nve-dropdown-group>
      </nve-workspace>
    `);
    await elementIsStable(fixture.querySelector(Workspace.metadata.tag));
    const dropdown = fixture.querySelector('nve-dropdown')!;
    await elementIsStable(dropdown);
    dropdown.showPopover({ source: fixture.querySelector('nve-icon-button')! });
    const trigger = fixture.querySelector<MenuItem>('nve-menu-item[popovertarget]')!;
    await elementIsStable(trigger);
    trigger.popoverTargetElement!.showPopover({ source: trigger });
    await elementIsStable(trigger.popoverTargetElement);
  });

  afterEach(() => removeFixture(fixture));

  it('should pass axe check', async () => {
    const results = await runAxe([Workspace.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
