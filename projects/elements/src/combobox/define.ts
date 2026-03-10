import { define } from '@nvidia-elements/core/internal';
import { Combobox } from '@nvidia-elements/core/combobox';
import '@nvidia-elements/core/forms/define.js';

define(Combobox);

declare global {
  interface HTMLElementTagNameMap {
    'nve-combobox': Combobox;
  }
}
