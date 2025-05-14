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
}

@customElement('nvd-search')
export class DocsSearch extends LitElement {
  static styles = [
    unsafeCSS(layout),
    unsafeCSS(typography),
    css`
    nve-search:has(input:placeholder-shown) nve-icon-button {
      display: none;
    }`
  ];

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

  #pagefind!: Pagefind;

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

    if (this.#pagefind) {
      this.results = [];
      this.noResults = false;

      const query = await this.#pagefind.debouncedSearch(term);
      if (query !== null) {
        const queryResults = [];
        for (const result of query.results) {
          const data = await result.data();
          queryResults.push(data);
        }

        this.isSearching = false;
        // assign a new array reference to trigger reactive updates
        this.results = [...queryResults];

        if (this.results.length === 0) {
          this.noResults = true;
        }
      }
    }
  }

  render() {
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
    ${this.results.map(result => {
      const searchResult = this.#getSearchResult(result);
      const headings = this.#getHeadings(result);

      return html`
        ${this.#renderSearchResult(searchResult)}
        ${headings.map(heading => this.#renderSearchResult(heading))}
      `;
    })}
    ${
      this.noResults
        ? html`
      <div nve-layout="row gap:sm pad-top:sm pad-left:xs">
        <nve-alert>No Results Found</nve-alert>
      </div>`
        : html``
    }
  `;
  }

  #renderSearchResult(result: SearchResult) {
    return html`
      <a href="${this.baseUrl}${result.url}">
        <div nve-layout="row gap:sm pad-top:xs pad-left:xs">
          <nve-icon name="${result.icon}" size="md" style="${result.style}"></nve-icon>
          <div nve-layout="column gap:xs">
            <p nve-text="body medium">${result.title}</p>
            <p nve-text="body muted">${result.subtitle}</p>
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
      url: result.raw_url || '',
      title: result.meta?.title,
      subtitle: result.raw_url || '',
      icon: icon,
      style: style
    };
  }

  #getHeadings(result: PagefindSearchFragment): SearchResult[] {
    const headings: SearchResult[] = [];
    Object.keys(result.meta).forEach(key => {
      if (key.includes('h2_')) {
        const heading = result.meta[key];
        const headingAnchor = heading.replaceAll(' ', '-').toLowerCase();

        headings.push({
          url: result.raw_url + '#' + headingAnchor,
          title: result.meta.title + ' - ' + heading,
          subtitle: result.raw_url + '#' + headingAnchor,
          icon: 'bookmark',
          style: '--color: var(--nve-ref-color-teal-seafoam-1000);'
        });
      }
    });

    return headings;
  }
}
