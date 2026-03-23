import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import { useStyles, attachInternals, matchesElementName, scopedRegistry } from '@nvidia-elements/core/internal';
import { Logo } from '@nvidia-elements/core/logo';
import type { IconButton } from '@nvidia-elements/core/icon-button';
import type { Button } from '@nvidia-elements/core/button';
import styles from './app-header.css?inline';

/* eslint-disable @nvidia-elements/lint/no-unstyled-typography */

/**
 * @deprecated use `nve-page-header` instead
 * @element nve-app-header
 * @description An element that appears across the top of all pages containing the application name and primary navigation.
 * @since 0.11.0
 * @slot - Use the default slot in `logo` to create an app logo badge within the app header. Include a `<span>` element inside `app-header` to change the default application title.
 * @slot title
 * @slot nav-items - For `button` and `icon-button` elements used for navigation behavior. Use the `active` attribute to show the current page.
 * @slot nav-actions - For `icon-button` elements. Places them in the supplemental actions section of the app header.
 * @cssprop --background
 * @cssprop --padding
 * @cssprop --border-bottom
 * @cssprop --color
 * @cssprop --font-weight
 * @cssprop --text-decoration
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav
 * @responsive false
 */
@scopedRegistry()
export class AppHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-app-header',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Logo.metadata.tag]: Logo
  };

  @queryAssignedElements({ slot: 'nav-items', flatten: true }) private navItems!: Button[];

  @queryAssignedElements({ slot: 'nav-actions', flatten: true }) private navActions!: IconButton[];

  @queryAssignedElements() private slottedElements!: HTMLElement[];

  get #slottedLogo() {
    return this.slottedElements.find(i => matchesElementName(i, Logo)) as Logo;
  }

  render() {
    return html`
      <div internal-host>
        <div app-branding>
          <slot @slotchange=${this.#sizeLogo}><nve-logo part="logo" size="sm" aria-label="NVIDIA"></nve-logo></slot>
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
    this.navActions?.filter(i => i.getAttribute('interaction') === 'emphasis')?.forEach(item => (item.size = 'sm'));
    [...this.navItems, ...this.navActions]
      .filter(i => !i.hasAttribute('container') && !i.hasAttribute('interaction'))
      .forEach(item => (item.container = 'flat'));
  }
}
