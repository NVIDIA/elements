import { define } from '@nvidia-elements/core/internal';
import { Breadcrumb } from '@nvidia-elements/core/breadcrumb';

define(Breadcrumb);

declare global {
  interface HTMLElementTagNameMap {
    'nve-breadcrumb': Breadcrumb;
  }
}
