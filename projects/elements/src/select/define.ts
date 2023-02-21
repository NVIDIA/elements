import { define } from '@elements/elements/internal';
import { Select } from '@elements/elements/select';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

define(Select);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-select': Select;
  }
}
