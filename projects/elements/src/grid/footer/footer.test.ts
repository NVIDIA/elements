import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { GridFooter } from '@elements/elements/grid';
import '@elements/elements/grid/define.js';

describe('mlv-grid-footer', () => {
  let fixture: HTMLElement;
  let element: GridFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-grid-footer>footer</mlv-grid-footer>
    `);
    element = fixture.querySelector('mlv-grid-footer');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-grid-footer')).toBeDefined();
  });

  it('should set footer to have the grid role of row', () => {
    expect(element._internals.role).toBe('row');
  });

  it('should set footer inner content to have the grid role of gridcell', () => {
    expect(element.shadowRoot.querySelector('[role=gridcell]')).toBeTruthy();
  });
});
