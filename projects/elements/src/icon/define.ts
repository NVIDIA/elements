import { defineElement } from '@elements/elements/internal';
import { Icon } from '@elements/elements/icon';

defineElement('mlv-icon', Icon);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-icon': Icon;
  }
}
