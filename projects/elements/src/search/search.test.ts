import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Search } from '@nvidia-elements/core/search';
import '@nvidia-elements/core/search/define.js';

describe(Search.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Search;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-search>
        <label>label</label>
        <input type="search" />
      </nve-search>
    `);
    element = fixture.querySelector(Search.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Search.metadata.tag)).toBeDefined();
  });

  it('should render search prefix icon', () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('icon-name')).toBe('search');
  });
});
