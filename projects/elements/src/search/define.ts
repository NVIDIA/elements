import { define } from '@elements/elements/internal';
import { Search } from '@elements/elements/search';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

define(Search);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-search': Search;
  }
}
