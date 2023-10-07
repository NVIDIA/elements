import { define } from '@elements/elements/internal';
import { PageLoader } from '@elements/elements/page-loader';
import '@elements/elements/progress-ring/define.js';

define(PageLoader);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-page-loader': PageLoader;
  }
}
