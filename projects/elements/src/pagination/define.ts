import { define } from '@nvidia-elements/core/internal';
import { Pagination } from '@nvidia-elements/core/pagination';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/select/define.js';

define(Pagination);

declare global {
  interface HTMLElementTagNameMap {
    'nve-pagination': Pagination;
  }
}
