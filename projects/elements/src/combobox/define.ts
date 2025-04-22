import { define } from '@nvidia-elements/core/internal';
import { Combobox } from '@nvidia-elements/core/combobox';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/tag/define.js';
import '@nvidia-elements/core/checkbox/define.js';

define(Combobox);

declare global {
  interface HTMLElementTagNameMap {
    'nve-combobox': Combobox;
    'mlv-combobox': Combobox;
  }
}
