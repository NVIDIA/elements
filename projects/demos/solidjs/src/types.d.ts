import type { AppHeader } from '@elements/elements/app-header';
import type { Breadcrumb } from '@elements/elements/breadcrumb';
import type { Button } from '@elements/elements/button';
import type { IconButton } from '@elements/elements/icon-button';
import type { Icon } from '@elements/elements/icon';
import type { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@elements/elements/drawer';
import type { Logo } from '@elements/elements/logo';
import type { Menu, MenuItem } from '@elements/elements/menu';

type CustomEvents<K extends string> = { [key in K]: (event: CustomEvent) => void };
type CustomElement<T, K extends string = ''> = Partial<T & { children: any } & CustomEvents<`on${K}`>>;

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      ['nve-app-header']: CustomElement<AppHeader>;
      ['nve-breadcrumb']: CustomElement<Breadcrumb>;
      ['nve-button']: CustomElement<Button>;
      ['nve-icon-button']: CustomElement<IconButton>;
      ['nve-drawer']: CustomElement<Drawer>;
      ['nve-drawer-content']: CustomElement<DrawerContent>;
      ['nve-drawer-footer']: CustomElement<DrawerFooter>;
      ['nve-drawer-header']: CustomElement<DrawerHeader>;
      ['nve-icon']: CustomElement<Icon>;
      ['nve-logo']: CustomElement<Logo>;
      ['nve-menu']: CustomElement<Menu>;
      ['nve-menu-item']: CustomElement<MenuItem>;
    }
  }
}
