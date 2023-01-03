import { defineElement } from '@elements/elements/internal';
import { Dropdown } from '@elements/elements/dropdown';
import '@elements/elements/icon-button/define.js';

defineElement('mlv-dropdown', Dropdown);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-dropdown': Dropdown;
  }
}
