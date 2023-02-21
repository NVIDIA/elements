import { html, LitElement } from 'lit';
import { useStyles } from '@elements/elements/internal';
import styles from './dialog-footer.css?inline';

/**
 * @alpha
 * @element nve-dialog-footer
 * @slot - default slot for the dialog footer
 */
export class DialogFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-dialog-footer',
    version: 'PACKAGE_VERSION'
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
