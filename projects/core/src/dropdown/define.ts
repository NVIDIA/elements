import { define } from '@nvidia-elements/core/internal';
import { Dropdown, DropdownHeader, DropdownFooter } from '@nvidia-elements/core/dropdown';

define(Dropdown);
define(DropdownFooter);
define(DropdownHeader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dropdown': Dropdown;
    'nve-dropdown-footer': DropdownFooter;
    'nve-dropdown-header': DropdownHeader;
  }
}
