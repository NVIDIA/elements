import { define } from '@elements/elements/internal';
import { Select } from '@elements/elements/select';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/menu/define.js';
import '@elements/elements/tag/define.js';

define(Select);

declare global {
  interface HTMLElementTagNameMap {
    'nve-select': Select;
  }
}
