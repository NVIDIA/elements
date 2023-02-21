import { html, LitElement } from 'lit';
import { useStyles } from '@elements/elements/internal';
import styles from './dialog-header.css?inline';

/**
 * @alpha
 * @element nve-dialog-header
 * @slot - default slot for the dialog header
 */
export class DialogHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-dialog-header',
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
    this.slot = 'header';
  }
}
