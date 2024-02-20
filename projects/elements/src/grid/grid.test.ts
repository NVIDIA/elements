import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Grid } from '@elements/elements/grid';
import '@elements/elements/grid/define.js';

describe('mlv-grid', () => {
  let fixture: HTMLElement;
  let element: Grid;

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
        <mlv-grid-row>
          <mlv-grid-cell>cell 2-1</mlv-grid-cell>
          <mlv-grid-cell>cell 2-2</mlv-grid-cell>
          <mlv-grid-cell>cell 2-3</mlv-grid-cell>
          <mlv-grid-cell>cell 2-4</mlv-grid-cell>
        </mlv-grid-row>
      </mlv-grid>
    `);
    element = fixture.querySelector('mlv-grid');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-grid')).toBeDefined();
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

describe('mlv-grid id check', () => {
  let fixture: HTMLElement;
  let element: Grid;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-grid id="test">
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
        <mlv-grid-row>
          <mlv-grid-cell>cell 2-1</mlv-grid-cell>
          <mlv-grid-cell>cell 2-2</mlv-grid-cell>
          <mlv-grid-cell>cell 2-3</mlv-grid-cell>
          <mlv-grid-cell>cell 2-4</mlv-grid-cell>
        </mlv-grid-row>
      </mlv-grid>
    `);
    element = fixture.querySelector('mlv-grid');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should use existing id if one is provided', () => {
    expect(element.id).toBe('test');
  });
});

describe('mlv-grid', () => {
  let fixture: HTMLElement;
  let element: Grid;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-grid style="height: 100px">
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
        <mlv-grid-row>
          <mlv-grid-cell>cell 2-1</mlv-grid-cell>
          <mlv-grid-cell>cell 2-2</mlv-grid-cell>
          <mlv-grid-cell>cell 2-3</mlv-grid-cell>
          <mlv-grid-cell>cell 2-4</mlv-grid-cell>
        </mlv-grid-row>
        <mlv-grid-row>
          <mlv-grid-cell>cell 3-1</mlv-grid-cell>
          <mlv-grid-cell>cell 3-2</mlv-grid-cell>
          <mlv-grid-cell>cell 3-3</mlv-grid-cell>
          <mlv-grid-cell>cell 3-4</mlv-grid-cell>
        </mlv-grid-row>
        <mlv-grid-row>
          <mlv-grid-cell>cell 4-1</mlv-grid-cell>
          <mlv-grid-cell>cell 4-2</mlv-grid-cell>
          <mlv-grid-cell>cell 4-3</mlv-grid-cell>
          <mlv-grid-cell>cell 4-4</mlv-grid-cell>
        </mlv-grid-row>
      </mlv-grid>
    `);
    element = fixture.querySelector('mlv-grid');
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
