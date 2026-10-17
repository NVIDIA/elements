// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import '@nvidia-elements/core/workspace/define.js';

describe('workspace SSR', () => {
  it('renders supplied panel content', async () => {
    const result = await ssrRunner.render(html`
      <nve-workspace>
        <nve-workspace-panel id="first"> <span slot="label">First</span>Preserved content</nve-workspace-panel>
      </nve-workspace>
    `);
    expect(result).toContain('Preserved content');
    expect(result).toContain('shadowroot="open"');
  });

  it('keeps automatic projection slots and application-native hidden in declarative markup', async () => {
    const value = JSON.stringify({
      version: 1,
      root: { type: 'pane', panels: ['a', 'b'], active: 'a' },
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
