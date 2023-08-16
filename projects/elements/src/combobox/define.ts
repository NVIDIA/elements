import { define } from '@elements/elements/internal';
import { Combobox } from '@elements/elements/combobox';
import '@elements/elements/forms/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/menu/define.js';

define(Combobox);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-combobox': Combobox;
  }
}
