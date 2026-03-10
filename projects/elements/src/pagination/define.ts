import { define } from '@nvidia-elements/core/internal';
import { Pagination } from '@nvidia-elements/core/pagination';

define(Pagination);

declare global {
  interface HTMLElementTagNameMap {
    'nve-pagination': Pagination;
  }
}
