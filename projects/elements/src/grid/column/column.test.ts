import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@elements/elements/test';
import type { IconButton } from '@elements/elements/icon-button';
import type { Grid, GridColumn } from '@elements/elements/grid';
import '@elements/elements/grid/define.js';
import '@elements/elements/icon-button/define.js';

describe('mlv-grid-column', () => {
  let fixture: HTMLElement;
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
    grid = fixture.querySelector('mlv-grid');
    columns = Array.from(fixture.querySelectorAll('mlv-grid-column'));
    await elementIsStable(columns[0]);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-grid-column')).toBeDefined();
  });

  it('should set columns to have the grid role of columnheader', () => {
    expect(columns[0]._internals.role).toBe('columnheader');
  });

  it('should sync column ariaSort with inner sort button', async () => {
    expect(columns[0].ariaSort).toBe(null);
    const event = untilEvent(columns[0], 'sort');
    columns[0].dispatchEvent(new CustomEvent('sort', { bubbles: true, detail: 'accending' }));
    expect((await event).detail).toBe('accending');
  });

  it('should dispatch mlv-grid-column-resize event if column width changes', async () => {
    const event = untilEvent(columns[0], 'mlv-grid-column-resize');
    columns[0].width = '100px';
    expect((await event).target.width).toBe('100px');
  });

  it('should update column alignments when changed', async () => {
    columns[0].columnAlign = 'center';
    await elementIsStable(columns[0]);
    const sheets = (grid.getRootNode() as any).adoptedStyleSheets;
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('--justify-content: center')).toBe(true);
  });

  it('should update fixed left column position', async () => {
    let sheets = (grid.getRootNode() as any).adoptedStyleSheets;

    // position
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('position: sticky')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('z-index: 99')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('right: 0px;')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('left: 0px;')).toBe(false);

    // left side
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('var(--scroll-shadow)')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('clip-path: inset(0px 0 0px -4px)')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('--border-right: var(--mlv-ref-border-width-sm) solid var(--mlv-ref-border-color-muted)')).toBe(false);


    columns[0].position = 'fixed';
    await elementIsStable(columns[0]);
    await elementIsStable(grid);
    sheets = (grid.getRootNode() as any).adoptedStyleSheets;

    // position
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('position: sticky')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('z-index: 99')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('right: 0px;')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('left: 0px;')).toBe(true);

    // left side
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('var(--scroll-shadow)')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('clip-path: inset(0px 0 0px -4px)')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('--border-right: var(--mlv-ref-border-width-sm) solid var(--mlv-ref-border-color-muted)')).toBe(true);
  });

  it('should update fixed right column position', async () => {
    columns[3].position = 'fixed';
    await elementIsStable(columns[0]);
    await elementIsStable(grid);
    const sheets = (grid.getRootNode() as any).adoptedStyleSheets;

    // position
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('position: sticky')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('z-index: 99')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('right: 0px;')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[0].cssText.includes('left: 0px;')).toBe(false);

    // right side
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('var(--scroll-shadow)')).toBe(true);
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('clip-path: inset(0px 0 0px -4px)')).toBe(false);
    expect(sheets[sheets.length - 1].cssRules[1].cssText.includes('--border-left: var(--mlv-ref-border-width-sm) solid var(--mlv-ref-border-color-muted)')).toBe(true);
  });
});

describe('mlv-grid-column actions', () => {
  let fixture: HTMLElement;
  let columns: GridColumn[];
  let actions: IconButton[];

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-grid>
        <mlv-grid-header>
          <mlv-grid-column>column 1 <mlv-icon-button slot="actions"></mlv-icon-button></mlv-grid-column>
          <mlv-grid-column>column 2 <mlv-icon-button icon-name="user" slot="actions"></mlv-icon-button></mlv-grid-column>
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
    columns = Array.from(fixture.querySelectorAll('mlv-grid-column'));
    actions = Array.from(fixture.querySelectorAll('mlv-icon-button'));
    await elementIsStable(columns[0]);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should provide a default interaction and icon name to action buttons', async () => {
    columns[0].shadowRoot.querySelector('[name=actions]').dispatchEvent(new Event('slotchange'));
    await elementIsStable(actions[0]);
    expect(actions[0].interaction).toBe('flat');
    expect(actions[0].iconName).toBe('additional-actions');
  });
});