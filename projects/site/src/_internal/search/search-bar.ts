import { html, LitElement, css } from 'lit';
import { query } from 'lit/decorators/query.js';
import { customElement } from 'lit/decorators/custom-element.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/search/define.js';

@customElement('nvd-search-bar')
export class DocsSearchBar extends LitElement {
  static styles = [
    css`
    nve-search:has(input:placeholder-shown) nve-icon-button {
      display: none;
    }`
  ];

  @query('#search-input')
  private searchInput!: HTMLInputElement;

  handleChange(event: Event) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;

    this.dispatchEvent(new CustomEvent('search-bar-change', { detail: input.value, bubbles: true, composed: true }));
  }

  handleFocus(event: Event) {
    event.preventDefault();

    this.dispatchEvent(new Event('search-bar-focus', { bubbles: true, composed: true }));
  }

  handleBlur(event: Event) {
    event.preventDefault();

    this.dispatchEvent(new Event('search-bar-blur', { bubbles: true, composed: true }));
  }

  handleReset(event: Event) {
    event.preventDefault();

    this.searchInput.value = '';
    this.dispatchEvent(new Event('search-bar-reset', { bubbles: true, composed: true }));
  }

  render() {
    return html`
    <nve-search>
      <input id="search-input" type="search" aria-label="search" placeholder="search" @input="${this.handleChange}" @focus="${this.handleFocus}" @blur="${this.handleBlur}" />
      <nve-icon-button id="search-reset" aria-label="clear selection" icon-name="cancel" container="inline" @click="${this.handleReset}"></nve-icon-button>
    </nve-search>
  `;
  }
}
