import { define } from '@elements/elements/internal';
import { Divider } from '@elements/elements/divider';

define(Divider);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-divider': Divider;
  }
}
