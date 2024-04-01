import { define } from '@nvidia-elements/core/internal';
import { Dropdown } from '@nvidia-elements/core/dropdown';
import '@nvidia-elements/core/icon-button/define.js';

define(Dropdown);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dropdown': Dropdown;
  }
}
