import { define } from '@elements/elements/internal';
import { Logo } from '@elements/elements/logo';

define(Logo);

declare global {
  interface HTMLElementTagNameMap {
    'nve-logo': Logo;
  }
}
