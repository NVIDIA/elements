import { html, LitElement, PropertyValues } from 'lit';
import { useStyles, keyNavigationList, KeynavListConfig, attachInternals } from '@elements/elements/internal';
import type { IconButton } from '@elements/elements/icon-button';
import type { Button } from '@elements/elements/button';
import styles from './app-header.css?inline';

type AppHeaderFocusable = Button | IconButton;

/**
 * @element nve-app-header
 * @cssprop --background
 * @cssprop --padding
 * @cssprop --border-bottom
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-app-header-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=30-35&t=c9DaB6YRpkhGAp49-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav
 * @vqa false
 * @stable false
 */
 @keyNavigationList<AppHeader>()
 export class AppHeader extends LitElement {
  get keynavListConfig(): KeynavListConfig {
    return {
      items: Array.from(this.querySelectorAll<AppHeaderFocusable>('nve-button, nve-icon-button'))
    }
  }

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-app-header',
    version: 'PACKAGE_VERSION'
  };

  get #navItems() {
    return this.querySelectorAll('[slot="nav-items"]');
  }

  get #navActions() {
    return this.querySelectorAll('[slot="nav-actions"]');
  }

  get #slottedLogo() {
    return this.querySelector('nve-logo');
  }

  render() {
    return html`
      <div internal-host>
        <div app-branding>
          <slot @slotchange=${this.#sizeLogo}><nve-logo size="sm" aria-label="NVIDIA"></nve-logo></slot>
          <slot name="title">
            <h2>NVIDIA</h2>
          </slot>
        </div>
        <slot name="nav-items" @slotchange=${this.#updateItems}></slot>
        <slot name="nav-actions" @slotchange=${this.#updateItems}></slot>
      </div>
    `;
  }

  /** @private */
  declare _internals: ElementInternals;

  connectedCallback(): void {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'navigation';
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this.#sizeLogo();
    this.#updateItems();
  }

  #sizeLogo() {
    const logo = this.#slottedLogo;
    if (logo && !logo.hasAttribute('size')) {
      logo.setAttribute('size', 'sm');
    }
  }

  #updateItems() {
    const allNavItems = [].concat(Array.from(this.#navItems), Array.from(this.#navActions));
    allNavItems.filter(item => item !== null && !item.hasAttribute('interaction'))
      .forEach(item => (item as AppHeaderFocusable).interaction = 'ghost');
  }
}
