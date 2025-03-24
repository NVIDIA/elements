import { html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators/property.js';
import { customElement } from 'lit/decorators/custom-element.js';

/* eslint-disable no-inline-css/no-restricted-imports */
import layout from '@nvidia-elements/styles/layout.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';

import type { IconName } from '@nvidia-elements/core/icon';
import type { PagefindSearchFragment } from './search.js';
import '@nvidia-elements/core/icon/define.js';

export interface SearchResult {
  url: string;
  title: string;
  subtitle: string;
  icon: IconName;
  style: string;
}

@customElement('nve-docs-search-results')
export class DocsSearchResults extends LitElement {
  static styles = [unsafeCSS(layout), unsafeCSS(typography)];

  @property({ type: String, attribute: 'base-url' })
  baseUrl!: string;

  @property({ type: Array, attribute: false })
  results: PagefindSearchFragment[] = [];

  render() {
    if (this.results.length === 0) {
      return html``;
    }

    return html`
    ${this.results.map(result => {
      const searchResult = this.#getSearchResult(result);
      const headings = this.#getHeadings(result);

      return html`
        ${this.#renderSearchResult(searchResult)}
        ${headings.map(heading => this.#renderSearchResult(heading))}
      `;
    })}
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
