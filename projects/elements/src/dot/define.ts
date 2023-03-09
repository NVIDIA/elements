import { define } from '@elements/elements/internal';
import { Dot } from '@elements/elements/dot';

define(Dot);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-dot': Dot;
  }
}
