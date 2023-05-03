import { define } from '@elements/elements/internal';
import { Pagination } from '@elements/elements/pagination';
import '@elements/elements/pagination/define.js';

define(Pagination);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-pagination': Pagination;
  }
}
