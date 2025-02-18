import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { Grid, GridColumn } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe(GridColumn.metadata.tag, () => {
  let fixture: HTMLElement;
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
    grid = fixture.querySelector(Grid.metadata.tag);
    columns = Array.from(fixture.querySelectorAll(GridColumn.metadata.tag));
    await elementIsStable(columns[0]);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(GridColumn.metadata.tag)).toBeDefined();
  });

  it('should set columns to have the grid role of columnheader', () => {
    expect(columns[0]._internals.role).toBe('columnheader');
  });

  it('should sync column ariaSort with inner sort button', async () => {
    expect(columns[0].ariaSort).toBe(null);
    const event = untilEvent(columns[0], 'sort');
    columns[0].dispatchEvent(new CustomEvent('sort', { bubbles: true, detail: 'accending' }));
    expect(((await event) as CustomEvent).detail).toBe('accending');
  });

  it('should dispatch nve-grid-column-resize event if column width changes', async () => {
    const event = untilEvent<CustomEvent>(columns[0], 'nve-grid-column-resize');
    columns[0].width = '100px';
    expect(((await event).target as GridColumn).width).toBe('100px');
  });

  it('should update column alignments when changed', async () => {
    columns[0].columnAlign = 'center';
    await elementIsStable(columns[0]);
    const sheets = (grid.getRootNode() as Document).adoptedStyleSheets;
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('--justify-content: center')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('nve-grid-column:nth-child(1)')).toBe(true);
  });

  it('should update fixed left column position', async () => {
    let sheets = (grid.getRootNode() as Document).adoptedStyleSheets;

    // position
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('position: sticky')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('z-index: 99')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('right: 0px;')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('left: 0px;')).toBe(false);

    // left side
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('var(--scroll-shadow)')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('clip-path: inset(0px 0 0px -4px)')).toBe(false);
    expect(
      sheets[sheets.length - 1].cssRules[0].cssText.includes(
        '--border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted)'
      )
    ).toBe(false);

    columns[0].position = 'fixed';
    await elementIsStable(columns[0]);
    await elementIsStable(grid);
    sheets = (grid.getRootNode() as Document).adoptedStyleSheets;

    // position
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('position: sticky')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('z-index: 99')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('right: 0px;')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('left: 0px;')).toBe(true);

    // left side
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('var(--scroll-shadow)')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('clip-path: inset(0px 0 0px -4px)')).toBe(false);
    expect(
      sheets[sheets.length - 1].cssRules[1].cssText.includes(
        '--border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted)'
      )
    ).toBe(true);
  });

  it('should update fixed right column position', async () => {
    columns[3].position = 'fixed';
    await elementIsStable(columns[0]);
    await elementIsStable(grid);
    const sheets = (grid.getRootNode() as Document).adoptedStyleSheets;

    // position
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('position: sticky')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('z-index: 99')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('right: 0px;')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('left: 0px;')).toBe(false);

    // right side
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('var(--scroll-shadow)')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('clip-path: inset(0px 0 0px -4px)')).toBe(false);
    expect(
      sheets[sheets.length - 1].cssRules[1].cssText.includes(
        '--border-left: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted)'
      )
    ).toBe(true);
  });

  it('should update remove fixed styles when property or column has changed', async () => {
    columns[3].position = 'fixed';
    await elementIsStable(columns[0]);
    await elementIsStable(grid);
    const sheets = (grid.getRootNode() as Document).adoptedStyleSheets;

    // position
    expect(columns[3].hasAttribute('right')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('position: sticky')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('z-index: 99')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('right: 0px;')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('left: 0px;')).toBe(false);

    // right side
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('var(--scroll-shadow)')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('clip-path: inset(0px 0 0px -4px)')).toBe(false);
    expect(
      sheets[sheets.length - 1].cssRules[1].cssText.includes(
        '--border-left: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted)'
      )
    ).toBe(true);

    columns[3].position = '';
    await elementIsStable(columns[0]);
    await elementIsStable(grid);

    // stylesheets removed
    expect(columns[3].hasAttribute('right')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[0]).toBe(undefined);
    expect(sheets[sheets.length - 1].cssRules[1]).toBe(undefined);
  });
});
