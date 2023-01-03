import { defineElement } from '@elements/elements/internal';
import { Select } from '@elements/elements/select';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

defineElement('nve-select', Select);

declare global {
  interface HTMLElementTagNameMap {
    'nve-select': Select;
  }
}
