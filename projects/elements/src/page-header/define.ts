import { define } from '@nvidia-elements/core/internal';
import { PageHeader } from '@nvidia-elements/core/page-header';

define(PageHeader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-page-header': PageHeader;
  }
}
