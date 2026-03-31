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

  it('should have a flat container option', async () => {
    expect(element.container).toBe(undefined);
    element.container = 'flat';
    await elementIsStable(element);
    expect(element.container).toBe('flat');
    expect(element.hasAttribute('container')).toBe(true);
  });

  it('should reflect rounded attribute to DOM', async () => {
    expect(element.rounded).toBe(false);
    element.rounded = true;
    await elementIsStable(element);
    expect(element.hasAttribute('rounded')).toBe(true);
  });
});
