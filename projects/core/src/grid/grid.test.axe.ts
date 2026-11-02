// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Grid } from '@nvidia-elements/core/grid';
import type { VirtualList } from '@nvidia-elements/foundations/virtual-list';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/foundations/virtual-list/define.js';

describe(Grid.metadata.tag, () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    fixture = await createFixture(html`
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
    const element = fixture.querySelector<Grid>(Grid.metadata.tag);
    await elementIsStable(element);
    const results = await runAxe([Grid.metadata.tag], {
      rules: {
        // axe does not support ElementInternals AOM yet https://github.com/dequelabs/axe-core/issues/4259
        'aria-required-parent': { enabled: false },
        'aria-required-children': { enabled: false },
        'aria-allowed-attr': { enabled: false }
      }
    });
    expect(results.violations.length).toBe(0);
  });

  it('preserves grid rows through the roleless viewport wrapper', async () => {
    fixture = await createFixture(html`<nve-grid aria-label="Jobs" aria-rowcount="10002">
      <nve-grid-header aria-rowindex="1"><nve-grid-column>Job</nve-grid-column></nve-grid-header>
      <nve-virtual-list item-count="10000" item-height="44" style="--scroll-height:200px"><nve-grid-row aria-rowindex="2"><nve-grid-cell>Job 0</nve-grid-cell></nve-grid-row></nve-virtual-list>
      <nve-grid-footer aria-rowindex="10002">10,000 jobs</nve-grid-footer>
    </nve-grid>`);
    const grid = fixture.querySelector<Grid>('nve-grid')!;
    const list = fixture.querySelector<VirtualList>('nve-virtual-list')!;
    await elementIsStable(grid);
    await elementIsStable(list);
    const results = await runAxe(['nve-grid'], {
      rules: {
        // axe cannot resolve ElementInternals roles yet: https://github.com/dequelabs/axe-core/issues/4259
        'aria-required-parent': { enabled: false },
        'aria-required-children': { enabled: false },
        'aria-allowed-attr': { enabled: false }
      }
    });
    expect(results.violations, JSON.stringify(results.violations)).toHaveLength(0);
  });
});
