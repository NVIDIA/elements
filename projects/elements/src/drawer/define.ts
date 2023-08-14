import { define } from '@elements/elements/internal';
import { Drawer, DrawerHeader } from '@elements/elements/drawer';
import '@elements/elements/icon-button/define.js';

define(Drawer);
define(DrawerHeader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-drawer': Drawer;
    'nve-drawer-header': DrawerHeader;
  }
}
