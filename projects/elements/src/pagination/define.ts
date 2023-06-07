import { define } from '@elements/elements/internal';
import { Pagination } from '@elements/elements/pagination';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/select/define.js';

define(Pagination);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-pagination': Pagination;
  }
}
