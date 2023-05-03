import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@elements/elements/test';
import type { Grid, GridColumn } from '@elements/elements/grid';
import '@elements/elements/grid/define.js';

describe('nve-grid-column', () => {
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
    grid = fixture.querySelector('nve-grid');
    columns = Array.from(fixture.querySelectorAll('nve-grid-column'));
    await elementIsStable(columns[0]);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-grid-column')).toBeDefined();
  });

  it('should set columns to have the grid role of columnheader', () => {
    expect(columns[0]._internals.role).toBe('columnheader');
  });

  it('should dispatch nve-grid-column-resize event if column width changes', async () => {
    const event = untilEvent(columns[0], 'nve-grid-column-resize');
    columns[0].width = '100px';
    expect((await event).target.width).toBe('100px');
  });

  it('should update column alignments when changed', async () => {
    columns[0].columnAlign = 'center';
    await elementIsStable(columns[0]);
    const sheets = (grid.getRootNode() as any).adoptedStyleSheets;
    expect(sheets[sheets.length - 1].cssRules[0]._cssText.includes('--justify-content: center')).toBe(true);
  });

  // right position is currently not tested due to happy-dom not being able to emulate true layout calculations
  it('should update column position', async () => {
    columns[0].position = 'fixed';
    await elementIsStable(columns[0]);
    await elementIsStable(grid);
    const sheets = (grid.getRootNode() as any).adoptedStyleSheets;

    // position
    expect(sheets[sheets.length - 1].cssRules[0]._cssText.includes('position: sticky')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0]._cssText.includes('z-index: 99')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0]._cssText.includes('right: 0px;')).toBe(true);

    // left border
    expect(sheets[sheets.length - 1].cssRules[1]._cssText.includes('var(--scroll-shadow)')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[1]._cssText.includes('clip-path: inset(0px 0 0px -4px)')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[1]._cssText.includes('--border-left: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted)')).toBe(true);
  });
});
