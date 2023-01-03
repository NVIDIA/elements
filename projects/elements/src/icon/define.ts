import { defineElement } from '@elements/elements/internal';
import { Icon } from '@elements/elements/icon';

defineElement('nve-icon', Icon);

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon': Icon;
  }
}
