import { defineElement } from '@elements/elements/internal';
import { Search } from '@elements/elements/search';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

defineElement('mlv-search', Search);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-search': Search;
  }
}
