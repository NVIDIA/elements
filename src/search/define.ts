import { Search } from '@elements/elements/search';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

customElements.get('mlv-search') || customElements.define('mlv-search', Search);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-search': Search;
  }
}
