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
      ['mlv-app-header']: CustomElement<AppHeader>;
      ['mlv-breadcrumb']: CustomElement<Breadcrumb>;
      ['mlv-button']: CustomElement<Button>;
      ['mlv-icon-button']: CustomElement<IconButton>;
      ['mlv-drawer']: CustomElement<Drawer>;
      ['mlv-drawer-content']: CustomElement<DrawerContent>;
      ['mlv-drawer-footer']: CustomElement<DrawerFooter>;
      ['mlv-drawer-header']: CustomElement<DrawerHeader>;
      ['mlv-icon']: CustomElement<Icon>;
      ['mlv-logo']: CustomElement<Logo>;
      ['mlv-menu']: CustomElement<Menu>;
      ['mlv-menu-item']: CustomElement<MenuItem>;
    }
  }
}
