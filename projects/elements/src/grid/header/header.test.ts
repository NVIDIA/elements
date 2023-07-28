import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import type { Grid, GridColumn, GridHeader } from '@elements/elements/grid';
import '@elements/elements/grid/define.js';

describe('mlv-grid-header', () => {
  let fixture: HTMLElement;
  let element: GridHeader;
  let grid: Grid;
  let columns: GridColumn[];

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-grid>
        <mlv-grid-header>
          <mlv-grid-column>column 1</mlv-grid-column>
          <mlv-grid-column>column 2</mlv-grid-column>
          <mlv-grid-column>column 3</mlv-grid-column>
          <mlv-grid-column>column 4</mlv-grid-column>
        </mlv-grid-header>
        <mlv-grid-row>
          <mlv-grid-cell>cell 1-1</mlv-grid-cell>
          <mlv-grid-cell>cell 1-2</mlv-grid-cell>
          <mlv-grid-cell>cell 1-3</mlv-grid-cell>
          <mlv-grid-cell>cell 1-4</mlv-grid-cell>
        </mlv-grid-row>
      </mlv-grid>
    `);
    element = fixture.querySelector('mlv-grid-header');
    grid = fixture.querySelector('mlv-grid');
    columns = Array.from(fixture.querySelectorAll('mlv-grid-column'));
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', async () => {
    expect(customElements.get('mlv-grid-header')).toBeDefined();
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

    const newColumn = document.createElement('mlv-grid-column');
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
