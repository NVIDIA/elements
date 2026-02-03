import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import { state } from 'lit/decorators/state.js';

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

@customElement('nvd-search')
export class DocsSearch extends LitElement {
  static styles = [
    unsafeCSS(layout),
    unsafeCSS(typography),
    css`
    nve-search:has(input:placeholder-shown) nve-icon-button {
      display: none;
    }

    /* .search-excerpt {
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .search-filters mark {
      background-color: var(--nve-ref-color-yellow-amber-500);
      color: var(--nve-ref-color-gray-1200);
      border-radius: 2px;
      padding: 0 2px;
    } */
    `
  ];

  /** Maximum number of search results to display */
  static readonly MAX_RESULTS = 20;

  /** Maximum size of the search cache */
  static readonly CACHE_MAX_SIZE = 50;

  @property({ type: String, attribute: 'base-url' })
  baseUrl!: string;

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

  #pagefind!: Pagefind;
  #searchCache = new Map<string, PagefindSearchFragment[]>();

  async #handleChange(event: CustomEvent) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    this.isSearching = true;

    this.dispatchEvent(new CustomEvent('search-change', { detail: input.value, bubbles: true, composed: true }));
    await this.search(input.value);
  }

  #handleReset(event: Event) {
    event.preventDefault();

    this.results = [];
    this.searchInput.value = '';
    this.isSearching = false;
    this.noResults = false;
    this.currentSearchTerm = '';
    this.activeFilter = null;
    this.dispatchEvent(new Event('search-reset', { bubbles: true, composed: true }));
  }

  async #handleFocus(event: Event) {
    void (await this.#loadPagefind());
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

  async connectedCallback() {
    super.connectedCallback();

    // remove trailing slash
    if (this.baseUrl) {
      this.baseUrl = this.baseUrl.replace(/\/$/, '');
    }

    // Preload PageFind on idle for faster first search
    if ('requestIdleCallback' in globalThis) {
      requestIdleCallback(() => this.#loadPagefind(), { timeout: 3000 });
    } else {
      setTimeout(() => this.#loadPagefind(), 2000);
    }
  }

  async #loadPagefind() {
    if (!this.#pagefind) {
      const url = `${this.baseUrl}/.pagefind/pagefind.js`;
      this.#pagefind = await import(/* @vite-ignore */ url);
      this.#pagefind.init();
    }
  }

  async search(term: string) {
    void (await this.#loadPagefind());
    this.currentSearchTerm = term;

    if (this.#pagefind) {
      // Check cache first for instant results on repeated searches
      const cached = this.#searchCache.get(term);
      if (cached) {
        this.isSearching = false;
        this.results = cached;
        this.noResults = this.results.length === 0;
        return;
      }

      this.results = [];
      this.noResults = false;

      const query = await this.#pagefind.debouncedSearch(term);
      if (query !== null) {
        // Limit results and fetch in parallel for better performance
        const limitedResults = query.results.slice(0, DocsSearch.MAX_RESULTS);
        const queryResults = await Promise.all(limitedResults.map(result => result.data()));

        this.isSearching = false;
        // assign a new array reference to trigger reactive updates
        this.results = [...queryResults];

        // Update cache with size limit (FIFO eviction)
        if (this.#searchCache.size >= DocsSearch.CACHE_MAX_SIZE) {
          const firstKey = this.#searchCache.keys().next().value;
          if (firstKey) this.#searchCache.delete(firstKey);
        }
        this.#searchCache.set(term, this.results);

        if (this.results.length === 0) {
          this.noResults = true;
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
        ? html`
      <div nve-layout="row gap:xs pad:xs align:wrap">
        <nve-tag color=${!this.activeFilter ? 'brand-green' : 'gray-slate'} @click=${() => this.#setFilter(null)}>All</nve-tag>
        <nve-tag color=${this.activeFilter === 'elements' ? 'brand-green' : 'gray-slate'} @click=${() => this.#setFilter('elements')}>Elements</nve-tag>
        <nve-tag color=${this.activeFilter === 'patterns' ? 'brand-green' : 'gray-slate'} @click=${() => this.#setFilter('patterns')}>Patterns</nve-tag>
        <nve-tag color=${this.activeFilter === 'foundations' ? 'brand-green' : 'gray-slate'} @click=${() => this.#setFilter('foundations')}>Foundations</nve-tag>
        <!-- <nve-tag color=${this.activeFilter === 'integrations' ? 'brand-green' : 'gray-slate'} @click=${() => this.#setFilter('integrations')}>Integrations</nve-tag> -->
      </div>
    `
        : ''
    }
    ${filteredResults.map(result => {
      const searchResult = this.#getSearchResult(result);
      const headings = this.#getHeadings(result);

      return html`
        ${this.#renderSearchResult(searchResult)}
        ${headings.map(heading => this.#renderSearchResult(heading))}
      `;
    })}
    ${
      this.noResults || (this.results.length > 0 && filteredResults.length === 0)
        ? html`
      <div nve-layout="row gap:sm pad-top:sm pad-left:xs">
        <nve-alert>${this.activeFilter ? `No results in "${this.activeFilter}"` : 'No Results Found'}</nve-alert>
      </div>`
        : html``
    }
  `;
  }

  #setFilter(filter: string | null) {
    this.activeFilter = filter;
  }

  #getFilteredResults(): PagefindSearchFragment[] {
    if (!this.activeFilter) return this.results;
    return this.results.filter(result => result.meta?.section === this.activeFilter);
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
    const icon = isNveTag ? 'terminal' : 'book';
    const style = `--color: var(--nve-ref-color-${isNveTag ? 'blue-cobalt' : 'yellow-amber'}-1000);`;

    return {
      url: result.raw_url + this.#getQueryParam() || '',
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

    // Only show headings that match the search term to reduce result clutter
    return result.anchors
      .filter(anchor => anchor.element === 'h2' && anchor.text?.toLowerCase().includes(normalizedTerm))
      .slice(0, MAX_HEADINGS)
      .map(anchor => ({
        url: result.raw_url + this.#getQueryParam() + '#' + anchor.id,
        title: result.meta.title + ' - ' + anchor.text,
        subtitle: result.raw_url + '#' + anchor.id,
        icon: 'bookmark' as IconName,
        style: '--color: var(--nve-ref-color-teal-seafoam-1000);'
      }));
  }

  #getQueryParam(): string {
    return this.searchInput.value ? `?q=${encodeURIComponent(this.searchInput.value)}` : '';
  }
}
