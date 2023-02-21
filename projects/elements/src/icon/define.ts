import { define } from '@elements/elements/internal';
import { Icon } from '@elements/elements/icon';

define(Icon);

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon': Icon;
  }
}
