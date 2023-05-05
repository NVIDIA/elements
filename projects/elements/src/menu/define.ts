import { define } from '@elements/elements/internal';
import { Menu, MenuItem } from '@elements/elements/menu';

define(Menu);
define(MenuItem);

declare global {
  interface HTMLElementTagNameMap {
    'nve-menu': Menu;
    'nve-menu-item': MenuItem;
  }
}
