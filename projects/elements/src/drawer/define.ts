import { define } from '@elements/elements/internal';
import { Drawer, DrawerFooter, DrawerHeader } from '@elements/elements/drawer';
import '@elements/elements/icon-button/define.js';

define(Drawer);
define(DrawerFooter);
define(DrawerHeader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-drawer': Drawer;
    'nve-drawer-footer': DrawerFooter;
    'nve-drawer-header': DrawerHeader;
  }
}
