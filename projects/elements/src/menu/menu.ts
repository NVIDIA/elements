import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import type { KeynavListConfig } from '@nvidia-elements/core/internal';
import { useStyles, attachInternals, keyNavigationList, appendRootNodeStyle, audit } from '@nvidia-elements/core/internal';
import type { MenuItem } from './menu-item.js';
import styles from './menu.css?inline';
import globalStyles from './menu.global.css?inline';

/**
 * @element nve-menu
 * @description A menu is a widget that offers a list of choices to the user, such as a set of actions or functions. Menu widgets behave like native operating system menus, such as the menus that pull down from the menubars commonly found at the top of many desktop application windows. A menu is usually opened, or made visible, by activating a menu button, choosing an item in a menu that opens a sub menu, or by invoking a command, such as Shift + F10 in Windows, that opens a context specific menu. - ARIA Authoring Practices Guide
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/menu
 * @slot - default slot for `nve-menu-item`
 * @cssprop --background
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --width
 * @cssprop --min-width
 * @storybook https://NVIDIA.github.io/elements/docs/elements/menu/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-11&t=DjsMr3p502i01oCU-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
@audit()
@keyNavigationList<Menu>()
export class Menu extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-menu',
    version: '0.0.0',
    children: ['nve-menu-item']
  };

  static elementDefinitions = {};

  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      layout: 'vertical',
      items: this.items
    };
  }

  /** @private */
  declare _internals: ElementInternals;

  @queryAssignedElements() items!: MenuItem[];

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'menu';
    appendRootNodeStyle(this, globalStyles);
  }
}
