import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import { state } from 'lit/decorators/state.js';
import { ifDefined } from 'lit/directives/if-defined.js';

/* eslint-disable no-inline-css/no-restricted-imports */
import layout from '@nvidia-elements/styles/layout.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';

import type { IconName } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/progress-ring/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/tag/define.js';
import '@nvidia-elements/core/dot/define.js';

export interface Pagefind {
  search: (term: string) => Promise<PagefindSearchResults>;
  debouncedSearch: (term: string) => Promise<PagefindSearchResults | null>;
  init: () => void;
}

export type PagefindSearchResults = {
  results: PagefindSearchResult[];
};

export type PagefindSearchResult = {
  id: string;
  data: () => Promise<PagefindSearchFragment>;
};

export type PagefindSearchFragment = {
  url: string;
  raw_url?: string;
  content: string;
  raw_content?: string;
  excerpt: string;
  filters: Record<string, string[]>;
  meta: Record<string, string>;
  anchors: PagefindSearchAnchor[];
};

export type PagefindSearchAnchor = {
  element: string;
  id: string;
  text?: string;
  location: number;
};

export interface SearchResult {
  url: string;
  title: string;
  subtitle: string;
  icon: IconName;
  style: string;
  excerpt?: string;
}

/** Valid section filters for the search index (shared with docs.ts for URL sync) */
export const FILTER_VALUES = ['elements', 'patterns', 'foundations'] as const;

/** Each entry renders one <nve-tag> filter chip. `null` value means "show all". */
const FILTER_OPTIONS = [
  { value: null, label: 'All', countKey: 'all' },
  { value: 'elements', label: 'Elements', countKey: 'elements' },
  { value: 'patterns', label: 'Patterns', countKey: 'patterns' },
  { value: 'foundations', label: 'Foundations', countKey: 'foundations' }
];

@customElement('nvd-search')
export class DocsSearch extends LitElement {
  static styles = [
    unsafeCSS(layout),
    unsafeCSS(typography),
    css`
    nve-search:has(input:placeholder-shown) nve-icon-button {
      display: none;
    }

    nve-tag, nve-tag nve-dot {
      cursor: pointer;
    }
    `
  ];

  /** Max number of search results to display */
  static readonly MAX_RESULTS = 20;

  /** Max size of the search cache */
  static readonly CACHE_MAX_SIZE = 50;

  @property({ type: String, attribute: 'base-url' })
  baseUrl!: string;

  /** Initial or current filter (synced from URL when set via attribute). */
  @property({ type: String, attribute: 'filter' })
  filter: string | null = null;

  @query('#search-input')
  private searchInput!: HTMLInputElement;

  @state()
  results: PagefindSearchFragment[] = [];

  @state()
  isSearching = false;

  @state()
  noResults = false;

  @state()
  private currentSearchTerm = '';

  @state()
  private activeFilter: string | null = null;

  /** Debounce delay for search input changes (in milliseconds). */
  static readonly SEARCH_DEBOUNCE_MS = 400;

  #pagefind!: Pagefind;
  #searchCache = new Map<string, PagefindSearchFragment[]>();
  #searchDebounceTimerId: ReturnType<typeof setTimeout> | undefined;

  async #handleChange(event: CustomEvent) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    this.isSearching = true;

