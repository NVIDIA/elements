import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, BaseButton, audit } from '@nvidia-elements/core/internal';
import styles from './menu-item.css?inline';

/**
 * @element nve-menu-item
 * @description Represents a selectable option within a menu, providing an interactive button for navigation or actions.
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/menu
 * @slot - default slot for content
 * @slot suffix - slot for suffix icon
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border-background
 * @cssprop --font-size
 * @cssprop --font-weight
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --width
 * @cssprop --min-height
 * @cssprop --line-height
 * @cssprop --cursor
 * @cssprop --opacity
 * @cssprop --text-transform

 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
@audit()
export class MenuItem extends BaseButton {
  static styles = useStyles([styles]);

  @property({ type: String, reflect: true }) status: 'danger';

  static readonly metadata = {
    tag: 'nve-menu-item',
    version: '0.0.0',
    parents: ['nve-menu']
  };

  static elementDefinitions = {};

  render() {
    return html`
      <div internal-host interaction-state focus-within part="_internal">
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }

  constructor() {
    super();
    this.type = 'button';
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'menuitem';
  }
}
