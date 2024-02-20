import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { GridCell } from '@elements/elements/grid';
import '@elements/elements/grid/define.js';

describe('nve-grid-cell', () => {
  let fixture: HTMLElement;
  let element: GridCell;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-grid-cell>cell</nve-grid-cell>
    `);
    element = fixture.querySelector('nve-grid-cell');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-grid-cell')).toBeDefined();
  });

  it('should set cells to have the grid role of cell', () => {
    expect(element._internals.role).toBe('gridcell');
  });
});
