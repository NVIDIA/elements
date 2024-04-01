import { define } from '@nvidia-elements/core/internal';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@nvidia-elements/core/drawer';
import '@nvidia-elements/core/icon-button/define.js';

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
