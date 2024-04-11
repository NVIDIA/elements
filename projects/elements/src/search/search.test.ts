import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { Search } from '@nvidia-elements/core/search';
import '@nvidia-elements/core/search/define.js';

describe('mlv-search', () => {
  let fixture: HTMLElement;
  let element: Search;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-search>
        <label>label</label>
        <input type="search" />
      </mlv-search>
    `);
    element = fixture.querySelector('mlv-search');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-search')).toBeDefined();
  });

  it('should render search prefix icon', () => {
    expect(element.shadowRoot.querySelector('mlv-icon-button').getAttribute('icon-name')).toBe('search');
  });
});
