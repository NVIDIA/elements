import type { AppHeader } from '@nvidia-elements/core/app-header';
import type { Breadcrumb } from '@nvidia-elements/core/breadcrumb';
import type { Button } from '@nvidia-elements/core/button';
import type { IconButton } from '@nvidia-elements/core/icon-button';
import type { Icon } from '@nvidia-elements/core/icon';
import type { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@nvidia-elements/core/drawer';
import type { Logo } from '@nvidia-elements/core/logo';
import type { Menu, MenuItem } from '@nvidia-elements/core/menu';

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
