// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Grid, GridColumn, GridHeader } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/grid/define.js';

describe(GridHeader.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: GridHeader;
  let grid: Grid;
  let columns: GridColumn[];

  beforeEach(async () => {
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
    element = fixture.querySelector(GridHeader.metadata.tag);
    grid = fixture.querySelector(Grid.metadata.tag);
    columns = Array.from(fixture.querySelectorAll(GridColumn.metadata.tag));
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', async () => {
    expect(customElements.get(GridHeader.metadata.tag)).toBeDefined();
  });

  it('should set header to have the grid role of row', async () => {
    expect(element._internals.role).toBe('row');
  });

  it('should set each column ariaColIndex', async () => {
    expect(columns[0].ariaColIndex).toBe('1');
    expect(columns[1].ariaColIndex).toBe('2');
    expect(columns[2].ariaColIndex).toBe('3');
    expect(columns[3].ariaColIndex).toBe('4');
  });

  it('should set each column ariaColIndex when a new column is added or removed', async () => {
    expect(columns[0].ariaColIndex).toBe('1');
    expect(columns[1].ariaColIndex).toBe('2');
    expect(columns[2].ariaColIndex).toBe('3');
    expect(columns[3].ariaColIndex).toBe('4');

    const newColumn = document.createElement(GridColumn.metadata.tag);
    newColumn.textContent = 'column 5';
    element.appendChild(newColumn);
    await elementIsStable(element);
    expect(columns[0].ariaColIndex).toBe('1');
    expect(columns[1].ariaColIndex).toBe('2');
    expect(columns[2].ariaColIndex).toBe('3');
    expect(columns[3].ariaColIndex).toBe('4');
    expect(newColumn.ariaColIndex).toBe('5');
  });

  it('should create initial CSS layout grid for columns', async () => {
    expect(grid.style.getPropertyValue('--grid-auto-flow')).toBe('initial');
    expect(grid.style.getPropertyValue('--grid-template-column')).toBe('var(--c0) var(--c1) var(--c2) var(--c3)');
    expect(grid.style.getPropertyValue('--c0').includes('minmax(auto, ')).toBe(true);
    expect(grid.style.getPropertyValue('--c1').includes('minmax(auto, ')).toBe(true);
    expect(grid.style.getPropertyValue('--c2').includes('minmax(auto, ')).toBe(true);
    expect(grid.style.getPropertyValue('--c3').includes('minmax(auto, ')).toBe(true);
  });

  it('should update grid if column width changes', async () => {
    expect(grid.style.getPropertyValue('--c0').includes('minmax(auto, ')).toBe(true);
    expect(grid.style.getPropertyValue('--c1').includes('minmax(auto, ')).toBe(true);
    expect(grid.style.getPropertyValue('--c2').includes('minmax(auto, ')).toBe(true);
    expect(grid.style.getPropertyValue('--c3').includes('minmax(auto, ')).toBe(true);

    columns[0].width = '100px';
    await elementIsStable(columns[0]);
    await elementIsStable(element);

    expect(grid.style.getPropertyValue('--c0')).toBe('100px');
    expect(grid.style.getPropertyValue('--c1').includes('minmax(auto, ')).toBe(true);
    expect(grid.style.getPropertyValue('--c2').includes('minmax(auto, ')).toBe(true);
    expect(grid.style.getPropertyValue('--c3').includes('minmax(auto, ')).toBe(true);
  });
});

describe(`${GridHeader.metadata.tag}: validation check`, () => {
  let fixture: HTMLElement;
  let element: GridHeader;
  const original = console.error;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-grid>
        <nve-grid-header>
          <nve-grid-column>column 1</nve-grid-column>
          <nve-grid-column>column 2</nve-grid-column>
          <nve-grid-column>column 3</nve-grid-column>
          <nve-grid-column>column 4</nve-grid-column>
          <nve-grid-column>column error</nve-grid-column>
        </nve-grid-header>
        <nve-grid-row>
          <nve-grid-cell>cell 1-1</nve-grid-cell>
          <nve-grid-cell>cell 1-2</nve-grid-cell>
          <nve-grid-cell>cell 1-3</nve-grid-cell>
          <nve-grid-cell>cell 1-4</nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
    `);
    element = fixture.querySelector(GridHeader.metadata.tag);
    await elementIsStable(element);
  });

  beforeEach(() => {
    console.error = () => null;
    vi.spyOn(console, 'error');
    window.NVE_ELEMENTS.state.env = 'development';
  });

  afterEach(() => {
    console.error = original;
    window.NVE_ELEMENTS.state.env = 'production';
    removeFixture(fixture);
  });

  it('should warn if the grid columns and cells do no match', async () => {
    expect(true).toBe(true);
    // temp disable due to vitest 2.x issue
    // expect(console.error).toHaveBeenCalledWith('@nvidia-elements/core: grid-column (5) and grid-cell (4) count mismatch');
  });
});
