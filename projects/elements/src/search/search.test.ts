import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Search } from '@elements/elements/search';
import '@elements/elements/search/define.js';

describe('nve-search', () => {
  let fixture: HTMLElement;
  let element: Search;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-search>
        <label>label</label>
        <input type="search" />
      </nve-search>
    `);
    element = fixture.querySelector('nve-search');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-search')).toBeDefined();
  });

  it('should render search prefix icon', () => {
    expect(element.shadowRoot.querySelector('nve-icon-button').getAttribute('icon-name')).toBe('search');
  });
});
