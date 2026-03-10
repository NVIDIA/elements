import { define } from '@nvidia-elements/core/internal';
import { Toolbar } from '@nvidia-elements/core/toolbar';

define(Toolbar);

declare global {
  interface HTMLElementTagNameMap {
    'nve-toolbar': Toolbar;
  }
}
