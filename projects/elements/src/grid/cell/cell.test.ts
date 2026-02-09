import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { GridCell } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/grid/define.js';

describe(GridCell.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: GridCell;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-grid-cell>cell</nve-grid-cell>
    `);
    element = fixture.querySelector(GridCell.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(GridCell.metadata.tag)).toBeDefined();
  });

  it('should set cells to have the grid role of cell', () => {
    expect(element._internals.role).toBe('gridcell');
  });
});
