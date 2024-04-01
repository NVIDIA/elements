import { define } from '@nvidia-elements/core/internal';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@nvidia-elements/core/drawer';
import '@nvidia-elements/core/icon-button/define.js';

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
