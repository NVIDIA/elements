import { defineElement } from '@elements/elements/internal';
import { Search } from '@elements/elements/search';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

defineElement('nve-search', Search);

declare global {
  interface HTMLElementTagNameMap {
    'nve-search': Search;
  }
}
