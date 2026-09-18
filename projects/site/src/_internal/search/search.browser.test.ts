// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsSearch, type PagefindSearchFragment } from './search.js';

const results: PagefindSearchFragment[] = [
  {
    url: '/elements/button/',
    raw_url: '/elements/button/',
    content: '',
    excerpt: '',
    filters: {},
    meta: { section: 'elements', title: 'Button', tag: 'nve-button' },
    anchors: []
  },
  {
    url: '/patterns/card/',
    raw_url: '/patterns/card/',
    content: '',
    excerpt: '',
    filters: {},
    meta: { section: 'patterns', title: 'Card' },
    anchors: []
  }
];

describe('nvd-search', () => {
  let element: DocsSearch;

  function shadowElement<ElementType extends Element>(selector: string): ElementType {
    const match = element.shadowRoot?.querySelector<ElementType>(selector);
    if (!match) throw new Error(`Expected search shadow root to contain ${selector}`);
    return match;
  }

  beforeEach(async () => {
    element = globalThis.document.createElement('nvd-search') as DocsSearch;
    element.baseUrl = '/elements/';
    globalThis.document.body.append(element);
    await element.updateComplete;
  });

  afterEach(() => {
    vi.useRealTimers();
    element.remove();
  });

  it('defines the component and normalizes its base URL', () => {
    expect(customElements.get('nvd-search')).toBe(DocsSearch);
    expect(element.baseUrl).toBe('/elements');
  });

  it('debounces input changes and emits the current search state', async () => {
    vi.useFakeTimers();
    const search = vi.spyOn(element, 'search').mockResolvedValue();
    const searchChanges: CustomEvent[] = [];
    element.addEventListener('search-change', event => {
      if (event instanceof CustomEvent) searchChanges.push(event);
    });
    const input = shadowElement<HTMLInputElement>('#search-input');

    input.value = 'but';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    input.value = 'button';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await vi.advanceTimersByTimeAsync(DocsSearch.SEARCH_DEBOUNCE_MS);

    expect(search).toHaveBeenCalledOnce();
    expect(search).toHaveBeenCalledWith('button');
    expect(searchChanges).toHaveLength(1);
    expect(searchChanges[0]?.detail).toEqual({ query: 'button', filter: null });
  });

  it('filters rendered results by section', async () => {
    element.results = results;
    await element.updateComplete;
    const patternFilter = Array.from(element.shadowRoot?.querySelectorAll('nve-tag') ?? []).find(tag =>
      tag.textContent?.includes('Patterns')
    );
    if (!patternFilter) throw new Error('Expected a Patterns filter');

    patternFilter.click();
    await element.updateComplete;

    expect(element.filter).toBe('patterns');
    expect(Array.from(element.shadowRoot?.querySelectorAll('a') ?? []).map(link => link.textContent)).toEqual([
      expect.stringContaining('Card')
    ]);
  });

  it('emits search status events for the filtered results', async () => {
    element.results = results;
    await element.updateComplete;
    const searchResults = vi.fn();
    const searchNoResults = vi.fn();
    element.addEventListener('search-results', searchResults);
    element.addEventListener('search-no-results', searchNoResults);
    const filters = Array.from(element.shadowRoot?.querySelectorAll('nve-tag') ?? []);
    const patternFilter = filters.find(tag => tag.textContent?.includes('Patterns'));
    const foundationFilter = filters.find(tag => tag.textContent?.includes('Foundations'));
    if (!patternFilter || !foundationFilter) throw new Error('Expected Patterns and Foundations filters');

    patternFilter.click();
    foundationFilter.click();

    expect(searchResults).toHaveBeenCalledOnce();
    expect(searchNoResults).toHaveBeenCalledOnce();
  });

  it('clears results, the query, and the active filter when reset', async () => {
    element.results = results;
    await element.updateComplete;
    const patternFilter = Array.from(element.shadowRoot?.querySelectorAll('nve-tag') ?? []).find(tag =>
      tag.textContent?.includes('Patterns')
    );
    if (!patternFilter) throw new Error('Expected a Patterns filter');
    patternFilter.click();
    await element.updateComplete;
    const input = shadowElement<HTMLInputElement>('#search-input');
    input.value = 'card';

    shadowElement<HTMLElement>('#search-reset').click();
    await element.updateComplete;

    expect(input.value).toBe('');
    expect(element.results).toEqual([]);
    expect(element.filter).toBeNull();
  });
});
