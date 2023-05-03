import { define } from '@elements/elements/internal';
import { SortButton } from '@elements/elements/sort-button';
import '@elements/elements/icon/define.js';

define(SortButton);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-sort-button': SortButton;
  }
}
