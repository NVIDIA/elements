import { define } from '@elements/elements/internal';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@elements/elements/drawer';
import '@elements/elements/icon-button/define.js';

define(Drawer);
define(DrawerFooter);
define(DrawerHeader);
define(DrawerContent);

declare global {
  interface HTMLElementTagNameMap {
    'nve-drawer': Drawer;
    'nve-drawer-footer': DrawerFooter;
    'nve-drawer-header': DrawerHeader;
    'nve-drawer-content': DrawerContent;
  }
}
