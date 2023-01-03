import { defineElement } from '@elements/elements/internal';
import { Select } from '@elements/elements/select';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

defineElement('mlv-select', Select);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-select': Select;
  }
}
