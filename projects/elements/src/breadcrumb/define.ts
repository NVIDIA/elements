import { define } from '@nvidia-elements/core/internal';
import { Breadcrumb } from '@nvidia-elements/core/breadcrumb';
import '@nvidia-elements/core/icon/define.js';

define(Breadcrumb);

declare global {
  interface HTMLElementTagNameMap {
    'nve-breadcrumb': Breadcrumb;
    'nve-breadcrumb': Breadcrumb;
  }
}
