import { define } from '@nvidia-elements/core/internal';
import { Menu, MenuItem } from '@nvidia-elements/core/menu';

define(Menu);
define(MenuItem);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-menu': Menu;
    'mlv-menu-item': MenuItem;
  }
}
