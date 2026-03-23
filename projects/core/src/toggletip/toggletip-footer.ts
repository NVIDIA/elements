import { html, LitElement } from 'lit';
import { audit, useStyles } from '@nvidia-elements/core/internal';
import styles from './toggletip-footer.css?inline';

/**
 * @element nve-toggletip-footer
 * @description Provides a designated area at the bottom of a toggletip for actions or supplementary information.
 * @since 0.38.0
 * @entrypoint \@nvidia-elements/core/toggletip
 * @slot - default slot for the toggletip footer
 * @cssprop --border-top
 * @cssprop --padding
 * @cssprop --gap
 *
 */
@audit()
export class ToggletipFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-toggletip-footer',
    version: '0.0.0',
    parents: ['nve-toggletip']
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
