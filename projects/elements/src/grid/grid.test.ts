import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Grid } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/grid/define.js';

describe(Grid.metadata.tag, () => {
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
    element = fixture.querySelector(Grid.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Grid.metadata.tag)).toBeDefined();
  });

  it('should set to have the grid role of grid', () => {
    expect(element._internals.role).toBe('grid');
  });

  it('should generate an ID if no default is provided', () => {
    expect(element.id.startsWith('_')).toBe(true);
  });

  it('should default to no :state(scrolling) state', () => {
    expect(element.matches(':state(scrolling)')).toBe(false);
  });

  it('should enable keynav control from keynav controller', async () => {
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(0);
    expect(element.keynavGridConfig.cells[1].tabIndex).toBe(-1);
  });
});

describe(`${Grid.metadata.tag}: id check`, () => {
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
    element = fixture.querySelector(Grid.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should use existing id if one is provided', () => {
    expect(element.id).toBe('test');
  });
});

describe(`${Grid.metadata.tag}: scroll`, () => {
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
    element = fixture.querySelector(Grid.metadata.tag);
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
