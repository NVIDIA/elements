import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { GridPlaceholder } from '@elements/elements/grid';
import '@elements/elements/grid/define.js';

describe('mlv-grid-placeholder', () => {
  let fixture: HTMLElement;
  let element: GridPlaceholder;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-grid-placeholder>

      </mlv-grid-placeholder>
    `);
    element = fixture.querySelector('mlv-grid-placeholder');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-grid-placeholder')).toBeDefined();
  });

  it('should set placeholder to have the grid role of row', () => {
    expect(element._internals.role).toBe('row');
  });

  it('should set placeholder inner content to have the grid role of gridcell', () => {
    expect(element.shadowRoot.querySelector('[role=gridcell]')).toBeTruthy();
  });
});
