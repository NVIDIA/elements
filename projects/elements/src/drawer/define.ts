import { define } from '@elements/elements/internal';
import { Drawer, DrawerFooter, DrawerHeader } from '@elements/elements/drawer';
import '@elements/elements/icon-button/define.js';

define(Drawer);
define(DrawerFooter);
define(DrawerHeader);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-drawer': Drawer;
    'mlv-drawer-footer': DrawerFooter;
    'mlv-drawer-header': DrawerHeader;
  }
}
