import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { GridFooter } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/grid/define.js';

describe(GridFooter.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: GridFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-grid-footer>footer</nve-grid-footer>
    `);
    element = fixture.querySelector(GridFooter.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(GridFooter.metadata.tag)).toBeDefined();
  });

  it('should set footer to have the grid role of row', () => {
    expect(element._internals.role).toBe('row');
  });

  it('should set footer inner content to have the grid role of gridcell', () => {
    expect(element.shadowRoot.querySelector('[role=gridcell]')).toBeTruthy();
  });
});
