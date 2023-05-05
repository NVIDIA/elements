import { html, LitElement } from 'lit';
import { useStyles, attachInternals, keyNavigationList, KeynavListConfig } from '@elements/elements/internal';
import styles from './menu.css?inline';

/**
 * @element nve-menu
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --width
 * @cssprop --min-width
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-menu-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-11&t=DjsMr3p502i01oCU-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 * @stable false
 */
@keyNavigationList<Menu>()
export class Menu extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-menu',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = { };

  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      layout: 'vertical',
      items: this.querySelectorAll<HTMLElement>('nve-menu-item')
    }
  }

  /** @private */
  declare _internals: ElementInternals;

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
  }
}
