import { define } from '@nvidia-elements/core/internal';
import { Search } from '@nvidia-elements/core/search';
import '@nvidia-elements/core/forms/define.js';

define(Search);

declare global {
  interface HTMLElementTagNameMap {
    'nve-search': Search;
  }
}
