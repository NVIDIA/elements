import { define } from '@elements/elements/internal';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@elements/elements/drawer';
import '@elements/elements/icon-button/define.js';

define(Drawer);
define(DrawerFooter);
define(DrawerHeader);
define(DrawerContent);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-drawer': Drawer;
    'mlv-drawer-footer': DrawerFooter;
    'mlv-drawer-header': DrawerHeader;
    'mlv-drawer-content': DrawerContent;
  }
}
