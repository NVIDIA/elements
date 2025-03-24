import { html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { customElement } from 'lit/decorators/custom-element.js';

/* eslint-disable no-inline-css/no-restricted-imports */
import layout from '@nvidia-elements/styles/layout.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';

import './search-bar.js';
import './search-results.js';

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

@customElement('nve-docs-search')
export class DocsSearch extends LitElement {
  static styles = [unsafeCSS(layout), unsafeCSS(typography)];

  @property({ type: String, attribute: 'base-url' })
  baseUrl!: string;

  @state()
  results: PagefindSearchFragment[] = [];

  #pagefind!: Pagefind;

  async handleChange(event: CustomEvent) {
    event.preventDefault();

    this.dispatchEvent(new CustomEvent('search-change', { detail: event.detail, bubbles: true, composed: true }));
    await this.search(event.detail);
  }

  handleReset(event: Event) {
    event.preventDefault();

    this.results = [];
    this.dispatchEvent(new Event('search-reset', { bubbles: true, composed: true }));
  }

  handleFocus(event: Event) {
    event.preventDefault();

    this.dispatchEvent(new Event('search-focus', { bubbles: true, composed: true }));
  }

  handleBlur(event: Event) {
    event.preventDefault();

    this.dispatchEvent(new Event('search-blur', { bubbles: true, composed: true }));
  }

  async connectedCallback() {
    super.connectedCallback();

    // remove trailing slash
    if (this.baseUrl) {
      this.baseUrl = this.baseUrl.replace(/\/$/, '');
    }

    // load pagefind
    if (!this.#pagefind) {
      const url = `${this.baseUrl}/.pagefind/pagefind.js`;
      this.#pagefind = await import(/* @vite-ignore */ url);
      this.#pagefind.init();
    }
  }

  async search(term: string) {
    if (this.#pagefind) {
      this.results = [];

      const query = await this.#pagefind.debouncedSearch(term);
      if (query !== null) {
        const queryResults = [];
        for (const result of query.results) {
          const data = await result.data();
          queryResults.push(data);
        }
        // assign a new array reference to trigger reactive updates
        this.results = [...queryResults];
      }
    }
  }

  render() {
    return html`
    <section nve-layout="column pad-bottom:xs align:stretch">
      <nve-docs-search-bar @search-bar-change="${this.handleChange}" @search-bar-reset="${this.handleReset}" @search-bar-focus="${this.handleFocus}" @search-bar-blur="${this.handleBlur}"></nve-docs-search-bar>
    </section>
    <section id="search-results">
      <nve-docs-search-results nve-layout="column gap:sm align:stretch" .results="${this.results}" base-url="${this.baseUrl}"></nve-docs-search-results>
    </section>
  `;
  }
}
