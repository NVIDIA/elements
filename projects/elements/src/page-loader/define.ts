import { define } from '@nvidia-elements/core/internal';
import { PageLoader } from '@nvidia-elements/core/page-loader';

define(PageLoader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-page-loader': PageLoader;
  }
}
