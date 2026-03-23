import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { GridRow } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/grid/define.js';

describe(GridRow.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: GridRow;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-grid-row>

      </nve-grid-row>
    `);
    element = fixture.querySelector(GridRow.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(GridRow.metadata.tag)).toBeDefined();
  });

  it('should set row to have the grid role of row', () => {
    expect(element._internals.role).toBe('row');
  });
});
