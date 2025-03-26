import { define } from '@nvidia-elements/core/internal';
import { DropdownGroup } from '@nvidia-elements/core/dropdown-group';
import '@nvidia-elements/core/icon-button/define.js';

define(DropdownGroup);
declare global {
  interface HTMLElementTagNameMap {
    'nve-dropdown-group': DropdownGroup;
  }
}
