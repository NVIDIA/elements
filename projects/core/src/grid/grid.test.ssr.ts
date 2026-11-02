// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Grid } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/foundations/virtual-list/define.js';

describe(Grid.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-grid>
        <nve-grid-header>
          <nve-grid-column>column 1</nve-grid-column>
          <nve-grid-column>column 2</nve-grid-column>
          <nve-grid-column>column 3</nve-grid-column>
          <nve-grid-column>column 4</nve-grid-column>
        </nve-grid-header>
        <nve-grid-row>
          <nve-grid-cell>cell 1-1</nve-grid-cell>
          <nve-grid-cell>cell 1-2</nve-grid-cell>
          <nve-grid-cell>cell 1-3</nve-grid-cell>
          <nve-grid-cell>cell 1-4</nve-grid-cell>
        </nve-grid-row>
      </nve-grid>  
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-grid')).toBe(true);
  });

  it('renders composed slots without viewport measurements', async () => {
    const result = await ssrRunner.render(html`<nve-grid aria-label="Jobs">
      <nve-grid-header><nve-grid-column>Job</nve-grid-column></nve-grid-header>
      <nve-virtual-list item-count="10000" item-height="44"></nve-virtual-list>
      <nve-grid-footer>10,000 jobs</nve-grid-footer>
    </nve-grid>`);
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('nve-virtual-list');
    expect(result).toContain('class="content" hidden');
    expect(result).not.toContain('aria-rowcount');
  });
});
