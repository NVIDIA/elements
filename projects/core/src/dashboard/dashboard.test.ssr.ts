// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';

import { ssrRunner } from '@internals/vite';

import '@nvidia-elements/core/dashboard/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe('dashboard SSR', () => {
  it('renders a horizontal fixed grid with supplied header, body, footer, and actions', async () => {
    const value = JSON.stringify({
      version: 1,
      grid: { flow: 'horizontal', tracks: 4 },
      items: [{ id: 'notes', column: 0, row: 0, columnSpan: 2, rowSpan: 2 }]
    });
    const result = await ssrRunner.render(html`
        <nve-dashboard .value=${value} rearrangeable fullscreenable sizing="fixed">
          <nve-dashboard-panel id="notes">
            <nve-dashboard-panel-header>
              Investigation notes
              <nve-icon-button slot="suffix" icon-name="more-actions" aria-label="Notes actions"></nve-icon-button>
            </nve-dashboard-panel-header>
            <nve-dashboard-panel-content>Application-owned content</nve-dashboard-panel-content>
            <nve-dashboard-panel-footer>Pending review<button slot="suffix" type="button">Save finding</button></nve-dashboard-panel-footer>
          </nve-dashboard-panel>
        </nve-dashboard>
      `);

    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('data-flow="horizontal"');
    expect(result).toContain('data-sizing="fixed"');
    expect(result).toContain('Investigation notes');
    expect(result).toContain('Application-owned content');
    expect(result).toContain('Pending review');
    expect(result).toContain('Save finding');
    expect(result).toContain('name="suffix"');
    expect(result).toContain('Notes actions');
    expect(result).not.toContain('slotassignment');
    expect(result).not.toContain('NaN');
    expect(result).not.toContain('Infinity');
  });

  it('preserves application-native hidden and supplied content before browser measurements', async () => {
    const result = await ssrRunner.render(html`
      <nve-dashboard>
        <nve-dashboard-panel id="retained" hidden>
          <nve-dashboard-panel-header>Retained panel</nve-dashboard-panel-header>
          <input aria-label="Retained input" value="Application value" />
        </nve-dashboard-panel>
      </nve-dashboard>
    `);

    expect(result).toMatch(/<nve-dashboard-panel[^>]*id="retained"[^>]*hidden/);
    expect(result).toContain('Application value');
    expect(result).toContain('Retained panel');
  });
});
