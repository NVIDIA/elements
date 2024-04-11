import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { GridRow } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/grid/define.js';

describe('mlv-grid-row', () => {
  let fixture: HTMLElement;
  let element: GridRow;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-grid-row>

      </mlv-grid-row>
    `);
    element = fixture.querySelector('mlv-grid-row');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-grid-row')).toBeDefined();
  });

  it('should set row to have the grid role of row', () => {
    expect(element._internals.role).toBe('row');
  });
});
