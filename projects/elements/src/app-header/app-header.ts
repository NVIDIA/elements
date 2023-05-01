import { html, LitElement, PropertyValues } from 'lit';
import { useStyles, keyNavigationList, KeynavListConfig } from '@elements/elements/internal';
import { IconButton } from '@elements/elements/icon-button';
import { Button } from '@elements/elements/button';
import styles from './app-header.css?inline';

type AppHeaderFocusable = Button | IconButton;

/**
 * @alpha
 * @element mlv-app-header
 *
 */
 @keyNavigationList<AppHeader>()
 export class AppHeader extends LitElement {
  get keynavListConfig(): KeynavListConfig {
    return {
      items: Array.from(this.querySelectorAll<AppHeaderFocusable>('mlv-button, mlv-icon-button'))
    }
  }

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-app-header',
    version: 'PACKAGE_VERSION'
  };

  get #navItems() {
    return this.querySelectorAll('[slot="nav-items"]');
  }

  get #navActions() {
    return this.querySelectorAll('[slot="nav-actions"]');
  }

  get #slottedLogo() {
    return this.querySelector('mlv-logo');
  }

  render() {
    return html`
      <div internal-host>
        <nav>
          <div app-branding>
            <slot @slotchange=${this.#sizeLogo}><mlv-logo size="sm" aria-label="NVIDIA"></mlv-logo></slot>
            <slot name="title">
              <h2>NVIDIA</h2>
            </slot>
          </div>
          <slot name="nav-items" @slotchange=${this.#updateItems}></slot>
          <slot name="nav-actions" @slotchange=${this.#updateItems}></slot>
        </nav>
      </div>
    `;
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
