import { html, LitElement } from 'lit';
import { audit, useStyles } from '@nvidia-elements/core/internal';
import styles from './drawer-footer.css?inline';

/**
 * @element nve-drawer-footer
 * @description Provides a fixed action area at the bottom of a drawer for primary actions such as save or cancel.
 * @since 0.16.0
 * @entrypoint \@nvidia-elements/core/drawer
 * @slot - default slot for the drawer footer
 * @cssprop --border-top
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --min-height
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
@audit()
export class DrawerFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-drawer-footer',
    version: '0.0.0',
    parents: ['nve-drawer']
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
