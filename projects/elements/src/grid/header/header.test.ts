import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import type { Grid, GridColumn, GridHeader } from '@elements/elements/grid';
import '@elements/elements/grid/define.js';

describe('nve-grid-header', () => {
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
    element = fixture.querySelector('nve-grid-header');
    grid = fixture.querySelector('nve-grid');
    columns = Array.from(fixture.querySelectorAll('nve-grid-column'));
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', async () => {
    expect(customElements.get('nve-grid-header')).toBeDefined();
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

    const newColumn = document.createElement('nve-grid-column');
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
    expect(grid.style.getPropertyValue('--c0')).toBe('1fr');
    expect(grid.style.getPropertyValue('--c1')).toBe('1fr');
    expect(grid.style.getPropertyValue('--c2')).toBe('1fr');
    expect(grid.style.getPropertyValue('--c3')).toBe('1fr');
  });

  it('should update grid if column width changes', async () => {
    expect(grid.style.getPropertyValue('--c0')).toBe('1fr');
    expect(grid.style.getPropertyValue('--c1')).toBe('1fr');
    expect(grid.style.getPropertyValue('--c2')).toBe('1fr');
    expect(grid.style.getPropertyValue('--c3')).toBe('1fr');

    columns[0].width = '100px';
    await elementIsStable(columns[0]);
    await elementIsStable(element);

    expect(grid.style.getPropertyValue('--c0')).toBe('100px');
    expect(grid.style.getPropertyValue('--c1')).toBe('1fr');
    expect(grid.style.getPropertyValue('--c2')).toBe('1fr');
    expect(grid.style.getPropertyValue('--c3')).toBe('1fr');
  });
});
