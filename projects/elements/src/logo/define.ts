import { define } from '@nvidia-elements/core/internal';
import { Logo } from '@nvidia-elements/core/logo';

define(Logo);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-logo': Logo;
  }
}
