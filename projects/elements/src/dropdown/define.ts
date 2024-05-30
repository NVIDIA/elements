import { define } from '@nvidia-elements/core/internal';
import { Dropdown, DropdownHeader, DropdownFooter } from '@nvidia-elements/core/dropdown';
import '@nvidia-elements/core/icon-button/define.js';

define(Dropdown);
define(DropdownFooter);
define(DropdownHeader);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-dropdown': Dropdown;
    'mlv-dropdown-footer': DropdownFooter;
    'mlv-dropdown-header': DropdownHeader;
  }
}
