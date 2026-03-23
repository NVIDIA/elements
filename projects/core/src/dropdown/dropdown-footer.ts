import { html, LitElement } from 'lit';
import { audit, useStyles } from '@nvidia-elements/core/internal';
import styles from './dropdown-footer.css?inline';

/**
 * @element nve-dropdown-footer
 * @description Provides a fixed area at the bottom of a dropdown menu for extra actions or supplementary controls.
 * @since 0.36.0
 * @entrypoint \@nvidia-elements/core/dropdown
 * @slot - default slot for the dropdown footer
 * @cssprop --border-top
 * @cssprop --padding
 * @cssprop --gap
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
@audit()
export class DropdownFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-dropdown-footer',
    version: '0.0.0',
    parents: ['nve-dropdown']
  };

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.slot = 'footer';
  }
}
