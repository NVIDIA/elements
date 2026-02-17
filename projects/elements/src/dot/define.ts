import { define } from '@nvidia-elements/core/internal';
import { Dot } from '@nvidia-elements/core/dot';

define(Dot);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dot': Dot;
  }
}
