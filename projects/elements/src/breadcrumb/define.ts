import { define } from '@elements/elements/internal';
import { Breadcrumb } from '@elements/elements/breadcrumb';
import '@elements/elements/icon/define.js';

define(Breadcrumb);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-breadcrumb': Breadcrumb;
  }
}
