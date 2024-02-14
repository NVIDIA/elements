import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Grid } from '@elements/elements/grid';
import '@elements/elements/grid/define.js';

describe('nve-grid', () => {
  let fixture: HTMLElement;
  let element: Grid;

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
        <nve-grid-row>
          <nve-grid-cell>cell 2-1</nve-grid-cell>
          <nve-grid-cell>cell 2-2</nve-grid-cell>
          <nve-grid-cell>cell 2-3</nve-grid-cell>
          <nve-grid-cell>cell 2-4</nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
    `);
    element = fixture.querySelector('nve-grid');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-grid')).toBeDefined();
  });

  it('should set to have the grid role of grid', () => {
    expect(element._internals.role).toBe('grid');
  });

  it('should set internal rowgroup', () => {
    expect(element.shadowRoot.querySelector('[role=rowgroup]')).toBeTruthy();
  });

  it('should generate an ID if no default is provided', () => {
    expect(element.id.startsWith('_')).toBe(true);
  });

  it('should default to no :--scrolling state', () => {
    expect(element.matches(':--scrolling')).toBe(false);
  });
});

describe('nve-grid id check', () => {
  let fixture: HTMLElement;
  let element: Grid;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-grid id="test">
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
        <nve-grid-row>
          <nve-grid-cell>cell 2-1</nve-grid-cell>
          <nve-grid-cell>cell 2-2</nve-grid-cell>
          <nve-grid-cell>cell 2-3</nve-grid-cell>
          <nve-grid-cell>cell 2-4</nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
    `);
    element = fixture.querySelector('nve-grid');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should use existing id if one is provided', () => {
    expect(element.id).toBe('test');
  });
});

describe('nve-grid', () => {
  let fixture: HTMLElement;
  let element: Grid;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-grid style="height: 100px">
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
        <nve-grid-row>
          <nve-grid-cell>cell 2-1</nve-grid-cell>
          <nve-grid-cell>cell 2-2</nve-grid-cell>
          <nve-grid-cell>cell 2-3</nve-grid-cell>
          <nve-grid-cell>cell 2-4</nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>cell 3-1</nve-grid-cell>
          <nve-grid-cell>cell 3-2</nve-grid-cell>
          <nve-grid-cell>cell 3-3</nve-grid-cell>
          <nve-grid-cell>cell 3-4</nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>cell 4-1</nve-grid-cell>
          <nve-grid-cell>cell 4-2</nve-grid-cell>
          <nve-grid-cell>cell 4-3</nve-grid-cell>
          <nve-grid-cell>cell 4-4</nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
    `);
    element = fixture.querySelector('nve-grid');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should allow scroll position to be set', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('[part="scrollbox"]').scrollTop).toBe(0);

    element.scrollTo({ top: 20 });
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('[part="scrollbox"]').scrollTop).toBe(20);
  });
});
