import { define } from '@nvidia-elements/core/internal';
import { Divider } from '@nvidia-elements/core/divider';

define(Divider);

declare global {
  interface HTMLElementTagNameMap {
    'nve-divider': Divider;
  }
}
