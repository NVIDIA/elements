import type { PageHeader } from '@nvidia-elements/core/page-header';
import type { Breadcrumb } from '@nvidia-elements/core/breadcrumb';
import type { Button } from '@nvidia-elements/core/button';
import type { IconButton } from '@nvidia-elements/core/icon-button';
import type { Icon } from '@nvidia-elements/core/icon';
import type { Page, PagePanel, PagePanelContent, PagePanelFooter, PagePanelHeader } from '@nvidia-elements/core/page';
import type { Logo } from '@nvidia-elements/core/logo';
import type { Menu, MenuItem } from '@nvidia-elements/core/menu';

type CustomEvents<K extends string> = { [key in K]: (event: CustomEvent) => void };
type CustomElement<T, K extends string = ''> = Partial<T & { children: any } & CustomEvents<`on${K}`>>;

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      ['nve-page-header']: CustomElement<PageHeader>;
      ['nve-breadcrumb']: CustomElement<Breadcrumb>;
      ['nve-button']: CustomElement<Button>;
      ['nve-icon-button']: CustomElement<IconButton>;
      ['nve-page']: CustomElement<Page>;
      ['nve-page-panel']: CustomElement<PagePanel>;
      ['nve-page-panel-content']: CustomElement<PagePanelContent>;
      ['nve-page-panel-footer']: CustomElement<PagePanelFooter>;
      ['nve-page-panel-header']: CustomElement<PagePanelHeader>;
      ['nve-icon']: CustomElement<Icon>;
      ['nve-logo']: CustomElement<Logo>;
      ['nve-menu']: CustomElement<Menu>;
      ['nve-menu-item']: CustomElement<MenuItem>;
    }
  }
}
