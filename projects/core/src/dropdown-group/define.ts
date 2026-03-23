import { define } from '@nvidia-elements/core/internal';
import { DropdownGroup } from '@nvidia-elements/core/dropdown-group';

define(DropdownGroup);
declare global {
  interface HTMLElementTagNameMap {
    'nve-dropdown-group': DropdownGroup;
  }
}