    // Clear any pending debounced search
    if (this.#searchDebounceTimerId !== undefined) {
      clearTimeout(this.#searchDebounceTimerId);
    }

    // Debounce the search and event emission to avoid excessive updates during rapid typing
    this.#searchDebounceTimerId = setTimeout(async () => {
      this.#searchDebounceTimerId = undefined;
      this.dispatchEvent(
        new CustomEvent('search-change', {
          detail: { query: input.value, filter: this.activeFilter },
          bubbles: true,
          composed: true
        })
      );
      await this.search(input.value);
    }, DocsSearch.SEARCH_DEBOUNCE_MS);
  }

  #handleReset(event: Event) {
    event.preventDefault();

    this.results = [];
    this.searchInput.value = '';
    this.isSearching = false;
    this.noResults = false;
    this.currentSearchTerm = '';
    this.activeFilter = null;
    this.filter = null;
    this.dispatchEvent(
      new CustomEvent('search-change', { detail: { query: '', filter: null }, bubbles: true, composed: true })
    );
  }

  async #handleFocus(event: Event) {
    await this.#loadPagefind();
    event.preventDefault();

    this.dispatchEvent(new Event('search-focus', { bubbles: true, composed: true }));
  }

  #handleBlur(event: Event) {
    event.preventDefault();
    if (this.searchInput.value === '') {
      this.noResults = false;
    }

    this.dispatchEvent(new Event('search-blur', { bubbles: true, composed: true }));
  }

  /**
   * Lit lifecycle method called after property updates complete.
   * Syncs the 'filter' attribute (from URL/external) to the internal activeFilter state.
   */
  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    // When the filter attribute changes (e.g., from URL parameter),
    // check and apply it to activeFilter
    if (changedProperties.has('filter')) {
      const filterValue = this.filter;

      // Only apply if it's a valid filter value, otherwise clear it
      const isValidFilter = filterValue && FILTER_VALUES.includes(filterValue as (typeof FILTER_VALUES)[number]);

      this.activeFilter = isValidFilter ? filterValue : null;
    }
  }

  async connectedCallback() {
    super.connectedCallback();

    // Normalize base URL by removing trailing slash for consistent URL construction
    if (this.baseUrl) {
      this.baseUrl = this.baseUrl.replace(/\/$/, '');
    }

    // Apply initial filter from attribute (typically set from URL parameter on page load)
    const isValidInitialFilter = this.filter && FILTER_VALUES.includes(this.filter as (typeof FILTER_VALUES)[number]);

    if (isValidInitialFilter) {
      this.activeFilter = this.filter;
    }

    // Preload PageFind search index on idle to improve first search performance
    // Use requestIdleCallback if available (with 3s timeout), otherwise fallback to setTimeout
    if ('requestIdleCallback' in globalThis) {
      requestIdleCallback(() => this.#loadPagefind(), { timeout: 3000 });
    } else {
      setTimeout(() => this.#loadPagefind(), 2000);
    }
  }

  async #loadPagefind() {
    if (!this.#pagefind) {
      const url = `${this.baseUrl}/.pagefind/pagefind.js`;
      try {
        this.#pagefind = await import(/* @vite-ignore */ url);
        this.#pagefind.init();
      } catch {
        // ignore error as pagefind is not available in dev mode
      }
    }
  }

  async search(term: string) {
    await this.#loadPagefind();
    this.currentSearchTerm = term;

    if (this.#pagefind) {
      // Check cache first for instant results on repeated searches
      const cached = this.#searchCache.get(term);
      if (cached) {
        this.isSearching = false;
        this.results = cached;
        this.noResults = this.results.length === 0;
        this.dispatchEvent(
          new CustomEvent(this.noResults ? 'search-no-results' : 'search-results', {
            detail: this.results,
            bubbles: true,
            composed: true
          })
        );
        return;
      }

      this.results = [];
      this.noResults = false;

      const query = await this.#pagefind.debouncedSearch(term);

      if (query !== null) {
        // Limit results to MAX_RESULTS and fetch data in parallel for better performance
        const limitedResults = query.results.slice(0, DocsSearch.MAX_RESULTS);
        const queryResults = await Promise.all(limitedResults.map(result => result.data()));

        this.isSearching = false;

        // Assign a new array reference to trigger Lit's reactive updates
        this.results = [...queryResults];

        // Update cache with FIFO eviction when cache is full
        if (this.#searchCache.size >= DocsSearch.CACHE_MAX_SIZE) {
          const firstCacheKey = this.#searchCache.keys().next().value;
          if (firstCacheKey) {
            this.#searchCache.delete(firstCacheKey);
          }
        }
        this.#searchCache.set(term, this.results);

        // Notify parent components of search outcome
        if (this.results.length === 0) {
          this.noResults = true;
          this.dispatchEvent(new Event('search-no-results', { bubbles: true, composed: true }));
        } else {
          this.dispatchEvent(
            new CustomEvent('search-results', {
              detail: this.results,
              bubbles: true,
              composed: true
            })
          );
        }
      }
    }
  }

  render() {
    const filteredResults = this.#getFilteredResults();

    return html`
    <nve-search>
      <input id="search-input" type="search" aria-label="search" placeholder="search" @input="${this.#handleChange}" @focus="${this.#handleFocus}" @blur="${this.#handleBlur}" />
      ${
        this.isSearching
          ? html`
      <nve-button container="inline">
        <nve-progress-ring status="accent" size="xs"></nve-progress-ring>
      </nve-button>
      `
          : html``
      }
      <nve-icon-button id="search-reset" aria-label="clear selection" icon-name="cancel" container="inline" @click="${this.#handleReset}"></nve-icon-button>
    </nve-search>
    ${
      this.results.length > 0
        ? (() => {
            // Get result counts for each filter category to display in chip labels
            const resultCounts = this.#getFilterCounts();

            // Helper to determine if a filter is currently active
            const isFilterActive = (filterName: string | null) => this.activeFilter === filterName;

            return html`
              <div role="group" aria-label="Filter by section" nve-layout="row gap:xs pad:xs align:center align:wrap">
                ${FILTER_OPTIONS.map(({ value, label, countKey }) => {
                  const active = isFilterActive(value);
                  return html`
                    <nve-tag
                      .pressed=${active}
                      color=${ifDefined(active ? undefined : 'gray-denim')}
                      @click=${() => this.#setFilter(value)}
                    >
                      <span nve-layout="row gap:xs align:center">${label} <nve-dot size="sm" status=${ifDefined(active ? 'accent' : undefined)}>${resultCounts[countKey]}</nve-dot></span>
                    </nve-tag>
                  `;
                })}
              </div>
            `;
          })()
        : ''
    }
    ${(() => {
      const searchWords = this.currentSearchTerm
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 0);
      const allResults = filteredResults.flatMap(result => [
        this.#getSearchResult(result),
        ...this.#getHeadings(result)
      ]);

      // For multi-word searches, promote results whose title contains ALL words
      if (searchWords.length > 1) {
        allResults.sort((a, b) => {
          const aAll = searchWords.every(w => a.title.toLowerCase().includes(w));
          const bAll = searchWords.every(w => b.title.toLowerCase().includes(w));
          return aAll === bAll ? 0 : aAll ? -1 : 1;
        });
      }

      return allResults.map(r => this.#renderSearchResult(r));
    })()}
    ${
      this.noResults || (this.results.length > 0 && filteredResults.length === 0)
        ? (() => {
            // Determine if we're showing "no results at all" vs "no results in this filter"
            const hasUnfilteredResults = this.results.length > 0;
            const isFilteredView = this.activeFilter !== null;

            // Choose appropriate message
            const alertMessage = isFilteredView ? `No results in "${this.activeFilter}"` : 'No Results Found';

            return html`
              <div nve-layout="column gap:sm pad-top:sm pad-left:xs">
                <nve-alert>${alertMessage}</nve-alert>

                ${
                  // Show "Show all results" button if there are results in other filters
                  isFilteredView && hasUnfilteredResults
                    ? html`
                      <nve-button
                        container="flat"
                        size="sm"
                        @click=${() => this.#setFilter(null)}
                      >
                        Show all results
                      </nve-button>
                    `
                    : ''
                }
              </div>
            `;
          })()
        : html``
    }
  `;
  }

  /**
   * Updates the active filter and syncs it to the component state.
   * Dispatches a 'search-change' event to notify parent components of the updated state.
   * @param filter - The section filter to apply ('elements', 'patterns', 'foundations', or null for all)
   */
  #setFilter(filter: string | null) {
    this.activeFilter = filter;
    this.filter = filter;

    // Notify parent components that the search state has changed
    this.dispatchEvent(
      new CustomEvent('search-change', {
        detail: { query: this.searchInput.value, filter },
        bubbles: true,
        composed: true
      })
    );
  }

  /**
   * Filters search results based on the currently active section filter.
   * @returns Filtered array of search results, or all results if no filter is active
   */
  #getFilteredResults(): PagefindSearchFragment[] {
    // Show all results when no filter is active
    if (!this.activeFilter) {
      return this.results;
    }

    // Filter results by matching section metadata
    return this.results.filter(result => {
      const resultSection = result.meta?.section;
      return resultSection === this.activeFilter;
    });
  }

  /**
   * Counts the number of visible search results in each section category.
   * Includes both page-level results and heading sub-results to match the rendered output.
   * @returns Object with counts for all sections plus total count
   */
  #getFilterCounts(): Record<string, number> {
    let elementsCount = 0;
    let patternsCount = 0;
    let foundationsCount = 0;

    // Count results by section, including heading sub-results
    for (const result of this.results) {
      const section = result.meta?.section;
      // 1 for the page result + number of heading sub-results
      const count = 1 + this.#getHeadings(result).length;

      if (section === 'elements') {
        elementsCount += count;
      } else if (section === 'patterns') {
        patternsCount += count;
      } else if (section === 'foundations') {
        foundationsCount += count;
      }
    }

    return {
      all: elementsCount + patternsCount + foundationsCount,
      elements: elementsCount,
      patterns: patternsCount,
      foundations: foundationsCount
    };
  }

  #renderSearchResult(result: SearchResult) {
    return html`
      <a href="${this.baseUrl}${result.url}" nve-layout="column pad-top:xs">
        <div nve-layout="row gap:sm pad-top:xs pad-left:xs">
          <nve-icon name="${result.icon}" size="md" style="${result.style}"></nve-icon>
          <div nve-layout="column gap:xs">
            <p nve-text="heading xs">${result.title}</p>
            <p nve-text="body muted sm">${result.subtitle}</p>
            <!-- ${result.excerpt ? html`<p class="search-excerpt" nve-text="body sm muted" .innerHTML=${result.excerpt}></p>` : ''} -->
          </div>
        </div>
      </a>
    `;
  }

  #getSearchResult(result: PagefindSearchFragment): SearchResult {
    const isNveTag = result.meta?.tag?.includes('nve-');
    const isApiPage = result.meta?.tab === 'api';

    // Determine icon based on page type
    let icon: IconName;
    let colorToken: string;

    if (isApiPage && isNveTag) {
      // API documentation pages for components
      icon = 'code';
      colorToken = 'purple-violet';
    } else if (isNveTag) {
      // Component overview pages
      icon = 'terminal';
      colorToken = 'blue-cobalt';
    } else {
      // General documentation pages
      icon = 'book';
      colorToken = 'yellow-amber';
    }

    const style = `--color: var(--nve-ref-color-${colorToken}-1000);`;

    return {
      url: `${result.raw_url ?? ''}${this.#getQueryParam()}`,
      title: result.meta?.title,
      subtitle: result.raw_url || '',
      icon: icon,
      style: style,
      excerpt: result.excerpt
    };
  }

  #getHeadings(result: PagefindSearchFragment): SearchResult[] {
    const normalizedTerm = this.currentSearchTerm.toLowerCase();
    const MAX_HEADINGS = 3;
    const isApiPage = result.meta?.tab === 'api';

    // Determine icon and color based on parent page type
    const icon: IconName = isApiPage ? 'code' : 'bookmark';
    const colorToken = isApiPage ? 'purple-violet' : 'teal-seafoam';
    const style = `--color: var(--nve-ref-color-${colorToken}-1000);`;

    // Split search term into individual words for matching
    const searchWords = normalizedTerm.split(/\s+/).filter(word => word.length > 0);

    // Only show headings that match the search term to reduce result clutter
    const pageTitle = result.meta?.title?.toLowerCase() || '';

    return result.anchors
      .filter(anchor => {
        if (anchor.element !== 'h2' && anchor.element !== 'h3') {
          return false;
        }
        const anchorText = anchor.text?.toLowerCase();
        if (!anchorText) {
          return false;
        }

        // For multi-word searches, require ALL words to appear across the
        // combined page title + heading text so that the filter removes irrelevant
        // sub-results like "Logo - Slots" while keeping "Card - Slots".
        if (searchWords.length > 1) {
          const combinedText = pageTitle + ' ' + anchorText;
          return combinedText.includes(normalizedTerm) || searchWords.every(word => combinedText.includes(word));
        }

        // For single-word searches, match if the word appears in the heading
        return anchorText.includes(normalizedTerm) || searchWords.some(word => anchorText.includes(word));
      })
      .slice(0, MAX_HEADINGS)
      .map(anchor => ({
        url: `${result.raw_url ?? ''}${this.#getQueryParam()}#${anchor.id}`,
        title: `${result.meta?.title} - ${anchor.text}`,
        subtitle: `${result.raw_url ?? ''}#${anchor.id}`,
        icon: icon,
        style: style
      }));
  }

  /**
   * Builds URL query parameters for search result links.
   * Includes both the search query and active filter (if any).
   * This ensures clicking a result maintains the current search context.
   * @returns Query string with leading '?' or empty string if no params
   */
  #getQueryParam(): string {
    const urlParams = new URLSearchParams();

    // Add search query if present
    if (this.searchInput.value) {
      urlParams.set('q', this.searchInput.value);
    }

    // Add filter if one is active
    if (this.activeFilter) {
      urlParams.set('filter', this.activeFilter);
    }

    // Convert to query string and add leading '?' if params exist
    const queryString = urlParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}
