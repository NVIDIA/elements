// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import '@nvidia-elements/core/workspace/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/dropdown-group/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/menu/define.js';

describe('workspace SSR', () => {
  it('renders supplied panel content', async () => {
    const result = await ssrRunner.render(html`
      <nve-workspace>
        <nve-workspace-panel id="first"> <nve-workspace-panel-header>First</nve-workspace-panel-header>Preserved content</nve-workspace-panel>
      </nve-workspace>
    `);
    expect(result).toContain('Preserved content');
    expect(result).toContain('shadowroot="open"');
  });

  it('renders application invokers and their shared menu', async () => {
    const result = await ssrRunner.render(html`
      <nve-workspace>
        <nve-workspace-panel id="editor">
          <nve-workspace-panel-header>Editor<nve-icon-button slot="suffix" icon-name="more-actions" aria-label="Editor actions" popovertarget="view-actions"></nve-icon-button></nve-workspace-panel-header>
          <nve-workspace-panel-content>Editor content</nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-dropdown-group><nve-dropdown id="view-actions"><nve-menu><nve-menu-item command="--open" commandfor="editor">Open Editor</nve-menu-item></nve-menu></nve-dropdown></nve-dropdown-group>
      </nve-workspace>
    `);
    expect(result).toContain('Open Editor');
    expect(result).toContain('Editor content');
    expect(result).toContain('shadowroot="open"');
  });

  it('keeps automatic projection slots and application-native hidden in declarative markup', async () => {
    const value = JSON.stringify({
      version: 1,
      root: { type: 'group', panels: ['a', 'b'], active: 'a' },
      closed: ['a']
    });
    const result = await ssrRunner.render(html`
      <nve-workspace .value=${value}>
        <nve-workspace-panel id="a">Closed retained content</nve-workspace-panel>
        <nve-workspace-panel id="b" hidden>Application-owned hidden content</nve-workspace-panel>
      </nve-workspace>
    `);
    expect(result).toContain('Closed retained content');
    expect(result).toMatch(/<nve-workspace-panel[^>]*id="b"[^>]*hidden/);
    expect(result).not.toContain('slotassignment');
    expect(result).not.toContain('slot="workspace');
  });
});
