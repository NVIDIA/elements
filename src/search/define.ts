import { Search } from '@elements/elements/search';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

customElements.get('nve-search') || customElements.define('nve-search', Search);

declare global {
  interface HTMLElementTagNameMap {
    'nve-search': Search;
  }
}
